<template>
  <div class="progress-wrapper">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: computedPercentage + '%' }"
      ></div>
    </div>
    <div class="progress-info">
      <span class="amount"><strong>${{ currentAmount.toLocaleString() }}</strong> de ${{ goalAmount.toLocaleString() }}</span>
      <span class="percentage"><strong>{{ computedPercentage }}%</strong></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentAmount: number;
  goalAmount: number;
}>();

const computedPercentage = computed(() => {
  if (props.goalAmount <= 0) return 0;
  const calc = Math.round((props.currentAmount / props.goalAmount) * 100);
  return calc > 100 ? 100 : calc;
});
</script>

<style scoped>
.progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.progress-bar {
  height: 10px;
  background-color: var(--color-border);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.4s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-text);
}
</style>