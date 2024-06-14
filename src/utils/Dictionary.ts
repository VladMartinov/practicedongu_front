import { App } from "vue";

export default {
  install(app: App) {
    const dictionaryFunction = function (): (phrase: string) => string {
      function languagePicker(phrase: string): string {
        const ruDictionary: { [key: string]: string } = {
          wireless: "Сеть",
          loading: "Загрузка",
          data: "Данные",
          statistics: "Статистика",
          about: "О приложении",
          records: "Записи",
          minerals: "Минералы",
          units: "Ед. измерения",
        };

        const enDictionary: { [key: string]: string } = {
          wireless: "Ethernet",
          loading: "Loading",
          data: "Data",
          statistics: "Statistics",
          about: "About",
          records: "Records",
          minerals: "Minerals",
          units: "Units",
        };

        return localStorage.getItem("lang") === "eng"
          ? enDictionary[phrase]
          : ruDictionary[phrase];
      }

      return languagePicker;
    };

    // Для Options API
    app.config.globalProperties.$dictionary = dictionaryFunction();

    // Для Composition API
    app.provide("$dictionary", dictionaryFunction());
  },
};