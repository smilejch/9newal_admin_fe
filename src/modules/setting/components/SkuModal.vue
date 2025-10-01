<template>
  <!-- SKU 모달 -->
  <CommonModal
    :isOpen="isOpen"
    title="상품"
    :size="modalSize"
    :showSave="modalMode !== 'view'"
    :showDelete="modalMode === 'edit'"
    @close="handleClose"
    @save="handleSave"
    @delete="handleDelete"
  >
    <template #content>
      <div class="sku-form">
        <!-- 회사 선택 섹션 -->
        <div class="form-section">
          <h3 class="section-title">회사 정보</h3>
          <div class="form-grid">
            <div class="form-group-full-width">
              <label class="form-label">회사 선택 <span class="text-red-500">*</span></label>
              <select
                v-model="skuData.company_no"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :disabled="isFormReadonly"
              >
                <option value="">회사를 선택하세요</option>
                <option 
                  v-for="company in companyOptions" 
                  :key="company.company_no" 
                  :value="company.company_no"
                >
                  {{ company.company_name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- SKU 기본 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">기본 정보</h3>
          <div class="form-grid">
            <div class="form-group-full-width">
              <label class="form-label">상품명 <span class="text-red-500">*</span></label>
              <input
                v-model="skuData.sku_name"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="상품명을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">SKU ID <span class="text-red-500">*</span></label>
              <input
                v-model="skuData.sku_id"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFirstRegisterReadonly }"
                :readonly="isFirstRegisterReadonly"
                placeholder="8자리 숫자를 입력하세요."
              />
            </div>
            <div class="form-group">
              <label class="form-label">바코드<span class="text-red-500">*</span></label>
              <input
                v-model="skuData.barcode"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="바코드를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">노출 ID</label>
              <input
                v-model="skuData.exposure_id"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="노출 ID를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">묶음</label>
              <input
                v-model="skuData.bundle"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFirstRegisterReadonly"
                placeholder="묶음 정보를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">납품여부</label>
              <select
                v-model="skuData.delivery_status_cd"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :disabled="isFormReadonly"
              >
                <option 
                  v-for="option in deliveryStatusOptions" 
                  :key="option.com_code" 
                  :value="option.com_code"
                >
                  {{ option.code_name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 옵션 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">구매 정보</h3>
          <div class="form-grid">
            <div class="form-group-full-width">
              <label class="form-label">중문명</label>
              <input
                v-model="skuData.cn_name"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="중문명을 입력하세요"
              />
            </div>
            <div class="form-group-full-width">
              <label class="form-label">링크</label>
              <input
                v-model="skuData.link"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="https://example.com"
              />
            </div>
            <div class="form-group">
              <label class="form-label">옵션명</label>
              <input
                v-model="skuData.option_value"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="옵션명을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">판매 구성 수량</label>
              <input
                v-model="skuData.multiple_value"
                type="number"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="판매 구성 수량을 입력하세요"
              />
            </div>
          </div>
        </div>

        <!-- 포장 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">포장 정보</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">포장 개수</label>
              <input
                v-model="skuData.package_unit_quantity"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="포장 개수를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">포장비닐 규격</label>
              <select
                v-model="skuData.package_vinyl_spec_cd"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :disabled="isFormReadonly"
              >
                <option 
                  v-for="option in packageVinylSpecOptions" 
                  :key="option.com_code" 
                  :value="option.com_code"
                >
                  {{ option.code_name }}
                </option>
              </select>
            </div>
          </div>
        </div>


        <!-- 상품 세부 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">상품 세부 정보</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">길이(mm)</label>
              <input
                v-model="skuData.length_mm"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="길이를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">넓이(mm)</label>
              <input
                v-model="skuData.width_mm"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="넓이를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">높이(mm)</label>
              <input
                v-model="skuData.height_mm"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="높이를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">중량(g)</label>
              <input
                v-model="skuData.weight_g"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="중량을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">재질</label>
              <input
                v-model="skuData.material"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="재질을 입력하세요"
              />
            </div>
          </div>
        </div>

        <!-- 가격 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">가격 정보</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">판매가격 (₩)</label>
              <input
                v-model="skuData.sale_price"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="판매가격을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">원가-위안화 (¥)</label>
              <input
                v-model="skuData.cost_yuan"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="원가(위안화)를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">원가-원화 (₩)</label>
              <input
                v-model="skuData.cost_krw"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="원가(원화)를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">공급가 (₩)</label>
              <input
                v-model="skuData.supply_price"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="공급가를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">마진 (%)</label>
              <input
                v-model="skuData.margin"
                type="number"
                step="0.01"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="마진을 입력하세요"
              />
            </div>
          </div>
        </div>

        <!-- 통관 정보 섹션 -->
        <div class="form-section">
          <h3 class="section-title">통관 정보</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">영문명</label>
              <input
                v-model="skuData.en_name"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="영문명을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">HS코드번호</label>
              <div class="flex gap-2">
                <input
                  v-model="skuData.hs_code"
                  type="text"
                  class="form-input flex-1"
                  :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                  :readonly="isFormReadonly"
                  placeholder="HS코드번호를 입력하세요"
                />
                <button
                  type="button"
                  @click="openHsCodeModal"
                  :disabled="isFormReadonly"
                  class="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  HS코드 확인
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">영문명(중국용)</label>
              <input
                v-model="skuData.en_name_for_cn"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="영문명(중국용)을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">HS코드번호(중국용)</label>
              <input
                v-model="skuData.hs_code_cn"
                type="text"
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :readonly="isFormReadonly"
                placeholder="HS코드번호(중국용)을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label class="form-label">FTA</label>
              <select 
                v-model="skuData.fta_cd" 
                class="form-input"
                :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
                :disabled="isFormReadonly"
              >
                <option 
                  v-for="option in ftaOptions" 
                  :key="option.com_code" 
                  :value="option.com_code"
                >
                  {{ option.code_name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </template>
  </CommonModal>

  <!-- HS코드 모달 -->
  <HsCodeModal
    :isOpen="showHsCodeModal"
    :selectMode="true"
    @close="closeHsCodeModal"
    @select="handleHsCodeSelect"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import CommonModal from '@/components/CommonModal.vue'
import HsCodeModal from './HsCodeModal.vue'
import { createSku, updateSku, deleteSku, fetchSku } from '@/modules/setting/api/sku'
import { showError, showSuccess, confirmDelete, confirmSave } from '@/utils/alert'
import { commonCodeList, fetchCompanyList } from '@/modules/common/api/common'
import { useAuthStore } from '@/store/auth'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  skuId: {
    type: [String, Number],
    default: null
  },
  mode: {
    type: String,
    default: 'register', // 'view', 'edit', 'register'
    validator: (value) => ['view', 'edit', 'register'].includes(value)
  }
})

// Emits
const emit = defineEmits(['close', 'saved', 'deleted'])

const packageVinylSpecOptions = ref([])
const ftaOptions = ref([])
const deliveryStatusOptions = ref([])
const companyOptions = ref([])
// 상태
const loading = ref(false)
const modalMode = ref(props.mode)
const modalSize = ref('big')

// HS코드 모달 관련
const showHsCodeModal = ref(false)

const fetchAllOptions = async () => {
  try {
    const responsePackageVinylSpec = await commonCodeList('PACKAGE_VINYL_SPEC_CD')
    const responseFta = await commonCodeList('FTA_CD')
    const responseDeliveryStatus = await commonCodeList('DELIVERY_STATUS_CD')
    const responseCompanies = await fetchCompanyList()
    
    packageVinylSpecOptions.value = responsePackageVinylSpec.data
    ftaOptions.value = responseFta.data
    deliveryStatusOptions.value = responseDeliveryStatus.data
    companyOptions.value = responseCompanies.data || []
  } catch (error) {
    console.error('옵션 데이터 로드 실패:', error)
    showError('데이터 로드 실패', '옵션 데이터를 불러오는 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  fetchAllOptions()
})

// SKU 데이터
const skuData = reactive({
  sku_no: '',
  company_no: '',
  sku_id: '',
  exposure_id: '',
  bundle: '',
  sku_name: '',
  link: '',
  option_value: '',
  linked_option: '',
  linked_option_id: '',
  barcode: '',
  multiple_value: 1,
  package_unit_quantity: '',
  packaging: '',
  cn_name: '',
  package_vinyl_spec_cd: 'SMALL',
  en_name: '',
  hs_code: '',
  en_name_for_cn: '',
  hs_code_cn: '',
  fta_cd: '',
  material: '',
  length_mm: null,
  width_mm: null,
  height_mm: null,
  weight_g: null,
  delivery_status_cd: '',
  sale_price: null,
  cost_yuan: null,
  cost_krw: null,
  supply_price: null,
  margin: null,
})


const isFormReadonly = computed(() => modalMode.value === 'view')
const isFirstRegisterReadonly = computed(() => modalMode.value === 'edit' || modalMode.value === 'view')

// 모달이 열릴 때 데이터 로드
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    modalMode.value = props.mode
    if (props.skuId && (props.mode === 'view' || props.mode === 'edit')) {
      await loadSkuData(props.skuId)
    } else if (props.mode === 'register') {
      resetSkuData()
    }
  }
})

// SKU 데이터 초기화
const resetSkuData = () => {
  Object.keys(skuData).forEach(key => {
    if (key === 'multiple_value') {
      skuData[key] = 1
    } else if (key === 'bundle') {
      skuData[key] = ''
    } else if (key === 'package_vinyl_spec_cd') {
      skuData[key] = 'SMALL'
    } else if (key === 'delivery_status_cd') {
      skuData[key] = 'IMPOSSIBLE'
    } else if (key === 'fta_cd') {
      skuData[key] = 'NOT_PROGRESS'
    } else if (['length_mm', 'width_mm', 'height_mm', 'weight_g', 'sale_price', 'cost_yuan', 'cost_krw', 'supply_price', 'margin'].includes(key)) {
      skuData[key] = null
    } else {
      skuData[key] = ''
    }
  })
}

// SKU 데이터 로드
const loadSkuData = async (skuId) => {
  loading.value = true

  try {
    const response = await fetchSku(skuId)
    const data = response.data
    
    Object.keys(skuData).forEach(key => {
      if (data.hasOwnProperty(key)) {
        skuData[key] = data[key]
      }
    })
  } catch (error) {
    console.error('SKU 데이터 로드 실패:', error)
    showError('로드 실패', 'SKU 데이터를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 유효성 검사
const validateSkuData = () => {
  // 회사 선택 검증 (필수)
  if (!skuData.company_no) {
    return { isValid: false, message: '회사를 선택해주세요.' }
  }
  
  // SKU ID 검증 (8자리 숫자)
  if (!skuData.sku_id) {
    return { isValid: false, message: 'SKU ID는 필수 입력 항목입니다.' }
  }
  
  const skuIdPattern = /^\d{8}$/
  if (!skuIdPattern.test(skuData.sku_id)) {
    return { isValid: false, message: 'SKU ID는 8자리 숫자여야 합니다. (예: 16317912)' }
  }
  
  // 상품명 검증 (필수)
  if (!skuData.sku_name || skuData.sku_name.trim() === '') {
    return { isValid: false, message: '상품명은 필수 입력 항목입니다.' }
  }
  
  // 바코드 검증 (필수)
  if (!skuData.barcode || skuData.barcode.trim() === '') {
    return { isValid: false, message: '바코드는 필수 입력 항목입니다.' }
  }
  
  return { isValid: true, message: '' }
}

// 핸들러들
const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  // 유효성 검사
  const validationResult = validateSkuData()
  if (!validationResult.isValid) {
    showError('입력 오류', validationResult.message)
    return
  }
  
  // 저장 확인창 표시
  const confirmed = await confirmSave('SKU 정보')
  
  if (!confirmed) {
    return
  }
  
  try {
    if (modalMode.value === 'edit') {
      await updateSku(skuData.sku_no, skuData)
    } else {
      await createSku(skuData)
    }


    showSuccess('저장 완료', 'SKU 정보가 성공적으로 저장되었습니다.')
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('저장 중 오류 발생:', error)
  }
}

const handleDelete = async () => {
  const confirmed = await confirmDelete(`SKU 삭제`)
  if (!confirmed) {
    return
  }
  
  try {
    await deleteSku(skuData.sku_no)
    showSuccess('삭제 완료', 'SKU가 성공적으로 삭제되었습니다.')
    emit('deleted')
    emit('close')
  } catch (error) {
    console.error('삭제 중 오류 발생:', error)
  }
}

// HS코드 모달 관련 함수들
const openHsCodeModal = () => {
  showHsCodeModal.value = true
}

const closeHsCodeModal = () => {
  showHsCodeModal.value = false
}

const handleHsCodeSelect = (selectedHsCode) => {
  skuData.hs_code = selectedHsCode.hs_code
  showHsCodeModal.value = false
}
</script>

<style scoped>
/* SKU 폼 스타일 */
.sku-form {
  max-height: 60vh;
  overflow-y: auto;
}
</style>