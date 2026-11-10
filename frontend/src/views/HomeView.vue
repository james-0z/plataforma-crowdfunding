<template>
  <div>
    <section class="hero">
      <h1>Financia proyectos con el modelo All-or-Nothing</h1>
      <p>
        Apoya ideas que te inspiran. Si la campaña alcanza su meta antes de la fecha límite, el proyecto se
        financia. Si no, <strong>todos los aportes se reembolsan</strong>.
      </p>
      <div class="hero-actions">
        <router-link to="/campanas" class="btn btn-primary">Explorar campañas</router-link>
        <router-link :to="auth.isAuthenticated ? '/dashboard/crear-campana' : '/auth/registro'" class="btn btn-outline">
          Lanzar mi proyecto
        </router-link>
      </div>
    </section>

    <section class="how">
      <div class="card"><h3>1 · Aporta</h3><p class="muted">Elige un proyecto y aporta el monto que quieras.</p></div>
      <div class="card"><h3>2 · Espera el cierre</h3><p class="muted">La campaña corre hasta su fecha límite.</p></div>
      <div class="card"><h3>3 · Todo o nada</h3><p class="muted">Meta lograda: se financia. Si no: reembolso total.</p></div>
    </section>

    <section>
      <div class="header-actions">
        <h2>Campañas destacadas</h2>
        <router-link to="/campanas">Ver todas →</router-link>
      </div>
      <p v-if="loading" class="empty-state">Cargando campañas…</p>
      <p v-else-if="error" class="alert alert-error">{{ error }}</p>
      <p v-else-if="campaigns.length === 0" class="empty-state">Aún no hay campañas activas. ¡Sé el primero en crear una!</p>
      <div v-else class="campaigns-grid">
        <CampaignCard v-for="c in campaigns" :key="c.id" :campaign="c" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { campaignsApi } from '@/api/campaigns.api'
import { errorMessage } from '@/api/http'
import CampaignCard from '@/components/common/CampaignCard.vue'
import { useAuthStore } from '@/stores/authStore'
import type { Campaign } from '@/types'

const auth = useAuthStore()
const campaigns = ref<Campaign[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    campaigns.value = (await campaignsApi.list({ estado: 'activa', pageSize: 3 })).items
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero { text-align: center; padding: 3rem 1rem; max-width: 760px; margin: 0 auto; }
.hero h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin-bottom: 1rem; }
.hero p { color: var(--color-muted); font-size: 1.1rem; }
.hero-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 1.75rem; flex-wrap: wrap; }
.how { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin: 1rem 0 3rem; }
</style>
