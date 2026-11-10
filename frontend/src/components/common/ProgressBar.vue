<template>
  <div class="progress-wrapper">
    <div class="progress-bar" role="progressbar" :aria-valuenow="Math.min(percentage, 100)" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" :class="{ reached: percentage >= 100 }" :style="{ width: Math.min(percentage, 100) + '%' }"></div>
    </div>
    <div class="progress-info">
      <span><strong>{{ formatMoney(currentAmount) }}</strong> de {{ formatMoney(goalAmount) }}</span>
      <strong>{{ percentage }}%</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney, percentOf } from '@/utils/format'

const props = defineProps<{ currentAmount: number; goalAmount: number }>()
const percentage = computed(() => percentOf(props.currentAmount, props.goalAmount))
</script>

<style scoped>
.progress-wrapper { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
.progress-bar { height: 10px; background: var(--color-border); border-radius: 5px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--color-primary); transition: width 0.4s ease; }
.progress-fill.reached { background: var(--color-success); }
.progress-info { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.875rem; flex-wrap: wrap; }
</style>
