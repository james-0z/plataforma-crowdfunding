import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// Layouts
import MainLayout from '@/layouts/MainLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

// Vistas públicas
import HomeView from '@/views/HomeView.vue';
import CampaignListView from '@/views/campaigns/CampaignListView.vue';
import CampaignDetailView from '@/views/campaigns/CampaignDetailView.vue';
import CreateCampaignView from '@/views/campaigns/CreateCampaignView.vue';

// Vistas Dashboard
import MyCampaignsView from '@/views/dashboard/MyCampaignsView.vue';
import MyContributionsView from '@/views/dashboard/MyContributionsView.vue';

// Vistas Auth
import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: HomeView },
      { path: 'campanas', name: 'CampaignList', component: CampaignListView },
      { path: 'campanas/:id', name: 'CampaignDetail', component: CampaignDetailView }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'Login', component: LoginView },
      { path: 'registro', name: 'Register', component: RegisterView }
    ]
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: 'mis-campanas', name: 'MyCampaigns', component: MyCampaignsView },
      { path: 'mis-aportes', name: 'MyContributions', component: MyContributionsView },
      { path: 'crear-campana', name: 'CreateCampaign', component: CreateCampaignView }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;