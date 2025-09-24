<template>
  <div class="ag-grid-section bg-white rounded-lg shadow-sm">
    <!-- 그리드 헤더 -->
    <div class="grid-header p-2 border-b border-gray-200 flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-700">{{ title }}</h3>
      
      <!-- 우측 버튼 영역 -->
      <div class="flex items-center gap-2">
        <slot name="header-buttons"></slot>
      </div>
    </div>

    <!-- ag-Grid 컨테이너 -->
    <div class="ag-grid-container">
      <slot name="ag-grid"></slot>
    </div>

    <!-- 페이지네이션 영역 -->
    <div class="pagination-section" v-if="$slots.pagination">
      <slot name="pagination"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  rowData: {
    type: Array,
    default: () => [],
    validator: (value) => {
      if (!Array.isArray(value)) {
        console.warn('DataGrid: rowData should be an array, received:', typeof value, value)
        return false
      }
      return true
    }
  },
  height: {
    type: String,
    default: '65vh'
  }
})

const emit = defineEmits(['grid-ready', 'page-change'])

const gridApi = ref(null)

const onGridReady = (params) => {
  gridApi.value = params.api
  emit('grid-ready', params)
}
</script>

<style scoped>
.ag-grid-section {
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: v-bind(height); /* ag-grid와 동일한 높이 */
  overflow: hidden;
}

.grid-header {
  flex-shrink: 0;
}

.ag-grid-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.pagination-section {
  flex-shrink: 0;
}

/* ag-Grid 테마 스타일 */
:deep(.ag-theme-alpine) {
  --ag-header-height: 40px;
  --ag-row-height: 40px;
  --ag-font-size: 13px;
  --ag-header-foreground-color: #374151;
  --ag-header-background-color: #f9fafb;
  --ag-odd-row-background-color: #ffffff;
  --ag-even-row-background-color: #f8fafc;
  --ag-row-hover-color: #e5e7eb;
  --ag-border-color: #e5e7eb;
}

/* 공통 버튼 스타일은 전역 CSS로 이동되었습니다 */

/* 로딩 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 그룹 헤더 중앙 정렬 */
:deep(.ag-header-group-cell) {
  text-align: center !important;
  justify-content: center !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.ag-header-group-cell-label) {
  text-align: center !important;
  width: 100% !important;
  justify-content: center !important;
  display: flex !important;
}

/* 개별 헤더 중앙 정렬 (기존 것과 함께) */
:deep(.ag-header-cell-center) {
  text-align: center !important;
  justify-content: center !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.ag-header-cell-center .ag-header-cell-label) {
  text-align: center !important;
  width: 100% !important;
  justify-content: center !important;
  display: flex !important;
}

/* 연한 색상의 편집 가능한 셀 스타일 */
:deep(.editable-cell) {
  background: linear-gradient(to right, #f1f5f9, #e2e8f0) !important;
  border: 1px solid #cbd5e1 !important;
  cursor: pointer !important;
  position: relative !important;
  transition: all 0.25s ease !important;
  overflow: hidden !important;
}

:deep(.editable-header) {
  background-color: #fafafa !important;
  color: #374151 !important;
  font-weight: 600 !important;
  box-shadow: inset 0 -2px 0 #6366f1 !important;
  border-radius: 4px 4px 0 0 !important;
}

:deep(.editable-cell::before) {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  height: 100% !important;
  width: 4px !important;
  background: #3b82f6 !important; /* 연한 블루 */
  transform: translateX(-4px) !important;
  transition: transform 0.25s ease !important;
}

:deep(.editable-cell:hover) {
  background: linear-gradient(to right, #dbeafe, #bfdbfe) !important;
  border-color: #3b82f6 !important; /* 연한 블루 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

:deep(.editable-cell:hover::before) {
  transform: translateX(0) !important;
  background: #2563eb !important; /* 약간 진한 블루 */
}

:deep(.editable-cell.ag-cell-editing) {
  background: #ffffff !important;
  border: 2px solid #3b82f6 !important; /* 연한 블루 */
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
}

/* 편집 가능 표시 아이콘 */
:deep(.editable-cell::after) {
  content: '✏️' !important;
  position: absolute !important;
  right: 6px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-size: 13px !important;
  opacity: 0 !important;
  transition: opacity 0.25s ease !important;
}

:deep(.editable-cell:hover::after) {
  opacity: 0.7 !important;
}
</style> 