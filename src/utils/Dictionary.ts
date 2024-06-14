import { App } from "vue";

export default {
  install(app: App) {
    const dictionaryFunction = function (): (phrase: string) => string {
      function languagePicker(phrase: string): string {
        const ruDictionary: { [key: string]: string } = {
          wireless: "Сеть",
          loading: "Загрузка",
          year: "Год",
          data: "Данные",
          statistics: "Статистика",
          about: "О приложении",
          records: "Записи",
          mineral: "Минерал",
          minerals: "Минералы",
          units: "Ед. измерения",
          statisticsByYear: "Статистика по годам",
          statisticsByYearDesc: "На данном графике будет представлена информацию по количеству добычи полезных ископаемых за определенный год.",
          statisticsByMineral: "Статистика по полезному ископаемому",
          statisticsByMineralDesc: "На данном графике будет представлена информацию по количеству добычи полезного ископаемого за весь период.",
          statisticsBestYear: "Статистика лучших",
          statisticsBestYearDesc: "На данном графике будет представлена информацию по максимальному количеству добычи полезных ископаемых за лучшие его годы.",
        };

        const enDictionary: { [key: string]: string } = {
          wireless: "Ethernet",
          loading: "Loading",
          year: "Year",
          data: "Data",
          statistics: "Statistics",
          about: "About",
          records: "Records",
          mineral: "Mineral",
          minerals: "Minerals",
          units: "Units",
          statisticsByYear: "Statistics by year",
          statisticsByYearDesc: "This graph will provide information on the amount of mineral production for a particular year.",
          statisticsByMineral: "Mineral statistics",
          statisticsByMineralDesc: "This graph will provide information on the amount of mineral production for the entire period.",
          statisticsBestYear: "Statistics of the best",
          statisticsBestYearDesc: "This graph will provide information on the maximum amount of mineral production in its best years.",
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