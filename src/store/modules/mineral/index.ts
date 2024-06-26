import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { RestfulMineral } from '@/api/models';
import api from '@/api';
import _ from "lodash";

export interface MineralState {
  minerals: Array<RestfulMineral>;
}

const state: MineralState = {
  minerals: []
};

const getters = {
  getMinerals: (state: MineralState) => state.minerals
};

const mutations = {
  setMinerals(state: MineralState, minerals: Array<RestfulMineral>) {
    state.minerals = minerals;
  },
  addMineral(state: MineralState, mineral: RestfulMineral) {
    state.minerals.push(mineral);
  },
  updateMineral(state: MineralState, mineral: RestfulMineral) {
    const indexToUpdate = _.findIndex(state.minerals, { mineralId: mineral.mineralId });
    if (indexToUpdate === -1) return

    state.minerals = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.minerals, 0, indexToUpdate)),
      mineral,
      ..._.slice(state.minerals, indexToUpdate + 1, state.minerals.length)
    ];
  },
  deleteMineral(state: MineralState, mineralId: number) {
    const indexToUpdate = _.findIndex(state.minerals, { mineralId: mineralId });
    if (indexToUpdate === -1) return

    state.minerals = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.minerals, 0, indexToUpdate)),
      ..._.slice(state.minerals, indexToUpdate + 1, state.minerals.length)
    ];
  }
};

const actions = {
  getMinerals({ commit }: any) {
    return api.instance.mineral.mineralsGet()
      .then((response) => {
        commit('setMinerals', response.data);
      })
      .catch((error: Error) => {
        // handle error
      });
  },
  postMineral({ commit }: any, mineral: RestfulMineral) {
    return api.instance.mineral.mineralPost(mineral)
      .then((response) => {
        commit('addMineral', response.data);
      });
  },
  putMineral({ commit }: any, { mineralId, mineral } : { mineralId: number, mineral: RestfulMineral }) {
    return api.instance.mineral.mineralPut(mineralId, mineral)
      .then((response) => {
        commit('updateMineral', response.data);
      });
  },
  deleteMineral({ commit }: any, mineralId: number) {
    return api.instance.mineral.mineralDelete(mineralId)
      .then(() => {
        commit('deleteMineral', mineralId);
      });
  },
};

const mineral: Module<MineralState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default mineral;
