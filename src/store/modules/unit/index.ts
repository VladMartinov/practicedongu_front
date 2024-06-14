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
    const indexToUpdate = _.findIndex(state.units, { UnitId: unit.UnitId });
    if (indexToUpdate === -1) return

    state.units = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.units, 0, indexToUpdate - 1)),
      unit,
      ..._.slice(state.units, indexToUpdate + 1, state.units.length)
    ];
  },
  deleteUnit(state: UnitState, unitId: number) {
    const indexToUpdate = _.findIndex(state.units, { UnitId: unitId });
    if (indexToUpdate === -1) return

    state.units = [
      ...(indexToUpdate === 0 ? [] : _.slice(state.units, 0, indexToUpdate - 1)),
      ..._.slice(state.units, indexToUpdate + 1, state.units.length)
    ];
  }
};

const actions = {
  getUnits({ commit }: any) {
    api.instance.unit.unitsGet()
      .then((response) => {
        commit('setUnits', response.data);
      })
      .catch((error: Error) => {
        // handle error
      });
  },
  postUnit({ commit }: any, unit: RestfulUnit) {
    api.instance.unit.unitPost(unit)
      .then((response) => {
        commit('addUnit', response.data);
      })
      .catch((error: Error) => {
        // handle error
      });
  },
  putUnit({ commit }: any, { unitId, unit } : { unitId: number, unit: RestfulUnit }) {
    api.instance.unit.unitPut(unitId, unit)
      .then((response) => {
        commit('updateUnit', response.data);
      })
      .catch((error: Error) => {
        // handle error
      });
  },
  deleteUnit({ commit }: any, unitId: number) {
    api.instance.unit.unitDelete(unitId)
      .then(() => {
        commit('deleteUnit', unitId);
      })
      .catch((error: Error) => {
        // handle error
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
