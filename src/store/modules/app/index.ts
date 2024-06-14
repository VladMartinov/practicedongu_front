import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { WirelessStatusEnum } from '@/utils/Enum';

export interface AppState {
  loading: boolean;
  wirilessState: number;
}

const state: AppState = {
  loading: false,
  wirilessState: WirelessStatusEnum.Default
};

const getters = {
  getLoading: (state: AppState) => state.loading,
  getWirilessState: (state: AppState) => state.wirilessState,
};

const mutations = {
  setLoading(state: AppState, value: boolean) {
    state.loading = value;
  },
  setWireless(state: AppState, value: number) {
    state.wirilessState = value;
  },
};

const actions = {
  setLoading({ commit }: any, value: boolean) {
    commit('setLoading', value);
  },
  setWireless({ commit }: any, value: number) {
    commit('setWireless', value);
  },
};

const app: Module<AppState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default app;
