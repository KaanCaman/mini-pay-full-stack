import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import tr from "./tr.json";
import en from "./en.json";

i18n.use(initReactI18next).init({
  lng: getLocales()[0].languageCode ?? "tr",
  fallbackLng: "en",
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
});

export default i18n;
