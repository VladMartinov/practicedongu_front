<template>
  <div class="preloader-wrapper" v-if="loading">
    <a-spin :indicator="indicator" />
  </div>
</template>

<script setup lang="ts">
import { computed, h } from "vue";
import { useStore } from "vuex";
import { LoadingOutlined } from '@ant-design/icons-vue';

const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '36px',
    color: '#ffffff',
  },
  spin: true,
});

const store = useStore();
const loading = computed(() => {
  return store.getters.getLoading
});
</script>

<style scoped lang="scss">
.preloader-wrapper {
  position: fixed;

  display: flex;
  align-items: center;
  justify-content: center;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background-color: rgba(0, 0, 0, 0.75);

  z-index: 10;
}
</style>
