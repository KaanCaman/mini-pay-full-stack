import { makeAutoObservable, runInAction } from "mobx";
import { IApiService } from "../api/service/IApiService";
import { Transaction } from "../api/service/types";

export class WalletStore {
  private api: IApiService;

  balance: number = 0;
  transactions: Transaction[] = [];
  loading: boolean = false;
  error: string | null = null;
  hydrated: boolean = false;

  constructor(api: IApiService) {
    this.api = api;
    makeAutoObservable(this);
  }

  get formattedBalance() {
    return this.balance.toFixed(2).replace(".", ",");
  }

  fetchBalance = async () => {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      const data = await this.api.getBalance();
      runInAction(() => {
        this.balance = data.balance;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.message || "Failed to fetch balance";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  fetchHistory = async () => {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      const data = await this.api.getTransactionHistory();
      runInAction(() => {
        this.transactions = data.transactions;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err?.message || "Failed to fetch history";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  refreshAll = async () => {
    await Promise.all([this.fetchBalance(), this.fetchHistory()]);
  };
}
