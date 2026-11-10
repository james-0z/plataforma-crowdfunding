import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
    guestOnly?: boolean
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: 'Inicio' } },
      { path: 'campanas', name: 'campaigns', component: () => import('@/views/campaigns/CampaignListView.vue'), meta: { title: 'Campañas' } },
      { path: 'campanas/:id(\\d+)', name: 'campaign-detail', component: () => import('@/views/campaigns/CampaignDetailView.vue'), meta: { title: 'Campaña' } },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: 'Iniciar sesión' } },
      { path: 'registro', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { title: 'Crear cuenta' } },
    ],
  },
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    redirect: { name: 'my-campaigns' },
    children: [
      { path: 'mis-campanas', name: 'my-campaigns', component: () => import('@/views/dashboard/MyCampaignsView.vue'), meta: { title: 'Mis campañas' } },
      { path: 'mis-aportes', name: 'my-contributions', component: () => import('@/views/dashboard/MyContributionsView.vue'), meta: { title: 'Mis aportes' } },
      { path: 'crear-campana', name: 'create-campaign', component: () => import('@/views/campaigns/CreateCampaignView.vue'), meta: { title: 'Nueva campaña' } },
      { path: 'admin', name: 'admin', component: () => import('@/views/dashboard/AdminView.vue'), meta: { requiresAdmin: true, title: 'Administración' } },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: 'No encontrada' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init() // recupera la sesión (refresh token) antes de decidir

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'my-campaigns' }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'my-campaigns' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · CrowdFund` : 'CrowdFund'
})

export default router
