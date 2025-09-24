<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <!-- Subtle background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-32 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
    </div>
    
    <div class="relative w-full max-w-md">
      <!-- Admin Login Card -->
      <div class="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            9NEWALL
          </h1>
          <p class="text-gray-600 text-sm">관리자 시스템</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
          </div>
          
          <!-- Username field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 ml-1">관리자 아이디</label>
            <div class="relative">
              <input
                v-model="credentials.user_id"
                type="text"
                class="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="아이디를 입력해주세요"
                required
              />
              <div class="absolute inset-y-0 right-4 flex items-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Password field -->
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 ml-1">비밀번호</label>
            <div class="relative">
              <input
                v-model="credentials.user_password"
                type="password"
                class="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="비밀번호를 입력해주세요"
                required
              />
              <div class="absolute inset-y-0 right-4 flex items-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading || !credentials.user_id || !credentials.user_password"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
          >
            <span v-if="!isLoading" class="flex items-center justify-center gap-2">
              로그인
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              로그인 중...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  user_id: '',
  user_password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.loginAction(credentials.value)
    // 로그인 성공 시 대시보드로 이동
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '로그인에 실패했습니다.'
    console.error('로그인 에러:', error)
  } finally {
    isLoading.value = false
  }
}
</script>