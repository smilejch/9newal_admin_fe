// 전역 로딩 상태 관리 (Pinia 없이 순수 JavaScript)
class GlobalLoading {
  constructor() {
    this.isLoading = false
    this.loadingCount = 0
    this.listeners = new Set()
  }

  // 상태 변경 리스너 추가
  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback) // unsubscribe 함수 반환
  }

  // 모든 리스너에게 상태 변경 알림
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isLoading))
  }

  // 로딩 시작
  showLoading() {
    this.loadingCount++
    if (!this.isLoading) {
      this.isLoading = true
      this.notifyListeners()
    }
  }

  // 로딩 종료
  hideLoading() {
    this.loadingCount = Math.max(0, this.loadingCount - 1)
    if (this.loadingCount === 0 && this.isLoading) {
      this.isLoading = false
      this.notifyListeners()
    }
  }

  // 강제 종료
  forceHideLoading() {
    this.loadingCount = 0
    if (this.isLoading) {
      this.isLoading = false
      this.notifyListeners()
    }
  }

  // 현재 상태 조회
  getState() {
    return this.isLoading
  }
}

// 전역 인스턴스 생성 및 내보내기
export const globalLoading = new GlobalLoading()

// Vue 컴포지션 API 스타일 훅
export function useGlobalLoading() {
  return {
    showLoading: () => globalLoading.showLoading(),
    hideLoading: () => globalLoading.hideLoading(),
    forceHideLoading: () => globalLoading.forceHideLoading(),
    getState: () => globalLoading.getState(),
    addListener: (callback) => globalLoading.addListener(callback)
  }
} 