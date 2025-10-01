<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- 배경 오버레이 -->
    <div class="fixed inset-0 bg-black/60 transition-opacity"></div>
    
    <!-- 모달 컨테이너 -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all" 
           :class="{ 'max-w-md': !showErrorTable || errorDetails.length === 0 }">
        
        <!-- 상단 타이틀 영역 -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
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
        
        <!-- 중간 모달 내용 영역 -->
        <div class="px-6 py-6">
          <!-- 파일 선택 영역 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              업로드할 파일을 선택해주세요
            </label>
            <div 
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
              @click="triggerFileInput"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
            >
              <div v-if="!selectedFile">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p class="text-sm text-gray-600">
                  <span class="font-medium text-blue-600 hover:text-blue-500">클릭하여 파일 선택</span> 
                  또는 드래그 앤 드롭
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ acceptedFormats }}</p>
              </div>
              <div v-else class="text-sm">
                <div class="flex items-center justify-center space-x-2">
                  <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
                    <p class="text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <button 
                  @click.stop="removeFile"
                  class="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  파일 제거
                </button>
              </div>
            </div>
            
            <!-- 숨겨진 파일 입력 -->
            <input
              ref="fileInputRef"
              type="file"
              :accept="acceptedTypes"
              @change="handleFileSelect"
              class="hidden"
            />
          </div>

          <!-- 업로드 진행률 -->
          <div v-if="isUploading" class="mb-4">
            <div class="flex justify-between text-sm text-gray-700 mb-1">
              <span>업로드 중...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
                <button 
                  v-if="errorDetails.length > 0"
                  @click="showErrorTable = !showErrorTable"
                  class="mt-2 text-xs text-red-600 hover:text-red-800 underline focus:outline-none"
                >
                  {{ showErrorTable ? '오류 상세 숨기기' : '오류 상세 보기' }} ({{ errorDetails.length }}개)
                </button>
              </div>
            </div>
          </div>

          <!-- 에러 상세 테이블 -->
          <div v-if="showErrorTable && errorDetails.length > 0" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <h4 class="text-sm font-medium text-red-800 mb-3">업로드 오류 상세</h4>
            <div class="max-h-60 overflow-y-auto">
              <table class="min-w-full divide-y divide-red-200">
                <thead class="bg-red-100">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      순번
                    </th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      오류 내용
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-red-200">
                  <tr v-for="(error, index) in errorDetails" :key="index" class="hover:bg-red-50">
                    <td class="px-3 py-2 whitespace-nowrap text-sm text-red-900">
                      {{ index + 1 }}
                    </td>
                    <td class="px-3 py-2 text-sm text-red-900 break-words max-w-md whitespace-pre-line">
                      {{ error }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 성공 메시지 -->
          <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div class="flex">
              <svg class="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <p class="text-sm text-green-700">{{ successMessage }}</p>
            </div>
          </div>
        </div>
        
        <!-- 하단 버튼 영역 -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex justify-end space-x-3">
            <button
              @click="handleUpload"
              :disabled="!selectedFile || isUploading"
              class="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {{ isUploading ? '업로드 중...' : '업로드' }}
            </button>
            <button
              @click="closeModal"
              :disabled="isUploading"
              class="bg-gray-300 text-gray-700 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { confirmUpload } from '@/utils/alert'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '파일 업로드'
  },
  acceptedTypes: {
    type: String,
    default: '.xlsx,.xls,.csv'
  },
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  uploadFunction: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['close', 'upload-success', 'upload-error'])

// 상태
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const isDragOver = ref(false)
const fileInputRef = ref(null)
const errorDetails = ref([])
const showErrorTable = ref(false)

// 허용 파일 형식 표시용
const acceptedFormats = computed(() => {
  const formats = props.acceptedTypes.split(',').map(type => type.trim()).join(', ')
  return `지원 형식: ${formats}`
})

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 파일 입력 트리거
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 파일 선택 핸들러
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

// 드래그 앤 드롭 핸들러
const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

// 파일 유효성 검사 및 설정
const validateAndSetFile = (file) => {
  errorMessage.value = ''
  successMessage.value = ''
  errorDetails.value = []
  showErrorTable.value = false

  // 파일 크기 검사
  if (file.size > props.maxFileSize) {
    errorMessage.value = `파일 크기가 너무 큽니다. 최대 ${formatFileSize(props.maxFileSize)}까지 업로드 가능합니다.`
    return
  }

  // 파일 형식 검사
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  const acceptedExtensions = props.acceptedTypes.split(',').map(type => type.trim().toLowerCase())
  
  if (!acceptedExtensions.includes(fileExtension)) {
    errorMessage.value = `지원하지 않는 파일 형식입니다. ${acceptedFormats.value}`
    return
  }

  selectedFile.value = file
}

// 파일 제거
const removeFile = () => {
  selectedFile.value = null
  errorMessage.value = ''
  successMessage.value = ''
  errorDetails.value = []
  showErrorTable.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 업로드 처리
const handleUpload = async () => {
  if (!selectedFile.value) return

  // 업로드 확인
  const confirmed = await confirmUpload(`파일 업로드`)
  if (!confirmed) {
    return
  }
 
  isUploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  successMessage.value = ''
  errorDetails.value = []
  showErrorTable.value = false
 
  try {
    // 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        const increment = Math.floor(Math.random() * 8) + 1
        uploadProgress.value = Math.min(uploadProgress.value + increment, 98)
      }
    }, 300)
 
    // 업로드 함수 호출
    const result = await props.uploadFunction(selectedFile.value)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
 
    if (result.status === 'success') {
      successMessage.value = '파일이 성공적으로 업로드되었습니다.'
      emit('upload-success', result)
      // 성공시에만 모달 닫기
      setTimeout(() => {
        closeModal()
      }, 1500)
    } else {
      errorMessage.value = result.data.message
      // error_details 배열이 존재하면 설정
      if (result.data.data && result.data.data.error_details && Array.isArray(result.data.data.error_details)) {
        errorDetails.value = result.data.data.error_details
        showErrorTable.value = false
      } else {
        errorDetails.value = []
        showErrorTable.value = false
      }
    }
 
  } catch (error) {
    console.error('업로드 실패:', error)
    uploadProgress.value = 0
    errorMessage.value = error.message || '업로드 중 오류가 발생했습니다.'
    emit('upload-error', error)
  } finally {
    isUploading.value = false
  }
}

// 모달 닫기
const closeModal = () => {
  if (isUploading.value) return
  
  // 상태 초기화
  selectedFile.value = null
  isUploading.value = false
  uploadProgress.value = 0
  errorMessage.value = ''
  successMessage.value = ''
  errorDetails.value = []
  showErrorTable.value = false
  isDragOver.value = false
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  
  emit('close')
}
</script>

<style scoped>
/* 드래그 앤 드롭 애니메이션 */
.transition-colors {
  transition: all 0.2s ease-in-out;
}

/* 업로드 진행률 애니메이션 */
.transition-all {
  transition: all 0.3s ease-in-out;
}

/* 버튼 호버 효과 */
button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}
</style>
