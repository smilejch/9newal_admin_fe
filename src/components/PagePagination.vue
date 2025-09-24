<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span class="text-sm text-gray-600">
        총 {{ totalItems }}개 중 {{ startItem }}-{{ endItem }}개 표시
      </span>
    </div>
    
    <div class="pagination-controls">
      <!-- 이전 페이지 그룹 -->
      <!-- <button 
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(1)"
        title="첫 페이지"
      >
        <span class="material-icons">first_page</span>
      </button> -->
      
      <button 
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        title="이전 페이지"
      >
        <span class="material-icons">chevron_left</span>
      </button>
      
      <!-- 페이지 번호들 -->
      <div class="page-numbers">
        <button
          v-for="page in displayPages"
          :key="page"
          class="page-number"
          :class="{ 'active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <!-- 다음 페이지 그룹 -->
      <button 
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        title="다음 페이지"
      >
        <span class="material-icons">chevron_right</span>
      </button>
      
      <!-- <button 
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(totalPages)"
        title="마지막 페이지"
      >
        <span class="material-icons">last_page</span>
      </button> -->
    </div>
    
    <div class="pagination-controls-extra">
      <!-- 페이지 사이즈 선택 -->
      <div class="page-size-selector">
        <label class="text-sm text-gray-600">페이지당</label>
        <select 
          :value="pageSize"
          @change="changePageSize($event.target.value)"
          class="page-size-select"
        >
          <option 
            v-for="option in pageSizeOptions" 
            :key="option" 
            :value="option"
          >
            {{ option }}개
          </option>
        </select>
      </div>
      
      <!-- 직접 페이지 이동 -->
      <!-- <div class="page-jump">
        <input
          type="number"
          :value="currentPage"
          @change="jumpToPage($event.target.value)"
          :min="1"
          :max="totalPages"
          class="page-input"
        />
        <span class="text-sm text-gray-600">/ {{ totalPages }}</span>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0
  },
  pageSize: {
    type: Number,
    required: true,
    default: 50
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  pageSizeOptions: {
    type: Array,
    default: () => [50, 100, 200, 500, 1000, 5000, 10000]
  }
})

const emit = defineEmits(['page-change', 'page-size-change'])

// 계산된 속성들
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.pageSize)
})

const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.pageSize
  return end > props.totalItems ? props.totalItems : end
})

const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = props.currentPage
  const max = props.maxVisiblePages
  
  if (total <= max) {
    // 전체 페이지가 maxVisiblePages 이하면 모든 페이지 표시
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 현재 페이지를 중심으로 페이지 범위 계산
    let start = Math.max(1, current - Math.floor(max / 2))
    let end = Math.min(total, start + max - 1)
    
    // 끝에서 범위를 조정
    if (end - start + 1 < max) {
      start = Math.max(1, end - max + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

// 메서드들
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const changePageSize = (newSize) => {
  const size = parseInt(newSize)
  if (size !== props.pageSize) {
    emit('page-size-change', size)
  }
}

const jumpToPage = (page) => {
  const pageNum = parseInt(page)
  if (pageNum >= 1 && pageNum <= totalPages.value) {
    goToPage(pageNum)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  flex-shrink: 0;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

.page-numbers {
  display: flex;
  gap: 2px;
  margin: 0 8px;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  font-weight: 500;
}

.page-number:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.page-number.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

.page-number.active:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.pagination-controls-extra {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background-color: #ffffff;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-input {
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.page-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 12px;
    padding: 8px 12px;
  }
  
  .pagination-controls {
    order: 1;
  }
  
  .pagination-info {
    order: 2;
  }
  
  .pagination-controls-extra {
    order: 3;
    flex-direction: column;
    gap: 8px;
  }
  
  .page-numbers {
    margin: 0 4px;
  }
  
  .page-number,
  .pagination-btn {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
}

@media (max-width: 480px) {
  .pagination-controls-extra {
    width: 100%;
  }
  
  .page-size-selector,
  .page-jump {
    justify-content: center;
  }
}
</style>
