<template>
	<div class="minerals">
    <a-flex :style="{ marginBottom: '25px' }" justify="flex-end" align="flex-start">
      <a-button type="primary" @click="handleCreate">{{ $dictionary('create') }}</a-button>
    </a-flex>
    <a-table :columns="columns" :data-source="formattedMinerals">
      <template #headerCell="{ column }">
        <template v-if="column.key === 'mineralId'">
          <span>#</span>
        </template>
      </template>
      <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'mineralId'">
        <a>
          {{ record.mineralId }}
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
      <a-input v-model:value="createOrUpdateState.mineral.mineralName" placeholder="Наименование минерала" allow-clear />
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
  mineral: RestfulMineral,
}

const store = useStore();
const dictionary = inject('$dictionary');

const [api, contextHolder] = notification.useNotification();

const formattedMinerals = ref<Array<RestfulMineral>>([]); // Массив для хранения отформатированных записей

const columns = computed(() => {
  const array = [
    {
      title: '#',
      name: '#',
      dataIndex: 'mineralId',
      key: 'mineralId',
    },
    {
      title: dictionary('mineral'),
      dataIndex: 'mineralName',
      key: 'mineralName',
    }
  ];

  array.push({
    title: dictionary('action'),
    dataIndex: '',
    key: 'action',
  });

  return array;
})

const updateFormattedMinerals = () => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  formattedMinerals.value = _.slice(minerals);
};

// Обработка данных при загрузке вкладки
onMounted(() => {
  Promise.all([
    store.dispatch("getMinerals"),
  ]).then(() => {
    updateFormattedMinerals();
  })
});

const createOrUpdateState: CreateOrUpdate = reactive({
  typeAction: 'create',
  modalState: false,
  mineral: { mineralId: 0, mineralName: '' } as RestfulMineral,
});

const resetCreateOrUpdateObject = function(): void {
  createOrUpdateState.typeAction = 'create';
  createOrUpdateState.modalState = false;
  createOrUpdateState.mineral = { mineralId: 0, mineralName: '' } as RestfulMineral;
}

const handleCreate = function(): void {
  createOrUpdateState.modalState = true;
};

const handleCreateConfirm = function(): void {
  if (!createOrUpdateState.mineral.mineralName) {
    api.error({
      message: `Ошибка создания`,
      description: `Одно из полей не заполнено, попробуйте еще раз.`,
      placement: 'bottomRight',
    });
    return;
  }

  store.dispatch('postMineral', createOrUpdateState.mineral)
    .then(() => {
      updateFormattedMinerals();
      api.success({
        message: `Запись создана`,
        description: `Запись полезного ископаемого была успешно создана!`,
        placement: 'bottomRight',
      });
    })
    .catch(() => {
      api.error({
        message: `Ошибка создания`,
        description: `Запись полезного ископаемого не была создана. Попробуйте еще раз.`,
        placement: 'bottomRight',
      });
    });

  resetCreateOrUpdateObject();
};

const handleUpdateConfirm = function(): void {
  if (createOrUpdateState.mineral.mineralId < 1 || !createOrUpdateState.mineral.mineralName) {
    api.error({
      message: `Ошибка обновления`,
      description: `Одно из полей не заполнено, попробуйте еще раз.`,
      placement: 'bottomRight',
    });
    return;
  }

  store.dispatch('putMineral', { mineralId: createOrUpdateState.mineral.mineralId, mineral: createOrUpdateState.mineral })
    .then(() => {
      updateFormattedMinerals();
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

  resetCreateOrUpdateObject();
};

const handleUpdate = function(mineral: RestfulMineral): void {
  createOrUpdateState.typeAction = 'update';
  createOrUpdateState.mineral.mineralId = mineral.mineralId;
  createOrUpdateState.mineral.mineralName = mineral.mineralName;
  createOrUpdateState.modalState = true;
};

const handleDelete = function(mineral: RestfulMineral): void {
  store.dispatch('deleteMineral', mineral.mineralId)
    .then(() => {
      updateFormattedMinerals();
      api.success({
        message: `Запись удалена`,
        description: `Запись полезного ископаемого была успешно удалена!`,
        placement: 'bottomRight',
      });
    })
    .catch(() => {
      api.error({
        message: `Ошибка удаления`,
        description: `Запись полезного ископаемого не была удалена. Попробуйте еще раз.`,
        placement: 'bottomRight',
      });
    });
};
</script>