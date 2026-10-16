<template>
  <div class="dashboard-page">
    <div class="header-actions">
      <h2>Mis Campañas Creadas</h2>
      <router-link to="/dashboard/crear-campana" class="btn-add">+ Nueva Campaña</router-link>
    </div>

    <div class="table-wrapper" v-if="misCampanas.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Meta</th>
            <th>Recaudado</th>
            <th>Estado</th>
            <th>Fecha Límite</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in misCampanas" :key="item.id">
            <td><strong>{{ item.titulo }}</strong></td>
            <td>${{ item.meta.toLocaleString() }}</td>
            <td>${{ item.recaudado.toLocaleString() }}</td>
            <td>
              <span class="badge" :class="item.estado">{{ item.estado }}</span>
            </td>
            <td>{{ item.fechaLimite }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty-state">Aún no has creado ninguna campaña.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const misCampanas = ref([
  {
    id: 1,
    titulo: 'Videojuego Indie RPG 2D',
    meta: 5000,
    recaudado: 3500,
    estado: 'activa',
    fechaLimite: '2026-11-30'
  }
]);
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-add {
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 600;
}

.table-wrapper {
  overflow-x: auto;
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  background-color: var(--color-bg);
  font-weight: 600;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: bold;
}
.badge.activa { background-color: #dbeafe; color: #1e40af; }
.badge.exitosa { background-color: #dcfce7; color: #166534; }
.badge.fallida { background-color: #fee2e2; color: #991b1b; }

.empty-state {
  color: #64748b;
  text-align: center;
  padding: 2rem;
}
</style>