import { App } from "vue";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import store from "@/store";
import guid from "@/utils/GUID";
import _ from "lodash";
import { MineralInstans } from '@/api/services/Mineral.service';
import { UnitInstans } from "./services/Unit.service";
import { RecordInstans } from "./services/Record.service";

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  guid: string;
}

export interface ExtendedAxiosInstance extends AxiosInstance {
  mineral: MineralInstans;
  unit: UnitInstans;
  record: RecordInstans;
}

const requireService = require.context("./services", false, /.service.ts$/),
      instance: ExtendedAxiosInstance = axios.create({
        baseURL: "https://localhost:7043/api",
        responseType: "json",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }) as ExtendedAxiosInstance,
      queue: ExtendedAxiosRequestConfig[] = [];

export const intercept = (fn: (interceptors: any) => void) => fn(instance.interceptors);

const debouncedPreloader = _.debounce(function () {
  // store.dispatch("setLoading", false);
}, 700);

intercept(({ request, response }) => {
  request.use((config: ExtendedAxiosRequestConfig) => {
    // store.dispatch("setLoading", true);

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
  public instance: ExtendedAxiosInstance;

  constructor() {
    this.instance = instance;

    // Register local services
    requireService
      .keys()
      .forEach((filename) => {
        const service = requireService(filename).default(this.instance);
        // Присвоение сервиса к нужному свойству `instance` 
        //  в зависимости от имени файла сервиса
        if (filename.includes('Mineral')) {
          this.instance.mineral = service;
        } else if (filename.includes('Unit')) {
          this.instance.unit = service;
        } else if (filename.includes('Record')) {
          this.instance.record = service;
        }
      });

    console.log(this.instance.mineral);
  }

  install(app: App) {
    app.config.globalProperties.$api = this;
    app.provide("$api", this);
  }
}

export default new Api();