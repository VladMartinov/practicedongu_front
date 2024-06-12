import { AxiosInstance } from 'axios';
import { RestfulRecord } from '../models';

export default (instance: AxiosInstance) => {
  return {
    recordsGet() {
      return instance.get("/records/");
    },
    recordGet(id: number) {
      return instance.get(`/records/${id}`);
    },
    recordPost(data: RestfulRecord) {
      return instance.post("/records/", data);
    },
    recordPut(id: number, data: RestfulRecord) {
      return instance.put(`/records/${id}`, data);
    },
    recordDelete(id: number) {
      return instance.delete(`/records/${id}`);
    },
  };
};