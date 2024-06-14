import { createStore } from 'vuex';
import { RootState } from './types';
import mineral from './modules/mineral';
import record from './modules/record';
import unit from './modules/unit';

export default createStore<RootState>({
  modules: {
    mineral,
    record,
    unit
  }
});
