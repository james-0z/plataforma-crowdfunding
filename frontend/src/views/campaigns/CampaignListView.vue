<template>
  <div>
    <header class="page-header">
      <h2>Catálogo de campañas</h2>
      <p class="subtitle">Descubre los proyectos disponibles en la plataforma.</p>
    </header>

    <div class="filters card">
      <div class="form-group">
        <label for="q">Buscar</label>
        <input id="q" v-model.trim="q" type="search" placeholder="Título o descripción…" />
      </div>
      <div class="form-group">
        <label for="cat">Categoría</label>
        <select id="cat" v-model="categoria">
          <option value="">Todas</option>
          <option v-for="c in categories.categories" :key="c.id" :value="c.slug">{{ c.nombre }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="estado">Estado</label>
        <select id="estado" v-model="estado">
          <option value="">Todos</option>
          <option value="activa">Activas</option>
          <option value="exitosa">Exitosas</option>
          <option value="fallida">No alcanzaron la meta</option>
        </select>
      </div>
    </div>

    <p v-if="error" class="alert alert-error">{{ error }}</p>
    <p v-else-if="loading" class="empty-state">Cargando campañas…</p>
    <p v-else-if="items.length === 0" class="empty-state">No hay campañas que coincidan con tu búsqueda.</p>
    <div v-else class="campaigns-grid">
      <CampaignCard v-for="c in items" :key="c.id" :campaign="c" />
    </div>

    <nav v-if="totalPages > 1" class="pagination" aria-label="Paginación">
      <button class="btn btn-ghost" :disabled="page <= 1" @click="page--">← Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button class="btn btn-ghost" :disabled="page >= totalPages" @click="page++">Siguiente →</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { campaignsApi } from '@/api/campaigns.api'
import { errorMessage } from '@/api/http'
import CampaignCard from '@/components/common/CampaignCard.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import type { Campaign, CampaignStatus } from '@/types'

const PAGE_SIZE = 9
const categories = useCategoryStore()

const items = ref<Campaign[]>([])
const total = ref(0)
const loading = ref(true)
const error = ref('')

const q = ref('')
const categoria = ref('')
const estado = ref<CampaignStatus | ''>('')
const page = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

let requestId = 0
async function load() {
  const current = ++requestId
  loading.value = true
  error.value = ''
  try {
    const result = await campaignsApi.list({
      q: q.value || undefined,
      categoria: categoria.value || undefined,
      estado: estado.value || undefined,
      page: page.value,
      pageSize: PAGE_SIZE,
    })
    if (current !== requestId) return // llegó una respuesta vieja: se ignora
    items.value = result.items
    total.value = result.total
  } catch (e) {
    if (current === requestId) error.value = errorMessage(e)
  } finally {
    if (current === requestId) loading.value = false
  }
}

// Al cambiar un filtro se vuelve a la página 1; el texto se espera un momento (debounce).
let timer: ReturnType<typeof setTimeout> | undefined
watch([q, categoria, estado], () => {
  page.value = 1
  clearTimeout(timer)
  timer = setTimeout(load, 300)
})
watch(page, load)

onMounted(() => {
  categories.load()
  load()
})
</script>

<style scoped>
.filters { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
@media (max-width: 720px) { .filters { grid-template-columns: 1fr; } }
</style>
