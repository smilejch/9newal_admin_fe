<template>
  <div class="filter-section bg-white p-3 rounded-lg shadow-sm">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-sm font-semibold text-gray-700"></h2>
      <button 
        v-if="$slots['expanded-filters']"
        @click="toggleFilters" 
        class="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
      >
        {{ isFiltersExpanded ? '접기' : '펼치기' }}
        <svg 
          :class="['w-3 h-3 transition-transform', isFiltersExpanded ? 'rotate-180' : '']" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>
    
    <!-- 기본 필터 (항상 표시) -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
      <slot name="basic-filters">
      </slot>
    </div>

    <!-- 확장 필터 (접기/펼치기) -->
    <div v-show="isFiltersExpanded" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
      <slot name="expanded-filters">
      </slot>
    </div>

    <!-- 커스텀 필터 영역 -->
    <slot name="custom-filters"></slot>

    <!-- 버튼 영역 - 우측 정렬 -->
    <div class="flex items-center justify-end flex-wrap gap-2">
      <div class="flex gap-1 flex-wrap">
        <slot name="buttons"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits([
  'search',
  'reset'
])

const isFiltersExpanded = ref(false)

const toggleFilters = () => {
  isFiltersExpanded.value = !isFiltersExpanded.value
}

</script>

<style scoped>
.filter-section {
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
  height: auto;
  transition: all 0.3s ease;
}

/* 공통 버튼 스타일은 전역 CSS로 이동되었습니다 */

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .flex {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .filter-section {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
