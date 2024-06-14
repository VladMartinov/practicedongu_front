import { MineralState } from './modules/mineral';
import { RecordState } from './modules/record';
import { UnitState } from './modules/unit';

export interface RootState {
  mineral: MineralState,
  record: RecordState,
  unit: UnitState
};
