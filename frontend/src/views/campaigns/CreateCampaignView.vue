<template>
  <div class="create-campaign">
    <header class="page-header">
      <h2>Crear nueva campaña</h2>
      <p class="subtitle">Define la meta y la fecha de cierre bajo el modelo <strong>All-or-Nothing</strong>.</p>
    </header>

    <form class="card" novalidate @submit.prevent="submit">
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>

      <div class="form-group">
        <label for="titulo">Título *</label>
        <input id="titulo" v-model.trim="form.titulo" type="text" maxlength="150" placeholder="Ej. Teclado mecánico ergonómico" required />
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción *</label>
        <textarea id="descripcion" v-model.trim="form.descripcion" rows="6" maxlength="5000" placeholder="Describe el proyecto, tus objetivos y en qué usarás los fondos…" required></textarea>
        <small class="hint">{{ form.descripcion.length }} / 5000 (mínimo 20 caracteres)</small>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="meta">Meta de recaudación *</label>
          <input id="meta" v-model.number="form.metaMonto" type="number" min="50000" step="1000" placeholder="Ej. 5000000" required />
          <small class="hint">Si no alcanzas el 100&nbsp;% al cierre, los aportes se devuelven.</small>
        </div>
        <div class="form-group">
          <label for="fecha">Fecha límite *</label>
          <input id="fecha" v-model="form.fechaLimite" type="date" :min="minDate" :max="maxDate" required />
          <small class="hint">Entre mañana y 60 días.</small>
        </div>
      </div>

      <div class="form-group">
        <label for="categoria">Categoría *</label>
        <select id="categoria" v-model.number="form.categoriaId" required>
          <option :value="0" disabled>Selecciona una categoría</option>
          <option v-for="c in categories.categories" :key="c.id" :value="c.id">{{ c.nombre }}</option>
        </select>
      </div>

      <div class="form-actions">
        <router-link to="/dashboard/mis-campanas" class="btn btn-ghost">Cancelar</router-link>
        <button type="submit" class="btn btn-primary" :disabled="sending">{{ sending ? 'Publicando…' : 'Publicar campaña' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { campaignsApi } from '@/api/campaigns.api'
import { errorMessage } from '@/api/http'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatMoney, todayLocal } from '@/utils/format'

const router = useRouter()
const categories = useCategoryStore()

// Fechas en hora LOCAL (con toISOString quedaban desfasadas por la zona horaria).
const minDate = todayLocal(1)
const maxDate = todayLocal(60)

const form = reactive({ titulo: '', descripcion: '', metaMonto: null as number | null, fechaLimite: '', categoriaId: 0 })
const sending = ref(false)
const error = ref('')

onMounted(() => categories.load())

async function submit() {
  error.value = ''
  if (form.titulo.length < 5) return void (error.value = 'El título debe tener al menos 5 caracteres.')
  if (form.descripcion.length < 20) return void (error.value = 'La descripción debe tener al menos 20 caracteres.')
  if (!form.metaMonto || !Number.isInteger(form.metaMonto) || form.metaMonto < 50000) return void (error.value = `La meta mínima es ${formatMoney(50000)}.`)
  if (!form.fechaLimite) return void (error.value = 'Elige la fecha límite.')
  if (!form.categoriaId) return void (error.value = 'Selecciona una categoría.')

  sending.value = true
  try {
    const { campaign } = await campaignsApi.create({ ...form, metaMonto: form.metaMonto })
    await router.push({ name: 'campaign-detail', params: { id: campaign.id } })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
.create-campaign { max-width: 760px; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
</style>
