<template>
  <div class="detail-container" v-if="campana">
    <header class="detail-header">
      <span class="badge" :class="campana.estado">{{ campana.estado }}</span>
      <h2>{{ campana.titulo }}</h2>
      <p class="creator">Creado por <strong>{{ campana.creador }}</strong></p>
    </header>

    <div class="detail-grid">
      <!-- Columna Principal: Información de la Campaña -->
      <div class="main-info">
        <section class="section">
          <h3>Descripción del Proyecto</h3>
          <p class="description-text">{{ campana.descripcion }}</p>
        </section>

        <section class="section">
          <h3>Reglas de Financiamiento</h3>
          <div class="rules-box">
            <p><strong>Esquema All-or-Nothing:</strong> Esta campaña solo recibirá los fondos si alcanza el 100% de la meta antes de la fecha límite. En caso de no cumplirse, todos los aportes serán reembolsados en su totalidad.</p>
          </div>
        </section>
      </div>

      <!-- Columna Lateral: Estado de Recaudación y Formulario de Aporte -->
      <aside class="funding-sidebar">
        <div class="stats-card">
          <ProgressBar 
            :current-amount="campana.montoRecaudado" 
            :goal-amount="campana.metaMonto" 
          />

          <div class="time-info">
            <small>📅 Fecha límite: <strong>{{ campana.fechaLimite }}</strong></small>
          </div>

          <hr class="divider" />

          <!-- Formulario de Aporte -->
          <form @submit.prevent="realizarAporte" class="contribution-form">
            <h4>Realizar un Aporte</h4>
            <div class="form-group">
              <label for="monto">Monto a aportar ($)</label>
              <input 
                type="number" 
                id="monto" 
                v-model.number="montoAporte" 
                min="1" 
                placeholder="Ej. 50" 
                required
              />
            </div>

            <button 
              type="submit" 
              class="btn-submit" 
              :disabled="campana.estado !== 'activa'"
            >
              {{ campana.estado === 'activa' ? 'Aportar a esta campaña' : 'Campaña Finalizada' }}
            </button>
          </form>

          <p v-if="mensajeExito" class="success-message">{{ mensajeExito }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import ProgressBar from '@/components/common/ProgressBar.vue';

interface CampanaDetalle {
  id: number;
  titulo: string;
  creador: string;
  descripcion: string;
  montoRecaudado: number;
  metaMonto: number;
  fechaLimite: string;
  estado: 'activa' | 'exitosa' | 'fallida';
}

const route = useRoute();
const campaignId = Number(route.params.id) || 1;

// Datos de prueba (simulando respuesta de API)
const campana = ref<CampanaDetalle>({
  id: campaignId,
  titulo: 'Videojuego Indie RPG 2D',
  creador: 'Estudio PixelArt',
  descripcion: 'Un emocionante juego de rol con estética retro de 16 bits, banda sonora orquestal grabada en vivo y más de 30 horas de juego. Buscamos financiar los costos de licencias de audio y distribución digital.',
  montoRecaudado: 3500,
  metaMonto: 5000,
  fechaLimite: '2026-11-30',
  estado: 'activa'
});

const montoAporte = ref<number | null>(null);
const mensajeExito = ref<string>('');

const realizarAporte = () => {
  if (!montoAporte.value || montoAporte.value <= 0) return;

  // Actualización local reactiva para previsualización
  campana.value.montoRecaudado += montoAporte.value;
  
  if (campana.value.montoRecaudado >= campana.value.metaMonto) {
    campana.value.estado = 'exitosa';
  }

  mensajeExito.value = `¡Gracias por tu aporte de $${montoAporte.value.toLocaleString()}!`;
  montoAporte.value = null;

  setTimeout(() => {
    mensajeExito.value = '';
  }, 4000);
};
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.detail-header h2 {
  font-size: 2rem;
  color: var(--color-secondary);
  margin: 0.5rem 0 0.25rem 0;
}

.creator {
  color: #64748b;
  font-size: 0.95rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: bold;
}
.badge.activa { background-color: #dbeafe; color: #1e40af; }
.badge.exitosa { background-color: #dcfce7; color: #166534; }
.badge.fallida { background-color: #fee2e2; color: #991b1b; }

.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.main-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--color-secondary);
}

.description-text {
  color: var(--color-text);
  line-height: 1.7;
}

.rules-box {
  background-color: #f1f5f9;
  border-left: 4px solid var(--color-primary);
  padding: 1rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-size: 0.9rem;
  color: #334155;
}

.funding-sidebar {
  display: flex;
  flex-direction: column;
}

.stats-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.time-info {
  color: #64748b;
  font-size: 0.9rem;
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
}

.contribution-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contribution-form h4 {
  font-size: 1.1rem;
  color: var(--color-secondary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-group input {
  padding: 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.btn-submit {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-submit:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.success-message {
  color: #166534;
  background-color: #dcfce7;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  text-align: center;
}
</style>