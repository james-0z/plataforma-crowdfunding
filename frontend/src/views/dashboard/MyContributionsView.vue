<template>
  <div class="dashboard-page">
    <h2>Mis Aportes Realizados</h2>

    <div class="table-wrapper" v-if="misAportes.length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Campaña</th>
            <th>Monto Aportado</th>
            <th>Fecha</th>
            <th>Estado Campaña</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="aporte in misAportes" :key="aporte.id">
            <td><strong>{{ aporte.campanaTitulo }}</strong></td>
            <td>${{ aporte.monto.toLocaleString() }}</td>
            <td>{{ aporte.fecha }}</td>
            <td>
              <span class="badge" :class="aporte.estadoCampana">{{ aporte.estadoCampana }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty-state">No has realizado ningún aporte hasta el momento.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const misAportes = ref([
  {
    id: 101,
    campanaTitulo: 'Teclado Mecánico Ergonómico',
    monto: 150,
    fecha: '2026-10-10',
    estadoCampana: 'exitosa'
  },
  {
    id: 102,
    campanaTitulo: 'Videojuego Indie RPG 2D',
    monto: 50,
    fecha: '2026-10-14',
    estadoCampana: 'activa'
  }
]);
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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