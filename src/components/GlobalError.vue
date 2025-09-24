<template>
  <teleport to="body">
    <transition name="error-modal">
      <div 
        v-if="errorStore.showGlobalError && errorStore.currentError" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="closeError"
      >
        <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
          <!-- 헤더 -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <!-- 에러 타입별 아이콘 -->
              <div class="flex-shrink-0">
                <svg v-if="currentError.type === 'NETWORK_ERROR'" class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <svg v-else-if="currentError.type === 'SERVER_ERROR'" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="currentError.type === 'CLIENT_ERROR'" class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">오류 발생</h3>
                <p class="text-sm text-gray-500">{{ getErrorTypeText(currentError.type) }}</p>
              </div>
            </div>
            <button 
              @click="closeError"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 내용 -->
          <div class="p-4 max-h-[60vh] overflow-y-auto">
            <!-- 에러 메시지 -->
            <div class="mb-4">
              <h4 class="font-medium text-gray-900 mb-2">오류 내용</h4>
              <p class="text-gray-700 bg-gray-50 p-3 rounded-md">{{ currentError.message }}</p>
            </div>
          </div>

          <!-- 푸터 -->
          <div class="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50">
            <button 
              @click="closeError"
              class="bg-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useErrorStore } from '@/store/error'

const errorStore = useErrorStore()
const showDetails = ref(false)
const showStack = ref(false)

const isDev = import.meta.env.DEV
const currentError = computed(() => errorStore.currentError)

const getErrorTypeText = (type) => {
  const typeMap = {
    'CLIENT_ERROR': '클라이언트 오류',
    'SERVER_ERROR': '서버 오류',
    'NETWORK_ERROR': '네트워크 오류',
    'JAVASCRIPT_ERROR': 'JavaScript 오류',
    'UNKNOWN_ERROR': '알 수 없는 오류'
  }
  return typeMap[type] || '오류'
}

const closeError = () => {
  errorStore.hideError()
}

</script>

<style scoped>
.error-modal-enter-active,
.error-modal-leave-active {
  transition: opacity 0.3s ease;
}

.error-modal-enter-from,
.error-modal-leave-to {
  opacity: 0;
}

.error-modal-enter-active .bg-white,
.error-modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.error-modal-enter-from .bg-white,
.error-modal-leave-to .bg-white {
  transform: scale(0.95) translateY(-10px);
}
</style> 