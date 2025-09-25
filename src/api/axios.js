// src/api/axios.js
import axios from 'axios';
// Pinia 스토어 예시
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';
import { globalLoading } from '@/utils/globalLoading';
import { refreshToken } from '@/modules/auth/api/auth';

async function getShowError() {
  const { showError } = await import('@/utils/alert');
  return showError;
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 300000,
  withCredentials: true, // HttpOnly 쿠키를 위해 필수
});

// 토큰 갱신 중복 요청 방지를 위한 플래그
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// 요청 인터셉터: 토큰이 있으면 자동으로 Authorization 헤더에 추가, 로딩 시작
instance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    // 토큰 갱신 요청에서는 로딩바 비활성화
    if (config.meta?.loading !== false) {
      globalLoading.showLoading();
    }

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    globalLoading.hideLoading();
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 자동 토큰 갱신, 로딩 종료
instance.interceptors.response.use(
  (response) => {
    console.log('응답 인터셉터 시도 중...');
    globalLoading.hideLoading();
    return response;
  },
  async (error) => {
    console.log('응답 인터셉터 시도 중...2');
    globalLoading.hideLoading();
    const originalRequest = error.config;
    const currentRoute = window.location.pathname;

    // 400 에러는 AlertModal로 표시 (발주 삭제 실패와 동일한 스타일)
    if (error.response?.status === 400) {
      // AlertModal 스타일로 400 에러 표시 - 동적 로드로 변경
      const showError = await getShowError();
      const errorMessage = error.response?.data?.message || '잘못된 요청입니다.';
      showError('실패', errorMessage);
    }
    // 401 에러는 별도 처리하므로 제외, 400 에러도 별도 처리했으므로 제외
    else if (error.response?.status !== 401) {
      // ErrorHandlers 동적 import로 순환 참조 방지
      const { ErrorHandlers } = await import('@/utils/errorHandler');
      ErrorHandlers.handleApiError(error, { ignoreAuth: true });
    }

    // 401 에러 시 자동 토큰 갱신 처리 (로그인 요청은 제외)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      
      // 이미 갱신 중인 경우, 큐에 추가하고 대기
      if (isRefreshing) {
        console.log('토큰 갱신 시도 중...3');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          console.log('토큰 갱신 시도 중...4');
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log('토큰 갱신 시도 중...5');
          return instance(originalRequest);
        }).catch(err => {
          console.log('토큰 갱신 시도 중...6');
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('토큰 갱신 시도 중...');
        const refreshResponse = await refreshToken();
        console.log('토큰 갱신 시도 중...2');
        const newToken = refreshResponse.data.access_token;

        // 새 토큰으로 업데이트
        const authStore = useAuthStore();
        authStore.token = newToken;
        console.log('토큰 업데이트1');
        localStorage.setItem('token', newToken);
        console.log('토큰 업데이트2');

        // 기본 헤더 업데이트
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        console.log('기본 헤더 업데이트');

        // 대기 중인 요청들에 새 토큰 전달
        processQueue(null, newToken);
        console.log('기본 헤더 업데이트');

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
        console.log('토큰 갱신 성공');

        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          
          // 갱신 실패 시 로그아웃 처리
          processQueue(refreshError, null);
          
          const authStore = useAuthStore();
          
          // 추가적인 정리 작업
          localStorage.clear(); // 모든 localStorage 데이터 삭제
          delete axios.defaults.headers.common['Authorization']; // axios 기본 헤더에서 토큰 제거
          
          // 스토어 로그아웃 (API 호출 없이 클라이언트만 정리)
          try {
            authStore.logout();
          } catch (logoutError) {
            console.warn('로그아웃 처리 중 오류:', logoutError);
            // 로그아웃 실패해도 강제로 로그인 페이지로 이동
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// 로그인 전용 axios 인스턴스 (인터셉터 우회)
export const loginInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,
});

export default instance;