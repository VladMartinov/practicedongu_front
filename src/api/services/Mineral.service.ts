import { AxiosInstance } from 'axios';
import { RestfulMineral } from '../models';

export default (instance: AxiosInstance) => {
  return {
    mineralsGet() {
      return instance.get("/minerals/");
    },
    mineralGet(id: number) {
      return instance.get(`/minerals/${id}`);
    },
    mineralPost(data: RestfulMineral) {
      return instance.post("/minerals/", data);
    },
    mineralPut(id: number, data: RestfulMineral) {
      return instance.put(`/minerals/${id}`, data);
    },
    mineralDelete(id: number) {
      return instance.delete(`/minerals/${id}`);
    },
  };
};