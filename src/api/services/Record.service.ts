import { AxiosInstance, AxiosResponse } from 'axios';
import { RestfulRecord } from '../models';

export interface RecordInstans extends AxiosInstance {
  recordsGet: () => Promise<AxiosResponse<Array<RestfulRecord>>>;
  recordGet: (date: Date, id: number) => Promise<AxiosResponse<RestfulRecord>>;
  recordPost: (data: RestfulRecord) => Promise<AxiosResponse<RestfulRecord>>;
  recordPut: (data: RestfulRecord) => Promise<AxiosResponse<RestfulRecord>>;
  recordDelete: (date: Date, id: number) => Promise<AxiosResponse<any>>;
}

export default (instance: AxiosInstance) => {
  return {
    recordsGet() {
      return instance.get("/records/all");
    },
    recordGet(date: Date, id: number) {
      return instance.get(`/records/single?recordDate=${date}&mineralId=${id}`);
    },
    recordPost(data: RestfulRecord) {
      return instance.post("/records", data);
    },
    recordPut(data: RestfulRecord) {
      return instance.put("/records", data);
    },
    recordDelete(date: Date, id: number) {
      return instance.delete(`/records?recordDate=${date}&mineralId=${id}`);
    },
  };
};