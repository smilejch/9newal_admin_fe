<template>
  <div 
    class="bg-gray-800 shadow-lg h-full transition-all duration-300 w-56"
  >
    <div class="p-3 h-full flex flex-col">      
      <!-- Menu -->
      <div class="flex-1 overflow-y-auto">
        <MenuParents 
          :menus="menus" 
          :collapsed="false" 
          :is-hovered="false"
          :is-mobile="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import MenuParents from './MenuParents.vue'

const menus = ref([])
const authStore = useAuthStore()

// 메뉴 데이터 가져오기
const fetchMenus = () => {
  try {
    // Pinia store에서 메뉴 데이터 가져오기
    if (authStore.menu && authStore.menu.length > 0) {
      menus.value = authStore.menu
    } else {
      // localStorage에서 백업 데이터 가져오기
      const storedMenu = localStorage.getItem('menu')
      if (storedMenu) {
        menus.value = JSON.parse(storedMenu)
      } else {
        menus.value = []
      }
    }
  } catch (error) {
    console.error('메뉴 데이터를 가져오는데 실패했습니다:', error)
    menus.value = []
  }
}

// 메뉴 데이터 변경 감지
watch(() => authStore.menu, (newMenu) => {
  if (newMenu && newMenu.length > 0) {
    menus.value = newMenu
  }
}, { deep: true })

// 컴포넌트 마운트 시 메뉴 데이터 가져오기
onMounted(() => {
  fetchMenus()
})
</script>

