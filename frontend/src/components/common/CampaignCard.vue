<template>
  <div class="card">
    <div class="card-body">
      <span class="badge" :class="status">{{ status }}</span>
      <h3>{{ title }}</h3>
      <p class="description">{{ description }}</p>
      
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
        </div>
        <div class="stats">
          <span><strong>${{ currentAmount }}</strong> recaudados</span>
          <span><strong>{{ percentage }}%</strong></span>
        </div>
      </div>
      
      <div class="card-footer">
        <small>Meta: ${{ goalAmount }}</small>
        <router-link :to="`/campanas/${id}`" class="btn-detail"> Ver más</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  id: number;
  title: string;
  description: string;
  currentAmount: number;
  goalAmount: number;
  status: 'activa' | 'exitosa' | 'fallida';
}>();

const percentage = computed(() => {
  const calc = Math.round((props.currentAmount / props.goalAmount) * 100);
  return calc > 100 ? 100 : calc;
});
</script>

<style scoped>
.card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 0.5rem;
  width: fit-content;
}

.badge.activa { background-color: #dbeafe; color: #1e40af; }
.badge.exitosa { background-color: #dcfce7; color: #166534; }
.badge.fallida { background-color: #fee2e2; color: #991b1b; }

.description {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem 0;
}

.progress-bar {
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.card-footer {
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-detail {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.btn-detail:hover {
  background-color: var(--color-primary);
  color: white;
}
</style>