import { AxiosInstance } from 'axios';
import { RestfulUnit } from '../models';

export default (instance: AxiosInstance) => {
  return {
    unitsGet() {
      return instance.get("/units/");
    },
    unitGet(id: number) {
      return instance.get(`/units/${id}`);
    },
    unitPost(data: RestfulUnit) {
      return instance.post("/units/", data);
    },
    unitPut(id: number, data: RestfulUnit) {
      return instance.put(`/units/${id}`, data);
    },
    unitDelete(id: number) {
      return instance.delete(`/units/${id}`);
    },
  };
};