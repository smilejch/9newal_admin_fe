<template>
  <div class="flex gap-1 items-center">
    <!-- 일반 버튼들 -->
    <button 
      v-for="button in buttons" 
      :key="button.value"
      @click="$emit('button-click', button.value)"
      :class="[
        'px-2 py-1 rounded transition-colors cursor-pointer text-xs',
        button.color ? getColorClass(button.color) : (
          currentValue === button.value 
            ? activeClass
            : inactiveClass
        )
      ]"
    >
      {{ button.label }}
    </button>

    <!-- 드롭다운 버튼 (dropdownButtons가 있을 때만 표시) -->
    <div v-if="dropdownButtons && dropdownButtons.length > 0" class="relative" ref="dropdownRef">
      <button
        @click="toggleDropdown"
        class="px-2 py-1 rounded transition-colors cursor-pointer text-xs bg-blue-500 text-white hover:bg-blue-600 flex items-center"
      >
        <span class="material-icons" style="font-size: 24px">menu</span>
      </button>

      <!-- 드롭다운 메뉴 -->
      <div 
        v-show="isDropdownOpen"
        class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-48"
      >
        <div v-for="category in dropdownButtons" :key="category.title" class="border-b border-gray-100 last:border-b-0">
          <div class="px-3 py-2 text-xs font-medium text-gray-600 bg-blue-50 border-b border-gray-200">
            {{ category.title }}
          </div>
          <div class="py-1">
            <button
              v-for="child in category.children"
              :key="child.value"
              @click="handleDropdownClick(child.value)"
              class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {{ child.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  buttons: {
    type: Array,
    required: true,
    // 예: [{ label: 'Normal', value: 'normal', color: 'blue' }, { label: 'Paging', value: 'paging' }]
  },
  dropdownButtons: {
    type: Array,
    default: () => [],
    // 예: [{ title: '다운로드', children: [{ label: '엑셀 다운로드', value: 'excelDownload' }] }]
  },
  currentValue: {
    type: String,
    default: ''
  },
  activeClass: {
    type: String,
    default: 'bg-green-600 text-white'
  },
  inactiveClass: {
    type: String,
    default: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
  }
})

const emit = defineEmits(['button-click', 'dropdown-click'])

// 드롭다운 상태
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

// 드롭다운 토글
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 드롭다운 아이템 클릭
const handleDropdownClick = (value) => {
  emit('dropdown-click', value)
  isDropdownOpen.value = false
}

// 색상 클래스 생성
const getColorClass = (color) => {
  const colorMap = {
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    green: 'bg-green-600 text-white hover:bg-green-700',
    red: 'bg-red-600 text-white hover:bg-red-700',
    yellow: 'bg-yellow-500 text-white hover:bg-yellow-600',
    purple: 'bg-purple-600 text-white hover:bg-purple-700',
    gray: 'bg-gray-600 text-white hover:bg-gray-700',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700',
    pink: 'bg-pink-600 text-white hover:bg-pink-700'
  }
  return colorMap[color] || 'bg-gray-600 text-white hover:bg-gray-700'
}

// 외부 클릭 감지 (드롭다운 닫기)
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 공통 버튼 스타일은 전역 CSS로 이동되었습니다 */
</style>
