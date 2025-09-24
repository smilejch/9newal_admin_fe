<template>
  <!-- 커스텀 알림창 -->
  <div v-if="alertModal.isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 배경 오버레이 -->
    <div class="fixed inset-0 bg-black/60 transition-opacity"></div>
    
    <!-- 알림창 컨테이너 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
        
        <!-- 상단 아이콘 및 타이틀 영역 -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center">
            <!-- 타입별 아이콘 -->
            <div class="flex-shrink-0">
              <div v-if="alertModal.type === 'error'" class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div v-else-if="alertModal.type === 'success'" class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div v-else-if="alertModal.type === 'warning'" class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div v-else class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            
            <!-- 타이틀과 메시지 -->
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ alertModal.title }}</h3>
              <p class="mt-1 text-sm text-gray-500 whitespace-pre-line">{{ alertModal.message }}</p>
            </div>
          </div>
          
          <!-- Details 테이블 (details가 있을 때만 표시) -->
          <div v-if="alertModal.details && alertModal.details.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">내용</h4>
            <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">번호</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(detail, index) in alertModal.details" :key="index" class="hover:bg-gray-50">
                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{{ index + 1 }}</td>
                    <td class="px-3 py-2 text-sm text-gray-900 whitespace-pre-line">{{ detail }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- 하단 버튼 영역 -->
        <div class="bg-gray-50 px-6 py-4">
          <div class="flex justify-end">
            <button
              @click="closeAlert"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer',
                alertModal.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' :
                alertModal.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' :
                alertModal.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500' :
                'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              ]"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 커스텀 확인창 -->
  <div v-if="confirmModal.isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 배경 오버레이 -->
    <div class="fixed inset-0 bg-black/60 transition-opacity"></div>
    
    <!-- 확인창 컨테이너 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
        
        <!-- 상단 아이콘 및 타이틀 영역 -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center">
            <!-- 질문 아이콘 -->
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            
            <!-- 타이틀과 메시지 -->
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">{{ confirmModal.title }}</h3>
              <p class="mt-1 text-sm text-gray-500 whitespace-pre-line">{{ confirmModal.message }}</p>
            </div>
          </div>
        </div>
        
        <!-- 하단 버튼 영역 -->
        <div class="bg-gray-50 px-6 py-4">
          <div class="flex justify-end space-x-3">
            <button
              @click="closeConfirm(true)"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer',
                confirmModal.confirmType === 'save' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' :
                confirmModal.confirmType === 'delete' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' :
                'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              ]"
            >
              {{ confirmModal.confirmText }}
            </button>
            <button
              @click="closeConfirm(false)"
              class="px-4 py-2 text-sm font-medium rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              {{ confirmModal.cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { alertModal, confirmModal, closeAlert, closeConfirm } from '@/store/alert'
</script>

<style scoped>
/* 알림창 애니메이션 */
.alert-enter-active,
.alert-leave-active {
  transition: opacity 0.3s ease;
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
}
</style>
