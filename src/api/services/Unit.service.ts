import { AxiosInstance, AxiosResponse } from 'axios';
import { RestfulUnit } from '../models';

export interface UnitInstans extends AxiosInstance {
  unitsGet: () => Promise<AxiosResponse<Array<RestfulUnit>>>;
  unitGet: (id: number) => Promise<AxiosResponse<RestfulUnit>>;
  unitPost: (data: RestfulUnit) => Promise<AxiosResponse<RestfulUnit>>;
  unitPut: (id: number, data: RestfulUnit) => Promise<AxiosResponse<RestfulUnit>>;
  unitDelete: (id: number) => Promise<AxiosResponse<any>>;
}

export default (instance: AxiosInstance) => {
  return {
    unitsGet() {
      return instance.get("/units");
    },
    unitGet(id: number) {
      return instance.get(`/units/${id}`);
    },
    unitPost(data: RestfulUnit) {
      return instance.post("/units", data);
    },
    unitPut(id: number, data: RestfulUnit) {
      return instance.put(`/units/${id}`, data);
    },
    unitDelete(id: number) {
      return instance.delete(`/units/${id}`);
    },
  };
};