<template>
	<div class="records">
    <a-flex :style="{ marginBottom: '25px' }" justify="flex-end" align="flex-start">
      <a-button type="primary" @click="handleCreate">{{ $dictionary('create') }}</a-button>
    </a-flex>
    <a-collapse :style="{ marginBottom: '25px' }" v-model:activeKey="activeKey" ghost>
      <a-collapse-panel key="1" :header="`${ $dictionary('filter') }:`">
        <a-flex justify="space-between" align="center">
          <a-form-item
            :label="`${ $dictionary('year') }: `"
            name="date"
          >
            <a-select
              ref="select"
              v-model:value="yearValue"
              style="width: 120px"
              :options="yearOptions"
            ></a-select>
          </a-form-item>
          <a-form-item
            :label="`${ $dictionary('production') }: `"
            name="production"
          >
            <a-input-number v-model:value="productionValue">
              <template #addonBefore>
                <a-select v-model:value="productionValueType" style="width: 60px">
                  <a-select-option value="more">{{ `>` }}</a-select-option>
                  <a-select-option value="less">{{ `<` }}</a-select-option>
                </a-select>
              </template>
              <template #addonAfter>
                <a-select
                  v-model:value="unitValue"
                  style="width: 100px"
                  :options="unitsOptions"
                ></a-select>
              </template>
            </a-input-number>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="filterRecords">{{ $dictionary('search') }}</a-button>
          </a-form-item>
          <a-form-item>
            <a-button @click="resetFilter">{{ $dictionary('reset') }}</a-button>
          </a-form-item>
        </a-flex>
        <a-flex gap="small">
          <a-button type="primary" @click="handleTask(1)">{{ $dictionary('task') }} №1</a-button>
          <a-button type="primary" @click="handleTask(2)">{{ $dictionary('task') }} №2</a-button>
          <a-button type="primary" @click="handleTask(3)">{{ $dictionary('task') }} №3</a-button>
        </a-flex>
      </a-collapse-panel>
    </a-collapse>
    <a-table :columns="columns" :data-source="formattedRecords">
      <template #headerCell="{ column }">
        <template v-if="column.key === 'mineralName'">
          <span>{{ $dictionary('name') }}</span>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'mineralName'">
          <a>
            {{ record.mineralName }}
          </a>
        </template>
        <template v-else-if="column.key === 'action'">
          <span>
            <a @click="handleUpdate(record)">{{ $dictionary('update') }}</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">{{ $dictionary('delete') }}</a>
          </span>
        </template>
      </template>
    </a-table>
	</div>
  <a-modal v-model:open="recordToDelete.modalState" title="Подтверждение удаления" @cancel="() => { recordToDelete.recordsToDelete = [] }" @ok="handleDeleteConfirm">
    <p>Выберите записи для удаления:</p>
    <a-form-item>
      <a-select
        v-model:value="recordToDelete.recordsToDelete"
        :options="filteredRecordsToDelete"
        mode="multiple"
        placeholder="Дата: значение"
        style="width: 200px"
      ></a-select>
    </a-form-item>
  </a-modal>
  <a-modal v-model:open="recordToCorU.modalConfirmUpdateState" title="Обновление записи" @cancel="resetCorUData" @ok="handleUpdateSelected()">
    <p>Выберите запись для обновления:</p>
    <a-form-item>
      <a-radio-group v-model:value="recordToCorU.recordToUpdate">
        <a-radio v-for="record in filteredRecordsToUpdate" :key="record.value" :value="record.value">{{ record.label }}</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-modal>
  <a-modal v-model:open="recordToCorU.modalState" :title="`${recordToCorU.actionType === 'create' ? $dictionary('create') : $dictionary('update')} запись`" @cancel="resetCorUData" @ok="() => recordToCorU.actionType === 'create' ? handleCreateConfirm() : handleUpdateConfirm()">
    <a-form-item
      label="Год:"
      name="year"
    >
      <a-date-picker v-model:value="recordToCorU.recordDate" picker="year" :disabled="recordToCorU.actionType === 'update'" />
    </a-form-item>
    <a-form-item
      label="Минерал:"
      name="mineral"
    >
      <a-select
        ref="select"
        v-model:value="recordToCorU.mineralId"
        style="width: 120px"
        :options="mineralsOptions"
        :disabled="recordToCorU.actionType === 'update'"
      ></a-select>
    </a-form-item>
    <a-form-item
      label="Единица измерения:"
      name="unit"
    >
      <a-select
        ref="select"
        v-model:value="recordToCorU.unitId"
        style="width: 120px"
        :options="unitsOptions"
      ></a-select>
    </a-form-item>
    <a-form-item
      label="Значение:"
      name="value"
    >
      <a-input-number v-model:value="recordToCorU.recordValue" min="0.00000000001" max="100000000000"></a-input-number>
    </a-form-item>
  </a-modal>
  <a-modal v-model:open="showModal" title="Результат запроса" @cancel="closePrintModal" @ok="closePrintModal">
    <a-flex :style="{ marginBottom: '25px' }" justify="flex-end" align="flex-start">
      <a-button type="primary" @click="printTable">{{ $dictionary('print') }}</a-button>
    </a-flex>
    <a-table id="printTable" :pagination="false" :columns="printColumns" :data-source="printFormattedRecords">
      <template #headerCell="{ column }">
        <template v-if="column.key === 'mineralName'">
          <span>{{ $dictionary('name') }}</span>
        </template>
      </template>
    </a-table>
  </a-modal>
  <contextHolder />
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';
import { ref, computed, inject, onMounted, reactive } from 'vue';
import { RestfulRecord } from '../api/models/RestfulRecord';
import _ from 'lodash';
import { RestfulUnit } from '../api/models/RestfulUnit';
import { RestfulMineral } from '@/api/models/RestfulMineral';

import { notification } from 'ant-design-vue';
import * as dayjs from 'dayjs'

const [api, contextHolder] = notification.useNotification();

const store = useStore();
const dictionary = inject('$dictionary');

const activeKey = ref([]);

const recordToDelete = reactive({
  modalState: false,
  fullRecord: {},
  recordsToDelete: [],
});

const recordToCorU = reactive({
  modalState: false,
  modalConfirmUpdateState: false,
  records: [],
  recordToUpdate: '',
  actionType: '',
  recordDate: undefined,
  mineralId: undefined,
  unitId: undefined,
  recordValue: undefined
})

const filteredRecordsToDelete = computed(() => {
  if (!recordToDelete.fullRecord.groupRecords) return []
  return recordToDelete.fullRecord.groupRecords.map((record: RestfulRecord) => {
    return {
      value: record.recordDate,
      label: `${new Date(record.recordDate).getFullYear().toString()}: ${record.recordValue}`,
    }
  });
})

const filteredRecordsToUpdate = computed(() => {
  if (recordToCorU.records.length < 1) return []
  return recordToCorU.records.map((record: RestfulRecord) => {
    return {
      value: record.recordDate,
      label: `${new Date(record.recordDate).getFullYear().toString()}: ${record.recordValue}`,
    }
  });
})

const yearValue = ref<string>('');
const yearOptions = computed(() => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const years = _.uniq(_.map(records, (record) => {
    return new Date(record.recordDate).getFullYear().toString(); 
  }));

  return years.map((year) => ({
    value: year,
    label: year
  }));
});

const productionValue = ref<number>();
const productionValueType = ref<string>('more');

const unitValue = ref<number>();
const unitsOptions = computed(() => {
  const units: Array<RestfulUnit> = store.getters.getUnits;

  return units.map((unit) => ({
    value: unit.unitId,
    label: unit.unitName
  }));
});

const mineralsOptions = computed(() => {
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;

  return minerals.map((mineral) => ({
    value: mineral.mineralId,
    label: mineral.mineralName
  }));
})

const resetCorUData = function (): void {
  recordToCorU.modalState = false;
  recordToCorU.modalConfirmUpdateState = false;
  recordToCorU.actionType = 'create';
  recordToCorU.records = [];
  recordToCorU.recordToUpdate = '';
  recordToCorU.recordDate = undefined;
  recordToCorU.mineralId = undefined,
  recordToCorU.unitId = undefined;
}

const handleCreate = function (): void {
  recordToCorU.modalState = true;
  recordToCorU.modalConfirmUpdateState = false;
  recordToCorU.actionType = 'create';
  recordToCorU.records = [];
  recordToCorU.recordToUpdate = '';
  recordToCorU.recordDate = undefined;
  recordToCorU.mineralId = undefined;
  recordToCorU.unitId = undefined;
  recordToCorU.recordValue = undefined;
}

const handleCreateConfirm = function (): void {
  const record: RestfulRecord = {
    recordDate: `${recordToCorU.recordDate.year()}-01-01T00:00:00.000Z`,
    mineralId: recordToCorU.mineralId,
    unitId: recordToCorU.unitId,
    recordValue: recordToCorU.recordValue
  }

  if (!record.recordDate || !record.mineralId || !record.unitId || !record.recordValue) {
    api.error({
      message: `Ошибка обновления`,
      description: `Одно из полей не заполнено, попробуйте еще раз.`,
      placement: 'bottomRight',
    });
    return;
  }

  store.dispatch("postRecord", record)
      .then(() => {
        updateFormattedRecords();
        api.success({
          message: `Запись добавлена`,
          description: `Запись полезного ископаемого была успешно добавлена!`,
          placement: 'bottomRight',
        });
      })
      .catch(() => {
        api.error({
          message: `Ошибка добавления`,
          description: `Запись полезного ископаемого не была добавлена. Попробуйте еще раз.`,
          placement: 'bottomRight',
        });
      });

  resetCorUData();
}

const handleUpdate = function (record: any): void {
  recordToCorU.modalState = false;
  recordToCorU.modalConfirmUpdateState = true;
  recordToCorU.actionType = 'update';
  recordToCorU.records = record.groupRecords;
}

const handleUpdateSelected = function (): void {
  const record = recordToCorU.records.find((record) => record.recordDate === recordToCorU.recordToUpdate)

  if (!record) {
    resetCorUData();
    return;
  }

  recordToCorU.recordDate = dayjs().year(new Date(record.recordDate).getFullYear().toString());
  recordToCorU.mineralId = record.mineralId;
  recordToCorU.unitId = record.unitId;
  recordToCorU.recordValue = record.recordValue;

  recordToCorU.modalConfirmUpdateState = false;
  recordToCorU.modalState = true;
}

const handleUpdateConfirm = function (): void {
  const record: RestfulRecord = {
    recordDate: recordToCorU.recordToUpdate,
    mineralId: recordToCorU.mineralId,
    unitId: recordToCorU.unitId,
    recordValue: recordToCorU.recordValue
  }

  if (!record.recordDate || !record.mineralId || !record.unitId || !record.recordValue) {
    api.error({
      message: `Ошибка обновления`,
      description: `Одно из полей не заполнено, попробуйте еще раз.`,
      placement: 'bottomRight',
    });
    return;
  }

  store.dispatch("putRecord", record)
      .then(() => {
        updateFormattedRecords();
        api.success({
          message: `Запись обновлена`,
          description: `Запись полезного ископаемого была успешно обновлена!`,
          placement: 'bottomRight',
        });
      })
      .catch(() => {
        api.error({
          message: `Ошибка обновления`,
          description: `Запись полезного ископаемого не была обновлена. Попробуйте еще раз.`,
          placement: 'bottomRight',
        });
      });

  resetCorUData();
}

const handleDelete = function (record: any): void {
  recordToDelete.fullRecord = record;
  recordToDelete.modalState = true;
}

const handleDeleteConfirm = function (): void {
  // Удаляем записи из store
  recordToDelete.recordsToDelete.forEach(recordDate => {
    const mineralId = recordToDelete.fullRecord.mineralId; // Получаем mineralId из fullRecord
    const mineralName = recordToDelete.fullRecord.mineralName; // Получаем mineralId из fullRecord
    store.dispatch("deleteRecord", { recordDate, mineralId })
      .then(() => {
        updateFormattedRecords();
        api.success({
          message: `Запись удалена`,
          description: `Запись полезного ископаемого: "${mineralName}" была успешно удалена!`,
          placement: 'bottomRight',
        });
      })
      .catch(() => {
        api.error({
          message: `Ошибка удаления`,
          description: `Запись полезного ископаемого: "${mineralName}" не была удалена. Попробуйте еще раз.`,
          placement: 'bottomRight',
        });
      });
  });

  recordToDelete.modalState = false;
  recordToDelete.fullRecord = {};
  recordToDelete.recordsToDelete = [];
}

const handleTask = function (number: number): void {
  switch (number) {
    case 1:
      firstTask();
      break;
    case 2:
      secondTask();
      break;
    case 3:
      thirdTask();
      break;
  }
};

const firstTask = function (): void {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const year = '2000';
  const units: Array<RestfulUnit> = store.getters.getUnits;

  // Фильтруем записи по году
  const filteredRecords = records.filter(record => new Date(record.recordDate).getFullYear() === parseInt(year));

  // Находим запись с максимальным значением RecordValue с учетом unitValue
  const maxRecord = _.maxBy(filteredRecords, (record) => {
    const unit = units.find(unit => unit.unitId === record.unitId);
    return record.recordValue * (unit?.unitValue || 1); 
  });

  // Формируем отформатированную запись
  if (maxRecord) { // Проверяем, что maxRecord не undefined
    const mineral = store.getters.getMinerals.find(m => m.mineralId === maxRecord.mineralId);
    const unit = store.getters.getUnits.find(unit => unit.unitId === maxRecord.unitId);
    const formattedRecord = {
      groupRecords: [maxRecord], // Создаем массив с одной записью
      mineralId: maxRecord.mineralId,
      mineralName: mineral?.mineralName || '',
      unitId: unit?.unitId || '',
      unitName: unit?.unitName || '',
      action: '',
      [year]: maxRecord.recordValue,
    };

    printFormattedRecords.value = [formattedRecord]; // Обновляем formattedRecords.value
    formattedRecords.value = [formattedRecord]; // Обновляем formattedRecords.value
    showModal.value = true;
  } else {
    api.warning({
      message: 'Предупреждение',
      description: `Записей за ${year} год не найдено.`,
      placement: 'bottomRight',
    });
  }
}

const secondTask = function (): void {
  yearValue.value = '2010';
  productionValue.value = 10;
  productionValueType.value = 'more';
  unitValue.value = unitsOptions.value.find((unit) => unit.label = 'тыс. т')?.value;
  filterRecords();
  printFormattedRecords.value = [...formattedRecords.value]; // Обновляем formattedRecords.value
  showModal.value = true;
}

const thirdTask = function (): void {
  yearValue.value = '2000';
  productionValue.value = 20;
  productionValueType.value = 'more';
  unitValue.value = unitsOptions.value.find((unit) => unit.label = 'тыс. т')?.value;
  filterRecords();
  printFormattedRecords.value = [...formattedRecords.value]; // Обновляем formattedRecords.value
  showModal.value = true;
}

const formattedRecords = ref<any[]>([]); // Массив для хранения отформатированных записей

const columns = computed(() => {
  const array = [
    {
      name: dictionary('name'),
      dataIndex: 'mineralName',
      key: 'mineralName'
    },
    {
      title: dictionary('unit'),
      dataIndex: 'unitName',
      key: 'unitName',
    }
  ];

  yearOptions.value.map((year) => {
    array.push({
      title: year.label,
      dataIndex: year.value,
    });
  })

  array.push({
    title: dictionary('action'),
    dataIndex: '',
    key: 'action',
  });

  return array;
})

const printFormattedRecords = ref<any[]>([]);
const printColumns = computed(() => {
  const array = [
    {
      name: dictionary('name'),
      dataIndex: 'mineralName',
      key: 'mineralName'
    },
    {
      title: dictionary('unit'),
      dataIndex: 'unitName',
      key: 'unitName',
    }
  ];

  yearOptions.value.map((year) => {
    array.push({
      title: year.label,
      dataIndex: year.value,
    });
  })

  return array;
})

const showModal = ref(false);

// Обработка данных при загрузке вкладки
onMounted(() => {
  Promise.all([
    store.dispatch("getMinerals"),
    store.dispatch("getUnits"),
    store.dispatch("getRecords")
  ]).then(() => {
    updateFormattedRecords();
  })
});

const updateFormattedRecords = () => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  const groupedRecords = _.groupBy(records, (record) => `${record.mineralId}-${record.unitId}`);

  formattedRecords.value = _.map(groupedRecords, (groupRecords, key) => {
    const mineralId = parseInt(key.split('-')[0]);
    const unitId = parseInt(key.split('-')[1]);

    const mineral = minerals.find(m => m.mineralId === mineralId);
    const unit = units.find(u => u.unitId === unitId);

    const result = {
      groupRecords: groupRecords,
      mineralId: mineral?.mineralId || '',
      mineralName: mineral?.mineralName || '',
      unitName: unit?.unitName || '',
      unitId: unit?.unitId || '',
      action: '', // Добавьте значения для действия
    };

    groupRecords.forEach(record => {
      const year = new Date(record.recordDate).getFullYear().toString();
      result[year] = record.recordValue;
    });

    return result;
  });
};

const filterRecords = () => {
  updateFormattedRecords();

  const records: Array<any> = formattedRecords.value;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  // Фильтруем записи по году
  let filteredRecords = yearValue.value
    ? records.filter(record => Object.keys(record).includes(yearValue.value) && record[yearValue.value] !== 0) 
    : records;

  // Фильтруем записи по добыче
  if (productionValue.value !== undefined) {
    filteredRecords = filteredRecords.filter(record => {
      const yearKeys = Object.keys(record).filter(key => !isNaN(Number(key)));
      const unit = units.find(unit => unit.unitId === record.unitId);
      const unitValueLocal = unit?.unitValue || 1; // Берем unitValue из unitsOptions

      const prodUnit = units.find(unit => unit.unitId === unitValue.value);
      const unitProdValueLocal = prodUnit?.unitValue || 1; // Берем unitValue из unitsOptions Берем unitValue из unitsOptions
      return productionValueType.value === 'more'
        ? yearKeys.some(key => record[key] * unitValueLocal >= productionValue.value * unitProdValueLocal) 
        : yearKeys.some(key => record[key] * unitValueLocal <= productionValue.value * unitProdValueLocal);
    });
  }

  // Присваиваем undefined значениям, которые не подходят под фильтр
  filteredRecords = filteredRecords.map(record => {
    const yearKeys = Object.keys(record).filter(key => !isNaN(Number(key)));

    // Зануление по году
    if (yearValue.value) {
      yearKeys.forEach(key => {
        if (key !== yearValue.value) {
          record[key] = undefined; 
        }
      });
    }

    // Зануление по добыче
    if (productionValue.value !== undefined) {
      const unit = units.find(unit => unit.unitId === record.unitId);
      const unitValueLocal = unit?.unitValue || 1; // Берем unitValue из unitsOptions

      const prodUnit = units.find(unit => unit.unitId === unitValue.value);
      const unitProdValueLocal = prodUnit?.unitValue || 1; // Берем unitValue из unitsOptions

      yearKeys.forEach(key => {
        if (productionValueType.value === 'more' && record[key] * unitValueLocal < productionValue.value * unitProdValueLocal || 
            productionValueType.value === 'less' && record[key] * unitValueLocal > productionValue.value * unitProdValueLocal) {
          record[key] = undefined;
        }
      });
    }

    return record;
  });

  filteredRecords = filteredRecords.filter(record => {
    const yearKeys = Object.keys(record).filter(key => !isNaN(Number(key)));

    return yearKeys.some(key => record[key] !== undefined);
  });

  formattedRecords.value = filteredRecords;
};

const resetFilter = () => {
  yearValue.value = '';
  unitValue.value = undefined;
  productionValueType.value = 'more';
  productionValue.value = undefined;

  updateFormattedRecords();
}

const printTable = function(): void {
  const printContents = document.getElementById('printTable')?.innerHTML; // Получите HTML-код таблицы
  if (printContents) {
    const originalContents = document.body.innerHTML; // Сохраните текущее содержимое body
    document.body.innerHTML = printContents; // Замените содержимое body на HTML таблицы
    window.print(); // Вызовите функцию печати
    document.body.innerHTML = originalContents; // Верните исходное содержимое body
  }
}

const closePrintModal = function(): void {
  showModal.value = false;
}
</script>