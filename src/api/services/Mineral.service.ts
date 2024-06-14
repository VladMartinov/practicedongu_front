import { AxiosInstance, AxiosResponse } from 'axios';
import { RestfulMineral } from '../models';

export interface MineralInstans {
  mineralsGet: () => Promise<AxiosResponse<Array<RestfulMineral>>>;
  mineralGet: (id: number) => Promise<AxiosResponse<RestfulMineral>>;
  mineralPost: (data: RestfulMineral) => Promise<AxiosResponse<RestfulMineral>>;
  mineralPut: (id: number, data: RestfulMineral) => Promise<AxiosResponse<RestfulMineral>>;
  mineralDelete: (id: number) => Promise<AxiosResponse<any>>;
}

export default (instance: AxiosInstance) => {
  return {
    mineralsGet() {
      return instance.get("/minerals");
    },
    mineralGet(id: number) {
      return instance.get(`/minerals/${id}`);
    },
    mineralPost(data: RestfulMineral) {
      return instance.post("/minerals", data);
    },
    mineralPut(id: number, data: RestfulMineral) {
      return instance.put(`/minerals/${id}`, data);
    },
    mineralDelete(id: number) {
      return instance.delete(`/minerals/${id}`);
    },
  };
};