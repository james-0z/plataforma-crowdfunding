<template>
  <div class="create-campaign-container">
    <header class="page-header">
      <h2>Crear Nueva Campaña</h2>
      <p class="subtitle">
        Define la meta financiera y la fecha de cierre bajo el modelo <strong>All-or-Nothing</strong>.
      </p>
    </header>

    <form @submit.prevent="guardarCampana" class="form-card">
      <!-- Título de la Campaña -->
      <div class="form-group">
        <label for="titulo">Título de la Campaña *</label>
        <input 
          type="text" 
          id="titulo" 
          v-model="form.titulo" 
          placeholder="Ej. Teclado Mecánico Ergonómico Custom" 
          required 
        />
      </div>

      <!-- Descripción -->
      <div class="form-group">
        <label for="descripcion">Descripción del Proyecto *</label>
        <textarea 
          id="descripcion" 
          v-model="form.descripcion" 
          rows="5" 
          placeholder="Describe la propuesta, objetivos y en qué usarás los fondos recaudados..." 
          required
        ></textarea>
      </div>

      <!-- Fila doble: Meta ($) y Fecha Límite -->
      <div class="form-row">
        <div class="form-group">
          <label for="metaMonto">Meta de Recaudación ($ USD) *</label>
          <input 
            type="number" 
            id="metaMonto" 
            v-model.number="form.metaMonto" 
            min="10" 
            step="10" 
            placeholder="Ej. 5000" 
            required 
          />
          <small class="hint">Si no alcanzas el 100% de esta meta, los fondos se devuelven.</small>
        </div>

        <div class="form-group">
          <label for="fechaLimite">Fecha de Cierre (Límite) *</label>
          <input 
            type="date" 
            id="fechaLimite" 
            v-model="form.fechaLimite" 
            :min="fechaMinima" 
            required 
          />
        </div>
      </div>

      <!-- Categoría -->
      <div class="form-group">
        <label for="categoria">Categoría *</label>
        <select id="categoria" v-model="form.categoria" required>
          <option value="" disabled>Selecciona una categoría</option>
          <option value="tecnologia">Tecnología</option>
          <option value="videojuegos">Videojuegos</option>
          <option value="arte">Arte & Cine</option>
          <option value="diseno">Diseño & Hardware</option>
        </select>
      </div>

      <!-- Mensajes de Estado -->
      <div v-if="mensajeExito" class="alert success">
        {{ mensajeExito }}
      </div>

      <!-- Botones de Acción -->
      <div class="form-actions">
        <router-link to="/dashboard/mis-campanas" class="btn-cancel">
          Cancelar
        </router-link>
        <button type="submit" class="btn-submit" :disabled="enviando">
          {{ enviando ? 'Publicando...' : 'Publicar Campaña' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface FormCampana {
  titulo: string;
  descripcion: string;
  metaMonto: number | null;
  fechaLimite: string;
  categoria: string;
}

const router = useRouter();

const form = ref<FormCampana>({
  titulo: '',
  descripcion: '',
  metaMonto: null,
  fechaLimite: '',
  categoria: ''
});

const enviando = ref<boolean>(false);
const mensajeExito = ref<string>('');

// Restricción: La fecha mínima de cierre es a partir de mañana
const fechaMinima = computed(() => {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return manana.toISOString().split('T')[0];
});

const guardarCampana = async () => {
  if (!form.value.titulo || !form.value.metaMonto || !form.value.fechaLimite) return;

  enviando.value = true;

  // Simulación de respuesta de API
  setTimeout(() => {
    enviando.value = false;
    mensajeExito.value = '¡Campaña creada exitosamente!';

    setTimeout(() => {
      router.push('/dashboard/mis-campanas');
    }, 1500);
  }, 1000);
};
</script>

<style scoped>
.create-campaign-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header h2 {
  font-size: 1.8rem;
  color: var(--color-secondary);
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.form-card {
  background-color: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

input, textarea, select {
  padding: 0.65rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: inherit;
  background-color: #fff;
  transition: border-color 0.2s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.hint {
  font-size: 0.75rem;
  color: #64748b;
}

.alert.success {
  background-color: #dcfce7;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-weight: 500;
  text-align: center;
}

.btn-submit {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-submit:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}
</style>