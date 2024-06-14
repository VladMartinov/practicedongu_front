<template>
  <div class="version">
    <span class="version__text">{{ version }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const version = computed(() => {
  return 'v1.0.0.0';
})
</script>

<style scoped lang="scss">
.version {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 5px 10px;
  border-radius: 10px;
  border: 1px solid #bbbbbb;
  background-color: #ffffff;

  &__text {
    font-size: 14px;
    color: #000000;
  }
}
</style>
