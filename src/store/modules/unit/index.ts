import { Module } from 'vuex';
import { RootState } from '@/store/types';
import { RestfulUnit } from '@/api/models';
import api from '@/api';
import _ from "lodash";

export interface UnitState {
  units: Array<RestfulUnit>;
}

const state: UnitState = {
  units: []
};

const getters = {
  getUnits: (state: UnitState) => state.units
};

const mutations = {
  setUnits(state: UnitState, units: Array<RestfulUnit>) {
    state.units = units;
  },
  addUnit(state: UnitState, unit: RestfulUnit) {
    state.units.push(unit);
  },
  updateUnit(state: UnitState, unit: RestfulUnit) {
    const indexToUpdate = _.findIndex(state.units, { unitId: unit.unitId });
    if (indexToUpdate === -1) return

    state.units = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.units, 0, indexToUpdate)),
      unit,
      ..._.slice(state.units, indexToUpdate + 1, state.units.length)
    ];
  },
  deleteUnit(state: UnitState, unitId: number) {
    const indexToUpdate = _.findIndex(state.units, { unitId: unitId });
    if (indexToUpdate === -1) return

    state.units = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.units, 0, indexToUpdate)),
      ..._.slice(state.units, indexToUpdate + 1, state.units.length)
    ];
  }
};

const actions = {
  getUnits({ commit }: any) {
    return api.instance.unit.unitsGet()
      .then((response) => {
        commit('setUnits', response.data);
      });
  },
  postUnit({ commit }: any, unit: RestfulUnit) {
    return api.instance.unit.unitPost(unit)
      .then((response) => {
        commit('addUnit', response.data);
      });
  },
  putUnit({ commit }: any, { unitId, unit } : { unitId: number, unit: RestfulUnit }) {
    return api.instance.unit.unitPut(unitId, unit)
      .then((response) => {
        commit('updateUnit', response.data);
      });
  },
  deleteUnit({ commit }: any, unitId: number) {
    return api.instance.unit.unitDelete(unitId)
      .then(() => {
        commit('deleteUnit', unitId);
      });
  },
};

const unit: Module<UnitState, RootState> = {
  state,
  getters,
  mutations,
  actions
}

export default unit;
