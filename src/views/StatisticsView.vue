<template>
  <div class="statistics">
    <section class="statistics-section">
      <div class="statistics-section__bar">
        <Bar
          :options="chartOptions"
          :data="barData"
        />
      </div>
      <div class="statistics-section__description">
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
        <a-typography>
          <a-typography-title>{{ $dictionary('statisticsByYear') }}</a-typography-title>
          <a-typography-paragraph>{{ $dictionary('statisticsByYearDesc') }}</a-typography-paragraph>
        </a-typography>
      </div>
    </section>

    <section class="statistics-section">
      <div class="statistics-section__bar">
        <Line
          :options="chartOptions"
          :data="lineData"
        />
      </div>
      <div class="statistics-section__description">
        <a-form-item
          :label="`${ $dictionary('mineral') }: `"
          name="mineral"
        >
          <a-select
            ref="select"
            v-model:value="mineralValue"
            style="width: 120px"
            :options="mineralOptions"
          ></a-select>
        </a-form-item>
        <a-typography>
          <a-typography-title>{{ $dictionary('statisticsByMineral') }}</a-typography-title>
          <a-typography-paragraph>{{ $dictionary('statisticsByMineralDesc') }}</a-typography-paragraph>
        </a-typography>
      </div>
    </section>

    <section class="statistics-section">
      <div class="statistics-section__bar">
        <Pie
          :options="chartOptions"
          :data="pieData"
        />
      </div>
      <div class="statistics-section__description">
        <a-typography>
          <a-typography-title>{{ $dictionary('statisticsBestYear') }}</a-typography-title>
          <a-typography-paragraph>{{ $dictionary('statisticsBestYearDesc') }}</a-typography-paragraph>
        </a-typography>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'
import { reactive, ref, computed } from 'vue';
import { Bar, Line, Pie } from 'vue-chartjs'
import { useStore } from 'vuex';
import _ from 'lodash';
import { RestfulRecord } from '@/api/models';
import { RestfulMineral } from '../api/models/RestfulMineral';
import { RestfulUnit } from '../api/models/RestfulUnit';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const chartOptions = reactive({
  responsive: true
});

const store = useStore();

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

const barData = computed(() => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  // Фильтруем записи по году
  const filteredRecords = yearValue.value 
    ? records.filter(record => new Date(record.recordDate).getFullYear().toString() === yearValue.value)
    : records;

  const groupedRecords = _.groupBy(filteredRecords, 'mineralId');

  const datasets = _.map(minerals, (mineral) => {
    const mineralRecords = groupedRecords[mineral.mineralId] || [];

    const data = _.reduce(mineralRecords, (result, record) => {
      const unit = units.find(unit => unit.unitId === record.unitId);
      if (unit) {
        result.push(record.recordValue * unit.unitValue);
      } else {
        result.push(record.recordValue);
      }
      return result;
    }, [] as number[]);

    return {
      label: mineral.mineralName,
      backgroundColor: '#f87979', // Replace with your desired color
      data
    };
  });

  return {
    labels: _.map(minerals, 'mineralName'), // Mineral names as labels
    datasets
  };
})

const mineralValue = ref<number>();
const mineralOptions = computed(() => {
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;

  return minerals.map((mineral) => ({
    value: mineral.mineralId,
    label: mineral.mineralName
  }));
});


const lineData = computed(() => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  // Выбираем минерал, по которому отображаем данные
  const selectedMineralId = mineralValue.value || (minerals.length > 0 ? minerals[0].mineralId : null);

  // Фильтруем записи по минералу
  const filteredRecords = records.filter(record => record.mineralId === selectedMineralId);

  const groupedRecordsByYear = _.groupBy(filteredRecords, (record) => {
    return new Date(record.recordDate).getFullYear().toString(); 
  });

  const datasets = [{ // Используем только один набор данных для выбранного минерала
    label: minerals.find(mineral => mineral.mineralId === selectedMineralId)?.mineralName || '', // Название минерала
    backgroundColor: '#f87979', // Замените на желаемый цвет
    data: _.map(groupedRecordsByYear, (recordsForYear) => {
      return _.sumBy(recordsForYear, (record) => {
        const unit = units.find(unit => unit.unitId === record.unitId);
        return unit ? record.recordValue * unit.unitValue : record.recordValue;
      });
    })
  }];

  return {
    labels: _.keys(groupedRecordsByYear), // Годы в качестве labels
    datasets // Набор данных для выбранного минерала
  };
})

const pieData = computed(() => {
  const records: Array<RestfulRecord> = store.getters.getRecords;
  const minerals: Array<RestfulMineral> = store.getters.getMinerals;
  const units: Array<RestfulUnit> = store.getters.getUnits;

  const groupedRecordsByMineral = _.groupBy(records, 'mineralId');
  const datasets: { label: string; backgroundColor: string; data: number[] }[] = [];

  _.forEach(minerals, (mineral) => {
    const mineralRecords = groupedRecordsByMineral[mineral.mineralId] || [];

    // Находим лучшую запись для минерала
    const bestRecord = _.maxBy(mineralRecords, (record) => {
      const unit = units.find(unit => unit.unitId === record.unitId);
      return unit ? record.recordValue * unit.unitValue : record.recordValue;
    });

    if (bestRecord) {
      const bestYear = new Date(bestRecord.recordDate).getFullYear();

      // Добавляем данные для pie chart
      datasets.push({
        label: `${mineral.mineralName} (${bestYear})`, // Форматируем label
        backgroundColor: '#f87979', // Замените на желаемый цвет
        data: [bestRecord.recordValue * (units.find(unit => unit.unitId === bestRecord.unitId)?.unitValue || 1)] // Используем unitValue для вычисления
      });
    }
  });

  return {
    labels: _.map(datasets, 'label'), // Названия минералов с годом
    datasets
  };
})

</script>

<style scope lang="scss">
.statistics {
  &-section {
    width: 100%;
    margin-bottom: 150px;
    display: flex;
    column-gap: 25px;

    &__bar {
      width: 60%;
    }

    &__description {
      width: 40%;
    }
  }
}
</style>
