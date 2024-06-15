import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { RestfulRecord } from '@/api/models';
import api from '@/api';
import _ from "lodash";

export interface RecordState {
  records: Array<RestfulRecord>;
}

const state: RecordState = {
  records: []
};

const getters = {
  getRecords: (state: RecordState): Array<RestfulRecord> => state.records
};

const mutations = {
  setRecords(state: RecordState, records: Array<RestfulRecord>) {
    state.records = records;
  },
  addRecord(state: RecordState, record: RestfulRecord) {
    state.records.push(record);
  },
  updateRecord(state: RecordState, record: RestfulRecord) {
    const indexToUpdate = _.findIndex(state.records, { recordDate: record.recordDate, mineralId: record.mineralId });
    if (indexToUpdate === -1) return

    state.records = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.records, 0, indexToUpdate)),
      record,
      ..._.slice(state.records, indexToUpdate + 1, state.records.length)
    ];
  },
  deleteRecord(state: RecordState, { recordDate, mineralId } : { recordDate: Date, mineralId: number }) {
    const indexToUpdate = _.findIndex(state.records, { recordDate: recordDate, mineralId: mineralId });
    if (indexToUpdate === -1) return

    state.records = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.records, 0, indexToUpdate)),
      ..._.slice(state.records, indexToUpdate + 1, state.records.length)
    ];
  }
};

const actions = {
  getRecords({ commit }: any) {
    return api.instance.record.recordsGet()
      .then((response) => {
        commit('setRecords', response.data);
      });
  },
  postRecord({ commit }: any, record: RestfulRecord) {
    return api.instance.record.recordPost(record)
      .then((response) => {
        commit('addRecord', response.data);
      });
  },
  putRecord({ commit }: any, record: RestfulRecord) {
    return api.instance.record.recordPut(record)
      .then((response) => {
        commit('updateRecord', response.data);
      });
  },
  deleteRecord({ commit }: any, { recordDate, mineralId }: { recordDate: Date, mineralId: number }) {
    return api.instance.record.recordDelete(recordDate, mineralId)
      .then(async () => {
        await commit('deleteRecord', { recordDate, mineralId });
      });
  },
};

const record: Module<RecordState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default record;
