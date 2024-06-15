<template>
	<div class="units">
    <a-flex :style="{ marginBottom: '25px' }" justify="flex-end" align="flex-start">
      <a-button type="primary" @click="handleCreate">{{ $dictionary('create') }}</a-button>
    </a-flex>
    <a-table :columns="columns" :data-source="formattedUnits">
      <template #headerCell="{ column }">
        <template v-if="column.key === 'unitId'">
          <span>#</span>
        </template>
      </template>
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'unitId'">
        <a>
          {{ record.unitId }}
        </a>
      </template>
        <template v-if="column.key === 'action'">
          <span>
            <a @click="handleUpdate(record)">{{ $dictionary('update') }}</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="Вы уверены, что хотите удалить данную запись?"
              ok-text="Да"
              cancel-text="Нет"
              @confirm="handleDelete(record)"
            >
              <a>{{ $dictionary('delete') }}</a>
            </a-popconfirm>
          </span>
        </template>
      </template>
    </a-table>
	</div>
  <a-modal v-model:open="createOrUpdateState.modalState" :title="`${createOrUpdateState.typeAction === 'create' ? $dictionary('create') : $dictionary('update')} записи`" @ok="() => createOrUpdateState.typeAction === 'create' ? handleCreateConfirm() : handleUpdateConfirm()">
    <a-form-item
      label="Наименование:"
      name="year"
    >
      <a-input v-model:value="createOrUpdateState.unit.unitName" placeholder="Наименование минерала" allow-clear />
    </a-form-item>
    <a-form-item
      label="Коэффициент:"
      name="unit"
    >
      <a-input-number v-model:value="createOrUpdateState.unit.unitValue" :min="0.00000000001" :max="100000000000" />
    </a-form-item>
  </a-modal>
  <contextHolder />
</template>

<script lang="ts" setup>
import { useStore } from 'vuex';
import { onMounted, ref, inject, computed, reactive } from 'vue';
import { RestfulMineral, RestfulRecord, RestfulUnit } from '@/api/models';
import { notification } from 'ant-design-vue';
import _ from 'lodash';

interface CreateOrUpdate {
  typeAction: string,
  modalState: boolean,
  unit: RestfulUnit,
}

const store = useStore();
const dictionary = inject('$dictionary');

const [api, contextHolder] = notification.useNotification();

const formattedUnits = ref<Array<RestfulUnit>>([]); // Массив для хранения отформатированных записей

const columns = computed(() => {
  const array = [
    {
      title: '#',
      name: '#',
      dataIndex: 'unitId',
      key: 'unitId',
    },
    {
      title: dictionary('unit'),
      dataIndex: 'unitName',
      key: 'unitName',
    }
  ];

  array.push({
    title: dictionary('action'),
    dataIndex: '',
    key: 'action',
  });

  return array;
})

const updateFormattedUnits = () => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  formattedUnits.value = _.slice(units);
};

// Обработка данных при загрузке вкладки
onMounted(() => {
  Promise.all([
    store.dispatch("getUnits"),
  ]).then(() => {
    updateFormattedUnits();
  })
});

const createOrUpdateState: CreateOrUpdate = reactive({
  typeAction: 'create',
  modalState: false,
  unit: { unitId: 0, unitName: '', unitValue: 0 } as RestfulUnit,
});

const resetCreateOrUpdateObject = function(): void {
  createOrUpdateState.typeAction = 'create';
  createOrUpdateState.modalState = false;
  createOrUpdateState.unit = { unitId: 0, unitName: '', unitValue: 0 } as RestfulUnit;
}

const handleCreate = function(): void {
  createOrUpdateState.modalState = true;
};

const handleCreateConfirm = function(): void {
  if (!createOrUpdateState.unit.unitName || !createOrUpdateState.unit.unitValue || createOrUpdateState.unit.unitValue <= 0) {
    api.error({
      message: `Ошибка создания`,
      description: `Одно из полей не заполнено, попробуйте еще раз.`,
      placement: 'bottomRight',
    });
    return;
  }

  store.dispatch('postUnit', createOrUpdateState.unit)
    .then(() => {
      updateFormattedUnits();
      api.success({
        message: `Запись создана`,
        description: `Запись единицы измерения была успешно создана!`,
        placement: 'bottomRight',
      });
    })
    .catch(() => {
      api.error({
        message: `Ошибка создания`,
        description: `Запись единицы измерения не была создана. Попробуйте еще раз.`,
        placement: 'bottomRight',
      });
    });

  resetCreateOrUpdateObject();
};

const handleUpdateConfirm = function(): void {
  if (createOrUpdateState.unit.unitId < 1 || !createOrUpdateState.unit.unitName || !createOrUpdateState.unit.unitValue || createOrUpdateState.unit.unitValue <= 0) {
    api.error({
      message: `Ошибка обновления`,
      description: `Одно из полей не заполнено, попробуйте еще раз.`,
      placement: 'bottomRight',
    });
    return;
  }

  store.dispatch('putUnit', { unitId: createOrUpdateState.unit.unitId, unit: createOrUpdateState.unit })
    .then(() => {
      updateFormattedUnits();
      api.success({
        message: `Запись обновлена`,
        description: `Запись единицы измерения была успешно обновлена!`,
        placement: 'bottomRight',
      });
    })
    .catch(() => {
      api.error({
        message: `Ошибка обновления`,
        description: `Запись единицы измерения не была обновлена. Попробуйте еще раз.`,
        placement: 'bottomRight',
      });
    });

  resetCreateOrUpdateObject();
};

const handleUpdate = function(unit: RestfulUnit): void {
  createOrUpdateState.typeAction = 'update';
  createOrUpdateState.unit.unitId = unit.unitId;
  createOrUpdateState.unit.unitName = unit.unitName;
  createOrUpdateState.unit.unitValue = unit.unitValue;
  createOrUpdateState.modalState = true;
};

const handleDelete = function(unit: RestfulUnit): void {
  store.dispatch('deleteUnit', unit.unitId)
    .then(() => {
      updateFormattedUnits();
      api.success({
        message: `Запись удалена`,
        description: `Запись единицы измерения была успешно удалена!`,
        placement: 'bottomRight',
      });
    })
    .catch(() => {
      api.error({
        message: `Ошибка удаления`,
        description: `Запись единицы измерения не была удалена. Попробуйте еще раз.`,
        placement: 'bottomRight',
      });
    });
};
</script>