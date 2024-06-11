import { App } from "vue";

const guidFunction = function () {
  function GUID() {
    let guid: string;

    do {
      guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    } while (!GUID.register(guid));

    return guid;
  }

  GUID.create = (): string => GUID();

  const list: string[] = [];

  GUID.exists = (guid: string): boolean => !!~list.indexOf(guid);

  GUID.register = (guid: string): boolean => {
    if (GUID.exists(guid)) {
      return false;
    } else {
      list.push(guid);
      return true;
    }
  };

  return GUID;
};

export default {
  install(app: App) {
    // Для Options API
    app.config.globalProperties.$GUID = guidFunction();

    // Для Composition API
    app.provide("$GUID", guidFunction());
  },
  guidFunction,
};