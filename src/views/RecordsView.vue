<template>
	<div class="records">
		<h1><GithubOutlined /></h1>
	</div>
</template>

<script lang="ts" setup>
import { GithubOutlined } from '@ant-design/icons-vue';
import { useStore } from 'vuex';

const store = useStore();
store.dispatch("getMinerals");
store.dispatch("getUnits");
store.dispatch("getRecords");
</script>