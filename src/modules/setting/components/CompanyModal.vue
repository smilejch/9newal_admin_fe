<template>
  <CommonModal
    :isOpen="isOpen"
    :title="modalTitle"
    :size="modalSize"
    :showSave="modalMode !== 'view'"
    :showDelete="modalMode === 'edit'"
    @close="handleClose"
    @save="handleSave"
    @delete="handleDelete"
  >
    <template #content>
      <div class="company-form">
        <div class="form-grid">
          <!-- 회사명 -->
          <div class="form-group-full-width">
            <label class="form-label">회사명 <span class="text-red-500">*</span></label>
            <input
              v-model="companyData.company_name"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="회사명을 입력하세요"
            />
          </div>

          <!-- 쿠팡 벤더ID -->
          <div class="form-group">
            <label class="form-label">쿠팡 벤더ID</label>
            <input
              v-model="companyData.coupang_vendor_id"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="쿠팡 벤더ID를 입력하세요"
            />
          </div>

          <!-- 사업자번호 -->
          <div class="form-group">
            <label class="form-label">사업자번호</label>
            <input
              v-model="companyData.business_registration_number"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="사업자번호를 입력하세요"
            />
          </div>

          <!-- 주소 -->
          <div class="form-group-full-width">
            <label class="form-label">주소</label>
            <input
              v-model="companyData.address"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="주소를 입력하세요"
            />
          </div>

          <!-- 상세주소 -->
          <div class="form-group-full-width">
            <label class="form-label">상세주소</label>
            <input
              v-model="companyData.address_dtl"
              type="text"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :readonly="isFormReadonly"
              placeholder="상세주소를 입력하세요"
            />
          </div>

          <!-- 회사 상태 -->
          <div class="form-group">
            <label class="form-label">회사 상태</label>
            <select
              v-model="companyData.company_status_cd"
              class="form-input"
              :class="{ 'bg-gray-100 cursor-not-allowed': isFormReadonly }"
              :disabled="isFormReadonly"
            >
              <option value="">회사 상태를 선택하세요</option>
              <option 
                v-for="option in companyStatusOptions" 
                :key="option.com_code" 
                :value="option.com_code"
              >
                {{ option.code_name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import CommonModal from '@/components/CommonModal.vue'
import { createCompany, updateCompany, deleteCompany, fetchCompany } from '@/modules/setting/api/company'
import { showError, showSuccess, confirmDelete, confirmSave } from '@/utils/alert'
import { commonCodeList } from '@/modules/common/api/common'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'register' // register, edit, view
  },
  companyNo: {
    type: [String, Number],
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'saved', 'deleted'])

const companyStatusOptions = ref([])

// 상태
const loading = ref(false)
const modalMode = ref(props.mode)
const modalSize = ref('big')

const fetchAllOptions = async () => {
  try {
    const responseCompanyStatus = await commonCodeList('COMPANY_STATUS_CD')
    companyStatusOptions.value = responseCompanyStatus.data
  } catch (error) {
    console.error('옵션 데이터 로드 실패:', error)
    showError('데이터 로드 실패', '옵션 데이터를 불러오는 중 오류가 발생했습니다.')
  }
}

onMounted(() => {
  fetchAllOptions()
})

// 회사 데이터
const companyData = reactive({
  company_no: '',
  company_name: '',
  coupang_vendor_id: '',
  business_registration_number: '',
  address: '',
  address_dtl: '',
  company_status_cd: ''
})

const isFormReadonly = computed(() => modalMode.value === 'view')

const modalTitle = computed(() => {
  switch (modalMode.value) {
    case 'register':
      return '회사 등록'
    case 'edit':
      return '회사 수정'
    case 'view':
      return '회사 정보'
    default:
      return '회사'
  }
})

// 회사 데이터 로드
const loadCompanyData = async () => {
  if (!props.companyNo || modalMode.value === 'register') {
    resetCompanyData()
    return
  }

  try {
    loading.value = true
    const response = await fetchCompany(props.companyNo)
    const company = response.data
    
    // 회사 데이터 설정
    Object.keys(companyData).forEach(key => {
      if (company[key] !== undefined) {
        companyData[key] = company[key]
      }
    })
  } catch (error) {
    console.error('회사 데이터 로드 실패:', error)
    showError('데이터 로드 실패', '회사 정보를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 회사 데이터 초기화
const resetCompanyData = () => {
  Object.keys(companyData).forEach(key => {
    companyData[key] = ''
  })
}

// 유효성 검사
const validateCompanyData = () => {
  // 회사명 검증 (필수)
  if (!companyData.company_name || companyData.company_name.trim() === '') {
    return { isValid: false, message: '회사명은 필수 입력 항목입니다.' }
  }
  
  // 사업자번호 형식 검증 (입력된 경우에만)
  if (companyData.business_registration_number && companyData.business_registration_number.trim()) {
    const businessNumberPattern = /^\d{10}$/
    if (!businessNumberPattern.test(companyData.business_registration_number.replace(/-/g, ''))) {
      return { isValid: false, message: '사업자번호는 10자리 숫자여야 합니다.' }
    }
  }
  
  return { isValid: true, message: '' }
}

// 핸들러들
const handleClose = () => {
  // 모든 데이터 초기화
  resetCompanyData()
  emit('close')
}

const handleSave = async () => {
  const validation = validateCompanyData()
  if (!validation.isValid) {
    showError('입력 오류', validation.message)
    return
  }

  const confirmed = await confirmSave('회사 저장', '회사 정보를 저장하시겠습니까?')
  if (!confirmed) return

  try {
    loading.value = true
    
    // 저장할 데이터 준비
    const saveData = { ...companyData }

    if (modalMode.value === 'register') {
      await createCompany(saveData)
      showSuccess('등록 완료', '회사가 성공적으로 등록되었습니다.')
    } else if (modalMode.value === 'edit') {
      await updateCompany(props.companyNo, saveData)
      showSuccess('수정 완료', '회사가 성공적으로 수정되었습니다.')
    }
    
    emit('saved')
    handleClose()
  } catch (error) {
    console.error('회사 저장 실패:', error)
    showError('저장 실패', '회사 저장 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  const confirmed = await confirmDelete('회사 삭제', '정말로 이 회사를 삭제하시겠습니까?')
  if (!confirmed) return

  try {
    loading.value = true
    await deleteCompany(props.companyNo)
    showSuccess('삭제 완료', '회사가 성공적으로 삭제되었습니다.')
    emit('deleted')
    handleClose()
  } catch (error) {
    console.error('회사 삭제 실패:', error)
    showError('삭제 실패', '회사 삭제 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

// 모달이 열릴 때마다 모드 업데이트 및 데이터 로드
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    modalMode.value = props.mode
    loadCompanyData()
  }
})

// 모드가 변경될 때마다 데이터 로드
watch(() => props.mode, (newVal) => {
  modalMode.value = newVal
  if (props.isOpen) {
    loadCompanyData()
  }
})
</script>

<style scoped>
.company-form {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-full-width {
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-input:read-only {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
