<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1" @click="router.push({ name: 'statistics' })">
          <pie-chart-outlined />
          <span>{{ $dictionary('statistics') }}</span>
        </a-menu-item>
        <a-menu-item key="2" @click="router.push({ name: 'about' })">
          <info-circle-outlined />
          <span>{{ $dictionary('about') }}</span>
        </a-menu-item>
        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <database-outlined />
              <span>{{ $dictionary('data') }}</span>
            </span>
          </template>
          <a-menu-item key="3" @click="router.push({ name: 'records' })">
            <span>{{ $dictionary('records') }}</span>
          </a-menu-item>
          <a-menu-item key="4" @click="router.push({ name: 'minerals' })">
            <span>{{ $dictionary('minerals') }}</span>
          </a-menu-item>
          <a-menu-item key="5" @click="router.push({ name: 'units' })">
            <span>{{ $dictionary('units') }}</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="margin: 0 16px 16px; background: #fff;">
        <div class="header-line">
          <div class="header-line__title">
            <span>{{ headerTitle }}</span>
          </div>
          <div class="header-line__state">
            <a-badge :status="wirelessStatus" :text="$dictionary('wireless')" />
          </div>
        </div>
      </a-layout-header>
      <a-layout-content style="margin: 0 16px">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <router-view/>
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Practice DonGU ©2024 Created by Martynov Vladislav, ICT-1, 3 course
      </a-layout-footer>
    </a-layout>
  </a-layout>
  <version-block />
  <loading-block />
</template>

<script setup lang="ts">
import {
  PieChartOutlined,
  InfoCircleOutlined,
  DatabaseOutlined
} from '@ant-design/icons-vue';
import VersionBlock from './components/VersionBlock.vue';
import LoadingBlock from './components/LoadingBlock.vue';
import { computed, inject, ref } from 'vue';
import { Router, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { WirelessStatusEnum } from './utils/Enum';

const router: Router = useRouter();
const store = useStore();
const dictionary = inject('$dictionary');

const collapsed = ref<boolean>(false);
const selectedKeys = ref<string[]>(['1']);

const headerTitle = computed(() => {
  switch (selectedKeys.value[0]) {
    case '1':
      return dictionary('statistics');
    case '2':
      return dictionary('about');
    case '3':
      return dictionary('data') + ' -> ' + dictionary('records');
    case '4':
      return dictionary('data') + ' -> ' + dictionary('minerals');
    case '5':
      return dictionary('data') + ' -> ' + dictionary('units');
    default:
      return `(${dictionary('loading')}...))`;
  }
});
const wirelessStatus = computed(() => {
  switch (store.getters.getWirilessState) {
    case WirelessStatusEnum.Active:
      return 'success';
    case WirelessStatusEnum.InActive:
      return 'error';
    default:
      return 'default';
  }
})
</script>

<style lang="scss">
#app {
  position: relative;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.header-line {
  display: flex;
  justify-content: space-between;

  &__title {
    font-size: 24px;
    font-weight: 500;
  }
}
</style>
