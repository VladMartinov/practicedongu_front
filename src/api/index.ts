import { App } from "vue";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import store from "@/store";
import guid from "@/utils/GUID";
import _ from "lodash";

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  guid: string;
}

const requireService = require.context("./services", false, /.service.js$/),
      instance: AxiosInstance = axios.create({
        baseURL: "https://localhost:8080/api",
        responseType: "json",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }),
      queue: ExtendedAxiosRequestConfig[] = [];

export const intercept = (fn: (interceptors: any) => void) => fn(instance.interceptors);

const debouncedPreloader = _.debounce(function () {
  store.dispatch("setLoading", false);
}, 700);

intercept(({ request, response }) => {
  request.use((config: ExtendedAxiosRequestConfig) => {
    store.dispatch("setLoading", true);

    config.guid = guid.guidFunction().create();

    queue.push(config);

    return config;
  });

  response.use(
    (config: ExtendedAxiosRequestConfig) => {
      const { guid } = config;

      if (guid) {
        const index = queue.findIndex((x) => _.isEqual(x.guid, guid));
        ~index && queue.splice(index, 1);
      }

      if (_.isEmpty(queue)) {
        debouncedPreloader();
      }

      return config;
    },
    async (error: AxiosError) => {
      if (!error.response) return Promise.reject(error.response);

      const { guid } = error.response.config as ExtendedAxiosRequestConfig;

      if (guid) {
        const index = queue.findIndex((x) => _.isEqual(x.guid, guid));
        ~index && queue.splice(index, 1);
      }

      if (_.isEmpty(queue)) {
        debouncedPreloader();
      }

      return Promise.reject(error.response);
    }
  );
});

class Api {
  public instance: AxiosInstance;

  constructor() {
    this.instance = instance;

    // Register local services
    requireService
      .keys()
      .forEach((filename) => requireService(filename).default(instance));
  }

  install(app: App) {
    app.config.globalProperties.$api = this;
    app.provide("$api", this);
  }
}

export default new Api();