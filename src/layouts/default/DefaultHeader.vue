<template>
  <header class="bg-gray-800 shadow-lg px-3 md:px-4 py-2 flex items-center justify-between w-full z-10">
    <div class="flex items-center gap-4">
      <!-- 햄버거 메뉴 버튼 -->
      <button 
        @click="emit('toggle-sidebar')"
        class="p-1.5 hover:bg-gray-700 rounded-lg transition-colors flex items-center cursor-pointer"
      >
        <span class="material-icons text-lg text-white">menu</span>
      </button>
      
      <!-- 로고/브랜드명 -->
      <div class="flex items-center">
        <h1 class="text-lg font-bold leading-none text-white tracking-tight">
          9NEWALL
        </h1>
        <span class="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
          Admin
        </span>
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <!-- 사용자 아바타 -->
      <div class="relative user-dropdown-container">
        <button
          @click="showUser = !showUser"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          :aria-expanded="showUser ? 'true' : 'false'"
          aria-label="계정 메뉴 열기"
          title="계정 메뉴"
          type="button"
        >
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span class="material-icons text-white text-sm">person</span>
          </div>
          <div class="hidden md:block text-left">
            <div class="text-xs font-medium text-white">{{ authStore.userName }}</div>
            <div class="text-xs text-gray-300">{{ authStore.userRole }}</div>
          </div>
          <span class="material-icons text-gray-300 text-sm hidden md:inline">expand_more</span>
        </button>
      </div>
      
      <!-- User Dropdown -->
      <div v-if="showUser" class="absolute right-3 top-12 md:right-4 md:top-13 w-56 bg-white shadow-lg rounded-xl border border-gray-100 z-10 user-dropdown-container">
        <div class="p-4 border-b border-gray-100">
          <p class="text-sm font-semibold text-gray-900">{{ authStore.userName }}</p>
          <p class="text-xs text-gray-500">{{ authStore.userEmail }}</p>
        </div>
        
        <div class="py-2">
          <button
            @click="openPasswordChangeModal"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
          >
            <span class="material-icons text-base text-gray-500">lock</span>
            비밀번호 변경
          </button>
          
          <button
            @click="openProfileModal"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
          >
            <span class="material-icons text-base text-gray-500">person</span>
            프로필 설정
          </button>
          
          <hr class="my-2 border-gray-100">
          
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3 text-red-600"
          >
            <span class="material-icons text-base">logout</span>
            로그아웃
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- 비밀번호 변경 모달 -->
  <div v-if="showPasswordChangeModal" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 배경 오버레이 -->
    <div class="fixed inset-0 bg-black/60 transition-opacity" @click="closePasswordChangeModal"></div>
    
    <!-- 모달 컨테이너 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
        
        <!-- 헤더 -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">비밀번호 변경</h3>
            <button
              @click="closePasswordChangeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 폼 내용 -->
        <div class="px-6 pb-4">
          <form @submit.prevent="handlePasswordChange" class="space-y-4">
            <!-- 현재 패스워드 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
              <input
                v-model="currentPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="현재 비밀번호를 입력하세요"
                required
              />
            </div>
            
            <!-- 새 패스워드 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
              <input
                v-model="newPassword"
                type="password"
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="새 비밀번호를 입력하세요"
                required
              />
              <p class="mt-1 text-xs text-gray-500">8자리 이상 입력해주세요</p>
            </div>
            
            <!-- 새 패스워드 확인 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
              <input
                v-model="newPasswordConfirm"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />
              <p v-if="newPasswordConfirm && !isPasswordMatch" class="mt-1 text-xs text-red-600">비밀번호가 일치하지 않습니다.</p>
            </div>
          </form>
        </div>
        
        <!-- 하단 버튼 -->
        <div class="bg-gray-50 px-6 py-4">
          <div class="flex justify-end space-x-3">
            <button
              @click="handlePasswordChange"
              :disabled="!isFormValid"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              변경
            </button>
            <button
              @click="closePasswordChangeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { showAlert } from '@/store/alert';
import { changePassword } from '@/modules/auth/api/auth';

// Props 정의
const props = defineProps({
  sidebarVisible: {
    type: Boolean,
    default: false
  }
})

// Emits 정의
const emit = defineEmits(['toggle-sidebar'])

const showUser = ref(false);
const authStore = useAuthStore();
const router = useRouter();

// 비밀번호 변경 모달 관련
const showPasswordChangeModal = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const newPasswordConfirm = ref('');


// 비밀번호 검증
const isPasswordMatch = computed(() => {
  return newPassword.value && newPasswordConfirm.value && newPassword.value === newPasswordConfirm.value;
});

const isFormValid = computed(() => {
  return currentPassword.value && newPassword.value.length >= 8 && isPasswordMatch.value;
});

// 비밀번호 변경 모달 열기/닫기
const openPasswordChangeModal = () => {
  resetPasswordForm();
  showPasswordChangeModal.value = true;
  showUser.value = false;
};

const closePasswordChangeModal = () => {
  resetPasswordForm();
  showPasswordChangeModal.value = false;
};

const resetPasswordForm = () => {
  currentPassword.value = '';
  newPassword.value = '';
  newPasswordConfirm.value = '';
};

// 프로필 모달 (향후 구현)
const openProfileModal = () => {
  showUser.value = false;
  console.log('프로필 설정 모달 열기');
};

// 비밀번호 변경 함수
const handlePasswordChange = async () => {
  if (!isFormValid.value) return;
  
  try {
    await changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
      new_password_confirm: newPasswordConfirm.value
    });
    
    showAlert('success', '비밀번호 변경 완료', '비밀번호가 성공적으로 변경되었습니다.');
    closePasswordChangeModal();
    
    // 비밀번호 변경 후 선택적으로 재로그인 요구
    // setTimeout(() => {
    //   authStore.logout();
    //   router.push('/login');
    // }, 2000);
    
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    let errorMessage = '비밀번호 변경에 실패했습니다.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 400) {
      errorMessage = '현재 비밀번호가 올바르지 않습니다.';
    }
    
    showAlert('error', '비밀번호 변경 실패', errorMessage);
  }
};

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}

// Click outside to close user dropdown
const handleClickOutside = (event) => {
  if (showUser.value && !event.target.closest('.user-dropdown-container')) {
    showUser.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})
</script>