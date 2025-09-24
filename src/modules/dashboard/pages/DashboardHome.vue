<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 페이지 헤더 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p class="mt-2 text-sm text-gray-600">9NEWALL 관리자 시스템에 오신 것을 환영합니다.</p>
      </div>

      <!-- 통계 카드 그리드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- 총 사용자 -->
        <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">총 사용자</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ stats.totalUsers.toLocaleString() }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- 활성 세션 -->
        <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">활성 세션</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ stats.activeSessions.toLocaleString() }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- 대기 작업 -->
        <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">대기 작업</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ stats.pendingTasks.toLocaleString() }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- 오류 건수 -->
        <div class="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">오류 건수</dt>
                  <dd class="text-2xl font-bold text-gray-900">{{ stats.errorCount.toLocaleString() }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 콘텐츠 영역 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 최근 활동 -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-semibold text-gray-900">최근 활동</h3>
          </div>
          <div class="px-6 py-5">
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                  <p class="text-sm text-gray-500">{{ activity.description }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 시스템 상태 -->
        <div class="bg-white shadow-sm rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-semibold text-gray-900">시스템 상태</h3>
          </div>
          <div class="px-6 py-5">
            <div class="space-y-4">
              <div v-for="status in systemStatus" :key="status.name" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-3 h-3 rounded-full" :class="getStatusColor(status.status)"></div>
                  <span class="text-sm font-medium text-gray-900">{{ status.name }}</span>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusBadgeClass(status.status)">
                  {{ status.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 빠른 액션 -->
      <div class="mt-8">
        <div class="bg-white shadow-sm rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-semibold text-gray-900">빠른 액션</h3>
          </div>
          <div class="px-6 py-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                사용자 추가
              </button>
              <button class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                보고서 생성
              </button>
              <button class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                시스템 설정
              </button>
              <button class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                </svg>
                백업 실행
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 통계 데이터
const stats = ref({
  totalUsers: 1247,
  activeSessions: 89,
  pendingTasks: 12,
  errorCount: 3
})

// 최근 활동
const recentActivities = ref([
  {
    id: 1,
    title: '새로운 사용자 등록',
    description: 'john.doe@example.com 사용자가 등록되었습니다.',
    time: '5분 전'
  },
  {
    id: 2,
    title: '시스템 백업 완료',
    description: '일일 백업이 성공적으로 완료되었습니다.',
    time: '1시간 전'
  },
  {
    id: 3,
    title: '보안 업데이트',
    description: '보안 패치가 적용되었습니다.',
    time: '3시간 전'
  },
  {
    id: 4,
    title: '데이터베이스 최적화',
    description: '데이터베이스 정리 작업이 완료되었습니다.',
    time: '6시간 전'
  }
])

// 시스템 상태
const systemStatus = ref([
  { name: '웹 서버', status: '정상' },
  { name: '데이터베이스', status: '정상' },
  { name: 'API 서버', status: '정상' },
  { name: '파일 서버', status: '경고' },
  { name: '백업 시스템', status: '정상' }
])

// 상태 색상 반환
const getStatusColor = (status) => {
  switch (status) {
    case '정상':
      return 'bg-green-400'
    case '경고':
      return 'bg-yellow-400'
    case '오류':
      return 'bg-red-400'
    default:
      return 'bg-gray-400'
  }
}

// 상태 배지 클래스 반환
const getStatusBadgeClass = (status) => {
  switch (status) {
    case '정상':
      return 'bg-green-100 text-green-800'
    case '경고':
      return 'bg-yellow-100 text-yellow-800'
    case '오류':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  console.log('관리자 대시보드가 로드되었습니다.')
})
</script>