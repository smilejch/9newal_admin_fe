<template>
  <div class="h-screen bg-gray-100 flex flex-col">
    <!-- Header - 전체 상단 고정 -->
    <DefaultHeader 
      @toggle-sidebar="toggleSidebar"
      :sidebar-visible="sidebarVisible"
    />
    
    <!-- Main content area with sidebar -->
    <div class="flex flex-1 min-h-0">
      <!-- Sidebar -->
      <div 
        :class="[
          'transition-all duration-300 ease-in-out',
          sidebarVisible ? 'w-64' : 'w-0',
          'overflow-hidden'
        ]"
      >
        <DefaultSidebar 
          v-if="sidebarVisible"
          :collapsed="false" 
        />
      </div>
      
      <!-- Main content -->
      <div class="flex flex-col flex-1 min-w-0">
        <main class="flex-1 overflow-y-auto p-4 md:p-3">
          <router-view />
        </main>
        <DefaultFooter />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DefaultHeader from './DefaultHeader.vue'
import DefaultFooter from './DefaultFooter.vue'
import DefaultSidebar from './DefaultSidebar.vue'

const sidebarVisible = ref(true)

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}
</script>