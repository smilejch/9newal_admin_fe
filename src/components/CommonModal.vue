<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 배경 오버레이 -->
    <div class="fixed inset-0 bg-black/60 transition-opacity"></div>
    
    <!-- 모달 컨테이너 -->
    <div :class="containerClass">
      <div :class="['relative transform overflow-hidden bg-white shadow-xl transition-all', widthClass, props.size === 'fullscreen' ? 'rounded-none flex flex-col h-full' : 'rounded-lg']">
        
        <!-- 상단 타이틀 영역 -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
            <div class="flex items-center space-x-2">
              <!-- 헤더 액션 슬롯 -->
              <slot name="header-actions"></slot>
              <!-- 닫기 버튼 -->
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 중간 모달 내용 영역 -->
        <div :class="[
          'px-6 py-4 overflow-y-auto',
          contentSizeClass
        ]">
          <div class="text-sm text-gray-700 leading-relaxed">
            <slot name="content"></slot>
          </div>
        </div>
        
        <!-- 하단 버튼 영역 -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex justify-end items-center">
            <!-- 버튼들 (오른쪽) -->
            <div class="flex space-x-3">
              <button
                v-if="showSave"
                @click="handleSave"
                class="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                저장
              </button>
              <button
                v-if="showDelete"
                @click="handleDelete"
                class="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                삭제
              </button>
              <button
                @click="closeModal"
                class="bg-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'big', 'huge', 'xl', 'full', 'fullscreen'].includes(value)
  },
  showSave: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  },
  // 고정 크기 옵션 (선택)
  fixedWidthClass: {
    type: String,
    default: ''
  },
  contentHeightClass: {
    type: String,
    default: ''
  }
})

// 사이즈별 클래스 계산
const modalSizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'max-w-sm'        // ~384px
    case 'big':
      return 'max-w-4xl'       // ~896px
    case 'huge':
      return 'max-w-5xl'       // ~1024px
    case 'xl':
      return 'max-w-6xl'       // ~1152px
    case 'full':
      return 'max-w-7xl'       // ~1280px
    case 'fullscreen':
      return 'max-w-none w-screen h-screen max-h-screen m-0 rounded-none' // 전체 화면
    default: // medium
      return 'max-w-2xl'       // ~672px
  }
})

// 폭 클래스: 고정 폭이 지정되면 그것을 사용하고, 아니면 기존 규칙 사용
const widthClass = computed(() => {
  if (props.fixedWidthClass) return props.fixedWidthClass
  return `w-full ${modalSizeClass.value}`
})

// 컨텐츠 높이 클래스: 전체화면이면 flex-1, 고정 높이가 있으면 그걸 사용, 아니면 기본 최대 높이
const contentSizeClass = computed(() => {
  if (props.size === 'fullscreen') return 'flex-1'
  if (props.contentHeightClass) return props.contentHeightClass
  return 'max-h-[80vh]'
})

// 전체화면일 때 컨테이너 클래스도 변경
const containerClass = computed(() => {
  if (props.size === 'fullscreen') {
    return 'flex min-h-full items-stretch justify-center'
  }
  return 'flex min-h-full items-center justify-center p-4'
})

const emit = defineEmits(['close', 'save', 'delete'])

const closeModal = () => {
  emit('close')
}

const handleSave = () => {
  emit('save')
}

const handleDelete = () => {
  emit('delete')
}
</script>

<style scoped>
/* 모달 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 버튼 호버 효과 */
button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>