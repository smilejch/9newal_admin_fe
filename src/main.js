// src/main.js
try {
  if (typeof window !== 'undefined' && window.addEventListener) {
    const resizeObserverErr = 'ResizeObserver loop'
    
    const originalError = console.error
    console.error = function(...args) {
      if (args[0]?.toString().includes(resizeObserverErr)) return
      originalError.apply(console, args)
    }
    
    window.addEventListener('error', (e) => {
      if (e.message?.includes(resizeObserverErr)) {
        e.stopImmediatePropagation()
        e.preventDefault()
        return false
      }
    }, true)
  }
} catch (e) {
  console.log(e)
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/tailwind.css'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { createPinia } from 'pinia'
import { useAuthStore } from './store/auth'
import { useUiStore } from './store/ui'
import { initializeDynamicRoutes } from '@/utils/routeGenerator'
import { initializeGlobalErrorHandling } from '@/utils/errorHandler'

// ag-Grid 모듈 등록
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 글로벌 에러 핸들링 초기화
initializeGlobalErrorHandling(app)

// 1) Auth 복원 + 동적 라우트 초기화
const authStore = useAuthStore()
authStore.initializeFromStorage()

// 중앙집중식 동적 라우트 초기화
initializeDynamicRoutes(router, authStore)

app.use(router)

// 2) UI 상태 복원
const uiStore = useUiStore()
uiStore.initFromStorage()

// 3) 라우터 준비 후, 현재 경로 기준으로 상위 메뉴 오픈
router.isReady().then(() => {
  if (authStore.menu?.length) {
    uiStore.openAncestorsByRoute(router.currentRoute.value.path, authStore.menu)
  }
  app.mount('#app')
})