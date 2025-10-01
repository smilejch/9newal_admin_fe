<template>
  <CommonModal
    :isOpen="isOpen"
    title="이미지 업로드"
    size="medium"
    :showSave="false"
    :showDelete="false"
    @close="handleClose"
  >
    <template #content>
      <div class="space-y-4">
        <!-- SKU 정보 -->
        <div class="bg-gray-50 p-3 rounded">
          <p class="text-sm"><strong>SKU ID:</strong> {{ skuId }}</p>
        </div>

        <!-- 파일 업로드 (이미지가 없을 때만 표시) -->
        <div v-if="uploadedImages.length === 0">
          <label class="block text-sm font-medium text-gray-700 mb-2">이미지 선택</label>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <!-- 업로드 버튼 (이미지가 없고 파일이 선택되었을 때만 표시) -->
        <div v-if="uploadedImages.length === 0 && selectedFiles.length > 0">
          <button
            @click="uploadImages"
            :disabled="uploading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ uploading ? '업로드 중...' : '이미지 업로드' }}
          </button>
        </div>

        <!-- 업로드된 이미지 (최대 1개) -->
        <div v-if="uploadedImages.length > 0">
          <h4 class="text-sm font-medium text-gray-700 mb-2">업로드된 이미지</h4>
          <div class="flex justify-center">
            <div class="relative">
              <img
                :src="uploadedImages[0].full_image_url"
                class="rounded border shadow-sm"
              />
              <button
                @click="deleteImage(0)"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <button
          @click="handleClose"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          닫기
        </button>
      </div>
    </template>
  </CommonModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import CommonModal from '@/components/CommonModal.vue'
import { showError, showSuccess, confirmDelete, showConfirm } from '@/utils/alert'
import { uploadSkuImage, fetchSkuImages, deleteSkuImage } from '@/modules/setting/api/sku'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  skuId: {
    type: [String, Number],
    default: null
  },
  skuNo: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['close', 'uploaded'])

const fileInput = ref(null)
const selectedFiles = ref([])
const uploadedImages = ref([])
const uploading = ref(false)
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  selectedFiles.value = file ? [file] : []
}

const uploadImages = async () => {
  if (selectedFiles.value.length === 0 || uploadedImages.value.length >= 1) return

  const file = selectedFiles.value[0]
  if (!file) return
  
  // 이미지 업로드 확인
  const confirmed = await showConfirm(
    '이미지 업로드', 
    '선택한 이미지를 업로드하시겠습니까?', 
    '업로드', 
    '취소'
  )
  
  if (!confirmed) {
    return
  }

  uploading.value = true
  
  try {
    // SKU 번호를 가져오기 위해 skuId를 사용 (실제로는 sku_no가 필요할 수 있음)
    const skuNo = props.skuNo
    
    // 실제 API 호출
    const response = await uploadSkuImage(skuNo, file)
    
    // 업로드 성공 후 이미지 목록 새로고침
    await loadExistingImages()
    
    selectedFiles.value = []
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    showSuccess('업로드 완료', '이미지가 성공적으로 업로드되었습니다.')
    emit('uploaded')
    
  } catch (error) {
    console.error('업로드 실패:', error)
    showError('업로드 실패', error.response?.data?.message || '이미지 업로드 중 오류가 발생했습니다.')
  } finally {
    uploading.value = false
  }
}

const deleteImage = async (index) => {
  try {
    const image = uploadedImages.value[index]
    if (!image) {
      showError('삭제 실패', '삭제할 이미지 정보를 찾을 수 없습니다.')
      return
    }
    
    // 삭제 확인
    const confirmed = await confirmDelete('이미지')
    if (!confirmed) {
      return
    }
    
    // 실제 API 호출
    const skuNumber = props.skuNo
    await deleteSkuImage(skuNumber)
    
    // 로컬 상태에서 제거
    uploadedImages.value.splice(index, 1)
    showSuccess('삭제 완료', '이미지가 삭제되었습니다.')
    emit('uploaded')
    
  } catch (error) {
    console.error('이미지 삭제 실패:', error)
    showError('삭제 실패', error.response?.data?.message || '이미지 삭제 중 오류가 발생했습니다.')
  }
}

// 기존 이미지 로드
const loadExistingImages = async () => {
  const skuNumber = props.skuNo
  if (!skuNumber) {
    uploadedImages.value = []
    return
  }

  // 로딩 전에 기존 이미지 초기화 (깜빡임 방지)
  uploadedImages.value = []

  try {
    const response = await fetchSkuImages(skuNumber) // 새로운 API 호출
    
    if (response.data?.has_image && response.data?.file_exists) {
      // 이미지가 있고 파일도 존재하는 경우
      console.log(response.data.image_path)
      uploadedImages.value = [response.data]
      console.log(response.data.created_at_info)
    } else {
      // 이미지가 없거나 파일이 존재하지 않는 경우
      uploadedImages.value = []
    }
    
  } catch (error) {
    console.error('기존 이미지 로드 실패:', error)
    uploadedImages.value = []
  }
}


const handleClose = () => {
  // 모든 상태 초기화
  selectedFiles.value = []
  uploadedImages.value = []
  uploading.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  emit('close')
}

// 모달이 열릴 때 이미지 로드
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && (props.skuNo)) {
    loadExistingImages()
  }
})
</script>