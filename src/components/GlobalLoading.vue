<template>
  <teleport to="body">
    <transition name="loading">
      <div 
        v-if="isLoading" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      >
        <div class="flex flex-col items-center gap-4">
          <!-- 모던한 로딩 스피너 -->
          <div class="relative flex">
            <div class="w-12 h-12 rounded-full border-[3px] border-gray-200"></div>
            <div class="w-12 h-12 rounded-full border-[3px] border-transparent border-t-indigo-600 absolute animate-spin"></div>
            <div class="w-12 h-12 rounded-full border-[3px] border-transparent border-l-indigo-600 absolute animate-pulse"></div>
          </div>
          <!-- 로딩 텍스트 -->
          <div class="text-white text-sm font-medium tracking-wider animate-pulse">
            LOADING...
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGlobalLoading } from '@/utils/globalLoading'

const isLoading = ref(false)
const { addListener, getState } = useGlobalLoading()

let unsubscribe = null

onMounted(() => {
  // 초기 상태 설정
  isLoading.value = getState()
  
  // 상태 변경 리스너 등록
  unsubscribe = addListener((loadingState) => {
    isLoading.value = loadingState
  })
})

onUnmounted(() => {
  // 리스너 해제
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style> 