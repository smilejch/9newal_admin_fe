<template>
  <CommonModal
    :isOpen="isOpen"
    title="HS코드"
    size="full"
    :showSave="false"
    :showDelete="false"
    @close="closeModal"
  >
    <template #content>
      <div class="space-y-4">
        <div class="bg-white rounded-lg border border-gray-200">
          <PageDataGrid
            title=""
            :loading="loading"
            :rowData="dataList"
            height="1000px"
          >
            <template #ag-grid>
              <ag-grid-vue
                ref="agGridRef"
                :key="`ag-grid-${currentPage}-${dataList.length}`"
                class="ag-theme-alpine"
                theme="legacy"
                :rowData="paginatedData"
                :columnDefs="colDefs"
                :style="{ height: '100%', width: '100%' }"
                :suppressPaginationPanel="true"
                :defaultColDef="defaultColDef"
                @grid-ready="onGridReady"
                @first-data-rendered="onFirstDataRendered"
                @cell-clicked="onCellClicked"
              >
              </ag-grid-vue>
            </template>
            <template #pagination>
              <PagePagination
                :currentPage="currentPage"
                :totalItems="totalItems"
                :pageSize="pageSize"
                @page-change="handlePageChange"
                @page-size-change="handlePageSizeChange"
              />
            </template>
          </PageDataGrid>
        </div>
      </div>
    </template>
  </CommonModal>
</template>
  
  <script setup>
import { ref, computed,  watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import CommonModal from '@/components/CommonModal.vue'
import PageDataGrid from '@/components/PageDataGrid.vue'
import PagePagination from '@/components/PagePagination.vue'
import { getHsCodeList } from '@/modules/common/api/common'
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
  selectMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select'])

// 상태 관리
const loading = ref(false)
const agGridRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(50)
const totalItems = ref(0)


const dataList = ref([])

// selectMode computed 추가
const selectMode = computed(() => props.selectMode)

// 컬럼 정의를 computed로 변경
const colDefs = computed(() => {
  const baseColumns = [
    {
      headerName: 'HS코드',
      field: 'hs_code',
      width: 300,
      minWidth: 250
    },
    {
      headerName: '한글품목명',
      field: 'item_name_kr',
      width: 400,
      minWidth: 350,
      cellRenderer: (params) => {
        return params.value ? (params.value.length > 40 ? params.value.substring(0, 40) + '...' : params.value) : ''
      }
    },
    {
      headerName: '영문품목명',
      field: 'item_name_en',
      width: 400,
      minWidth: 350,
      cellRenderer: (params) => {
        return params.value ? (params.value.length > 40 ? params.value.substring(0, 40) + '...' : params.value) : ''
      }
    },
    {
      headerName: '한국표준무역분류명',
      field: 'ktsn_name',
      width: 250,
      minWidth: 200,
      cellRenderer: (params) => {
        return params.value ? (params.value.length > 25 ? params.value.substring(0, 25) + '...' : params.value) : ''
      }
    },
    {
      headerName: '수량단위최대단가',
      field: 'unit_price_qty',
      width: 180,
      minWidth: 150,
      cellRenderer: (params) => {
        return params.value ? Number(params.value).toLocaleString() : ''
      }
    },
    {
      headerName: '중량단위최대단가',
      field: 'unit_price_weight',
      width: 180,
      minWidth: 150,
      cellRenderer: (params) => {
        return params.value ? Number(params.value).toLocaleString() : ''
      }
    },
    {
      headerName: '수량단위코드',
      field: 'qty_unit_code',
      width: 150,
      minWidth: 120
    },
    {
      headerName: '중량단위코드',
      field: 'weight_unit_code',
      width: 150,
      minWidth: 120
    },
    {
      headerName: '수출성질코드',
      field: 'export_type_code',
      width: 150,
      minWidth: 120
    },
    {
      headerName: '수입성질코드',
      field: 'import_type_code',
      width: 150,
      minWidth: 120
    },
    {
      headerName: '성질통합분류코드',
      field: 'unified_type_code',
      width: 180,
      minWidth: 150
    },
    {
      headerName: '성질통합분류코드명',
      field: 'unified_type_name',
      width: 250,
      minWidth: 200,
      cellRenderer: (params) => {
        return params.value ? (params.value.length > 25 ? params.value.substring(0, 25) + '...' : params.value) : ''
      }
    }
  ]

  // selectMode가 true일 때만 선택 컬럼을 맨 앞에 추가
  if (selectMode.value) {
    return [
      {
        headerName: '선택',
        field: 'select',
        width: 80,
        minWidth: 80,
        pinned: 'left',
        filter: false,
        cellRenderer: (params) => {
          return `<button class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">선택</button>`
        }
      },
      ...baseColumns
    ]
  }

  return baseColumns
})

// ag-grid 기본 설정
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true
}

// 페이지네이션된 데이터
const paginatedData = computed(() => {
  if (!Array.isArray(dataList.value)) {
    return []
  }
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return dataList.value.slice(start, end)
})

// 그리드 준비 완료
const onGridReady = (params) => {
  agGridRef.value = params.api
}

// 첫 데이터 렌더링 완료
const onFirstDataRendered = (params) => {
  params.api.sizeColumnsToFit()
}

// 셀 클릭 이벤트
const onCellClicked = (params) => {
  // 선택 컬럼이고 selectMode일 때만 처리
  if (params.column.getColId() === 'select' && selectMode.value) {
    selectHsCode(params.data.hs_code)
  }
}

// HS Code 데이터 로드
const loadHsCodeData = async () => {
  loading.value = true
  try {
    const response = await getHsCodeList()
    dataList.value = response.data || []
    totalItems.value = dataList.value.length
  } catch (error) {
    console.error('HS Code 데이터 로드 실패:', error)
    dataList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page
}

// 페이지 크기 변경
const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}


// HS코드 선택 함수
const selectHsCode = (hsCode) => {
  const selectedData = dataList.value.find(item => item.hs_code === hsCode)
  
  if (selectedData) {
    emit('select', selectedData)
    closeModal() // 모달 닫기
  }
}


// 모달이 열릴 때 데이터 로드
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadHsCodeData()
  }
})

// 모달 닫기
const closeModal = () => {
  currentPage.value = 1
  pageSize.value = 50
  totalItems.value = 0
  dataList.value = []
  emit('close')
}
  </script>
  
  <style scoped>
/* ag-grid 테마 커스터마이징 */
.ag-theme-alpine {
  --ag-header-height: 40px;
  --ag-row-height: 35px;
  --ag-font-size: 13px;
  }
  
  /* 버튼 호버 효과 */
  button:not(:disabled):hover {
    transform: translateY(-1px);
  }
  
  button:not(:disabled):active {
    transform: translateY(0);
  }

/* 전환 효과 */
.transition-colors {
  transition: all 0.2s ease-in-out;
}
  </style>
  