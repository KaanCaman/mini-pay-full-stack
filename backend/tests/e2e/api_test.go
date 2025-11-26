package e2e

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mini-pay-backend/internal/app"
	"mini-pay-backend/internal/config"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	Port       = 8378
	TestDBName = "test_mini_pay.db"

	// Different port for testing
	// Test için farklı port
	BaseURL = "http://127.0.0.1:8378"
)

// Helper Structs (Response Parsing için)

// APIResponse standard return from server structure
// APIResponse sunucudan dönen standart zarf yapısı
type APIResponse struct {
	Success bool            `json:"success"`
	Code    string          `json:"code"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data,omitempty"`
}

// LoginData returned after login
// LoginData login sonrası dönen data
type LoginData struct {
	Token  string `json:"token"`
	UserID uint   `json:"userID"`
}

// BalanceDAta returned after login
// BalanceData bakiye sorgusu sonucu
type BalanceData struct {
	UserID  uint    `json:"userID"`
	Balance float64 `json:"balance"`
}

// TestMain tüm testlerden ÖNCE ve SONRA çalışır
// TestMain runs BEFORE and AFTER all tests
func TestMain(m *testing.M) {
	// === SETUP (Hazırlık) ===

	// Clean old test database
	// Eski test veritabanını temizle
	cleanupTestDBFiles()

	// Set environment variables for test environment
	// Test ortamı için environment variable'ları ayarla
	os.Setenv("DB_NAME", TestDBName)
	os.Setenv("APP_PORT", fmt.Sprintf("%d", Port))

	// To avoid cluttering test output
	// Test çıktısını kirletmemesi için
	os.Setenv("LOG_LEVEL", "production")

	// Start test server in background
	// Test sunucusunu arka planda başlat
	go func() {
		cfg := config.LoadConfig() // Test ENV'lerini okuyacak / Will read test ENVs
		app, _, _ := app.CreateApp(cfg)
		app.Listen(fmt.Sprintf(":%d", Port))
	}()

	// 4. Sunucunun ayağa kalkması için bekle
	//    Wait for server to start
	time.Sleep(2 * time.Second)

	// === RUN (Testleri Çalıştır) ===
	exitCode := m.Run()

	// === TEARDOWN (Temizlik) ===

	// 5. Test veritabanını sil / Delete test database
	cleanupTestDBFiles()

	// 6. Test sonucunu döndür / Return test result
	os.Exit(exitCode)
}

// Test Suite
func TestEndToEndflow(t *testing.T) {
	// 1. Health Check
	t.Run("Check Server Health", func(t *testing.T) {
		resp, err := http.Get(BaseURL + "/")
		require.NoError(t, err, "The server is unavailable. Please restart the server!")
		defer resp.Body.Close()
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	// Create dynamic user email
	// Dinamik kullanıcı emailleri oluştur (Her testte çakışmayı önlemek için)
	timestamp := time.Now().UnixNano()
	emailUserA := fmt.Sprintf("userA_%d@test.com", timestamp)
	emailUserB := fmt.Sprintf("userB_%d@test.com", timestamp)
	password := "Fenerbahce1907"

	var tokenA, tokenB string
	var idA, idB uint

	// 2. Register
	t.Run("Register Users", func(t *testing.T) {
		// User A
		sendRequest(t, "POST", "/register", map[string]string{
			"email":    emailUserA,
			"password": password,
		}, "", http.StatusCreated)

		// User B
		sendRequest(t, "POST", "/register", map[string]string{
			"email":    emailUserB,
			"password": password,
		}, "", http.StatusCreated)
	})

	// 3. Login
	t.Run("Login Users", func(t *testing.T) {
		// Login User A
		respA := sendRequest(t, "POST", "/login", map[string]string{
			"email":    emailUserA,
			"password": password,
		}, "", http.StatusOK)

		var dataA LoginData
		json.Unmarshal(respA.Data, &dataA)
		tokenA = dataA.Token
		idA = dataA.UserID
		require.NotEmpty(t, tokenA, "User A Token should not be empty")
		require.NotZero(t, idA, "User A ID should not be zero")

		// Login User B
		respB := sendRequest(t, "POST", "/login", map[string]string{
			"email":    emailUserB,
			"password": password,
		}, "", http.StatusOK)

		var dataB LoginData
		json.Unmarshal(respB.Data, &dataB)
		tokenB = dataB.Token
		idB = dataB.UserID
		require.NotEmpty(t, tokenB, "User B Token should not be empty")
	})

	// 4. Wallet Flow
	t.Run("Wallet Operations User A", func(t *testing.T) {
		// should be zero.
		resp := sendRequest(t, "GET", "/wallet/balance", nil, tokenA, http.StatusOK)
		var bal BalanceData
		json.Unmarshal(resp.Data, &bal)
		assert.Equal(t, 0.0, bal.Balance, "The starting balance should be $0.")

		// B. Deposit 5000 -> 50.00
		sendRequest(t, "POST", "/wallet/deposit", map[string]int64{
			"amount": 5000,
		}, tokenA, http.StatusOK)

		// C. should be $50
		resp = sendRequest(t, "GET", "/wallet/balance", nil, tokenA, http.StatusOK)
		json.Unmarshal(resp.Data, &bal)
		assert.Equal(t, 50.0, bal.Balance, "The balance after the deposit should be $50.")

		// D. Cash Withdrawal (Withdraw 1000 -> $10.00)
		sendRequest(t, "POST", "/wallet/withdraw", map[string]int64{
			"amount": 1000,
		}, tokenA, http.StatusOK)

		// E. should be $40
		resp = sendRequest(t, "GET", "/wallet/balance", nil, tokenA, http.StatusOK)
		json.Unmarshal(resp.Data, &bal)
		assert.Equal(t, 40.0, bal.Balance, "The balance after withdraw should be $40.")
	})

	// 5. Negative Scenarios (Validation & Logic)
	t.Run("Negative Scenarios", func(t *testing.T) {
		// Insufficient Balance
		sendRequest(t, "POST", "/wallet/withdraw", map[string]int64{
			"amount": 9999999, // Very high amount
		}, tokenA, http.StatusBadRequest) // 400 Bad Request

		// Negative amount (Deposit)
		sendRequest(t, "POST", "/wallet/deposit", map[string]int64{
			"amount": -100,
		}, tokenA, http.StatusBadRequest)
	})

	// 6. Money Transfer A to B
	t.Run("Money Transfer A to B", func(t *testing.T) {
		transferAmount := int64(1500) // $15.00

		// Do transfer
		sendRequest(t, "POST", "/wallet/transfer", map[string]interface{}{
			"to_userID": idB,
			"amount":    transferAmount,
		}, tokenA, http.StatusOK)

		// Check A's balance (40 - 15 = 25)
		respA := sendRequest(t, "GET", "/wallet/balance", nil, tokenA, http.StatusOK)
		var balA BalanceData
		json.Unmarshal(respA.Data, &balA)
		assert.Equal(t, 25.0, balA.Balance, "Sender balance is incorrect")

		// Check B's balance (0 + 15 = 15)
		respB := sendRequest(t, "GET", "/wallet/balance", nil, tokenB, http.StatusOK)
		var balB BalanceData
		json.Unmarshal(respB.Data, &balB)
		assert.Equal(t, 15.0, balB.Balance, "Reciver balance is incorrect")
	})

	// 7. Transaction History
	t.Run("Transaction History", func(t *testing.T) {
		resp := sendRequest(t, "GET", "/wallet/history", nil, tokenA, http.StatusOK)

		// Basitçe transaction array'inin dolu olup olmadığına bakıyoruz
		// Daha derin kontrol için struct tanımlanabilir
		var historyData struct {
			Transactions []interface{} `json:"transactions"`
		}
		json.Unmarshal(resp.Data, &historyData)

		assert.GreaterOrEqual(t, len(historyData.Transactions), 3, "There must be at least 3 transactions (Deposit, Withdraw, Transfer)")
	})
}

// Helper Functions

// Helper function for sending HTTP requests in test functions.
// Takes test object, HTTP method, endpoint, request body,
// authorization token, and expected HTTP status code as parameters.

// Test fonksiyonlarında HTTP istekleri göndermek için yardımcı fonksiyon.
// Test nesnesi, HTTP metodu, endpoint, istek gövdesi, yetkilendirme token'ı ve
// beklenen HTTP durum kodunu parametre olarak alır.
func sendRequest(t *testing.T, method, endpoint string, body interface{}, token string, expectedStatus int) APIResponse {
	// Declaring an io.Reader interface to be used for reading the request body.
	// İstek gövdesini okumak için kullanılacak io.Reader interface'i tanımlanıyor.
	var bodyReader io.Reader

	// If the body parameter is not nil (meaning there is a request body), perform the operation.
	// Eğer body parametresi nil değilse (yani bir istek gövdesi varsa) işlem yap.
	if body != nil {
		// Convert the body parameter to JSON format and get it as a byte array.
		// Body parametresini JSON formatına dönüştür ve byte dizisi olarak al.
		jsonBytes, err := json.Marshal(body)

		// Check if there was an error during JSON conversion. If there is an error, fail the test.
		// JSON dönüştürme işleminde hata olup olmadığını kontrol et. Hata varsa testi başarısız yap.
		require.NoError(t, err)

		// Create a buffer from the JSON byte array and assign it to bodyReader.
		// JSON byte dizisinden bir buffer (tampon) oluştur ve bodyReader'a ata.
		bodyReader = bytes.NewBuffer(jsonBytes)
	}

	// Create a new HTTP request with the specified HTTP method, BaseURL + endpoint combination, and body.
	// Belirtilen HTTP metodu, BaseURL + endpoint birleşimi ve body ile yeni bir HTTP isteği oluştur.
	req, err := http.NewRequest(method, BaseURL+endpoint, bodyReader)

	// Check if there was an error during request creation. If there is an error, fail the test.
	// İstek oluşturma işleminde hata olup olmadığını kontrol et. Hata varsa testi başarısız yap.
	require.NoError(t, err)

	// Set the request's content type as JSON.
	// İsteğin içerik tipini JSON olarak ayarla.
	req.Header.Set("Content-Type", "application/json")

	// If the token parameter is not empty (meaning there is an authorization token), perform the operation.
	// Eğer token parametresi boş değilse (yani yetkilendirme token'ı varsa) işlem yap.
	if token != "" {
		// Set the Authorization header in "Bearer {token}" format.
		// Authorization başlığını "Bearer {token}" formatında ayarla.
		req.Header.Set("Authorization", "Bearer "+token)
	}

	// Create an HTTP client with a 5-second timeout duration.
	// 5 saniyelik zaman aşımı süresi olan bir HTTP istemcisi oluştur.
	client := &http.Client{Timeout: 5 * time.Second}

	// Send the HTTP request and get the response.
	// HTTP isteğini gönder ve yanıtı al.
	resp, err := client.Do(req)

	// Check if there was an error during request sending. If there is an error, fail the test.
	// İstek gönderme işleminde hata olup olmadığını kontrol et. Hata varsa testi başarısız yap.
	require.NoError(t, err)

	// Close the response body when the function ends (to prevent memory leaks).
	// Fonksiyon sonlandığında yanıt gövdesini kapat (bellek sızıntısını önlemek için).
	defer resp.Body.Close()

	// Read all content of the response body as a byte array. Error is ignored (_).
	// Yanıt gövdesinin tüm içeriğini byte dizisi olarak oku. Hata göz ardı ediliyor (_).
	respBytes, _ := io.ReadAll(resp.Body)

	// Compare the expected HTTP status code with the received status code.
	// If they don't match, fail the test while printing the response content.
	// Beklenen HTTP durum kodu ile gelen durum kodunu karşılaştır.
	// Eşleşmezse yanıt içeriğini de yazdırarak testi başarısız yap.
	require.Equal(t, expectedStatus, resp.StatusCode, "Invalid Status Code. Response: %s", string(respBytes))

	// Declare a variable of type APIResponse to hold the API response.
	// API yanıtını tutacak APIResponse tipinde bir değişken tanımla.
	var apiResp APIResponse

	// If the response body is not empty, perform the operation.
	// Eğer yanıt gövdesi boş değilse işlem yap.
	if len(respBytes) > 0 {

		// Convert the JSON formatted response byte array into an APIResponse struct.
		// JSON formatındaki yanıt byte dizisini APIResponse struct'ına dönüştür.
		err = json.Unmarshal(respBytes, &apiResp)

		// Check if there was an error during JSON parsing.
		// If there is an error, fail the test while printing the raw response.
		// JSON parse işleminde hata olup olmadığını kontrol et.
		// Hata varsa ham yanıtı da yazdırarak testi başarısız yap.
		require.NoError(t, err, "JSON parse error: %s", string(respBytes))
	}

	return apiResp
}

// cleanup test-db files
func cleanupTestDBFiles() {
	os.Remove(TestDBName)
	os.Remove(fmt.Sprint(TestDBName, "-shm"))
	os.Remove(fmt.Sprint(TestDBName, "-wal"))
}
