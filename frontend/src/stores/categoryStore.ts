import { defineStore } from 'pinia'
import { ref } from 'vue'
import { campaignsApi } from '@/api/campaigns.api'
import type { Category } from '@/types'

/** Las categorías vienen de la BD (una sola fuente de verdad) y se cargan una vez. */
export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  let loading: Promise<void> | null = null

  function load(): Promise<void> {
    loading ??= campaignsApi
      .categories()
      .then((items) => {
        categories.value = items
      })
      .catch(() => {
        loading = null // permite reintentar
      })
    return loading
  }

  return { categories, load }
})
