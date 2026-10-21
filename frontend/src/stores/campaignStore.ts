import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Campaign {
  id: number;
  titulo: string;
  creador: string;
  descripcion: string;
  montoRecaudado: number;
  metaMonto: number;
  fechaLimite: string;
  categoria: string;
  estado: 'activa' | 'exitosa' | 'fallida';
}

export const useCampaignStore = defineStore('campaign', () => {
  const campaigns = ref<Campaign[]>([
    {
      id: 1,
      titulo: 'Videojuego Indie RPG 2D',
      creador: 'Estudio PixelArt',
      descripcion: 'Un emocionante juego de rol con estética retro de 16 bits, banda sonora orquestal grabada en vivo y más de 30 horas de juego.',
      montoRecaudado: 3500,
      metaMonto: 5000,
      fechaLimite: '2026-11-30',
      categoria: 'videojuegos',
      estado: 'activa'
    },
    {
      id: 2,
      titulo: 'Teclado Mecánico Ergonómico Custom',
      creador: 'TechCraft',
      descripcion: 'Teclado mecánico modular con switches intercambiables en caliente y cuerpo de aluminio anodizado.',
      montoRecaudado: 12000,
      metaMonto: 10000,
      fechaLimite: '2026-10-15',
      categoria: 'tecnologia',
      estado: 'exitosa'
    }
  ]);

  const selectedCategory = ref<string>('todas');

  // Obtener campañas filtradas por categoría activa
  const filteredCampaigns = computed(() => {
    if (selectedCategory.value === 'todas') return campaigns.value;
    return campaigns.value.filter(c => c.categoria.toLowerCase() === selectedCategory.value.toLowerCase());
  });

  const getCampaignById = (id: number) => {
    return campaigns.value.find(c => c.id === id);
  };

  const createCampaign = (newCampaignData: Omit<Campaign, 'id' | 'montoRecaudado' | 'estado'>) => {
    const newCampaign: Campaign = {
      ...newCampaignData,
      id: campaigns.value.length + 1,
      montoRecaudado: 0,
      estado: 'activa'
    };
    campaigns.value.unshift(newCampaign);
  };

  const makeContribution = (campaignId: number, amount: number): boolean => {
    const campaign = campaigns.value.find(c => c.id === campaignId);
    if (!campaign || campaign.estado !== 'activa') return false;

    campaign.montoRecaudado += amount;

    // Regla de negocio All-or-Nothing: Verificar si alcanzó el 100%
    if (campaign.montoRecaudado >= campaign.metaMonto) {
      campaign.estado = 'exitosa';
    }

    return true;
  };

  return {
    campaigns,
    selectedCategory,
    filteredCampaigns,
    getCampaignById,
    createCampaign,
    makeContribution
  };
});