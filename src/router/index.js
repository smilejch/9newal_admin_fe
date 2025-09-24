import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';
import { initializeDynamicRoutes } from '@/utils/routeGenerator';
import { isTokenExpired } from '@/utils/jwtUtils';
import { refreshToken } from '@/modules/auth/api/auth';

// 페이지
import Login from '@/modules/auth/pages/Login.vue'
import DashboardHome from '@/modules/dashboard/pages/DashboardHome.vue'

import AuthLayout from '@/layouts/auth/AuthLayout.vue'
import DefaultLayout from '@/layouts/default/DefaultLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'Login',
        component: Login,
      },
      {
        path: '/logout',
        name: 'Logout',
        component: Login,
      },
    ],
  },
  {
    path: '/',
    name: 'DefaultLayout',
    component: DefaultLayout,
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardHome,
      },
      // 동적으로 추가될 라우트들이 여기에 들어갑니다
    ],
  },
]

// ✅ DefaultLayout 하위 라우트에 requiresAuth 자동 적용
function applyRequiresAuthToLayout(routes, layoutComponent, meta) {
  routes.forEach(route => {
    if (route.component === layoutComponent && Array.isArray(route.children)) {
      route.children.forEach(child => {
        child.meta = { ...(child.meta || {}), ...meta }
      })
    }
  })
}

applyRequiresAuthToLayout(routes, DefaultLayout, { requiresAuth: true })

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 라우터 인스턴스를 전역으로 설정 (axios 인터셉터에서 사용)
window.router = router;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 인증이 필요한 페이지인지 확인
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    
    if (!token) {
      // 토큰이 없으면 로그인 페이지로
      return next({ name: 'Login' })
    }

    // 토큰 만료 체크
    if (isTokenExpired(token)) {
      console.log('토큰이 만료됨')
      try {
        // 토큰 갱신 시도
        const response = await refreshToken()
        const newToken = response.data.access_token
        
        // 새 토큰으로 업데이트
        authStore.token = newToken
        localStorage.setItem('token', newToken)
        
        console.log('토큰 갱신 성공')
      } catch (error) {
        console.error('토큰 갱신 실패:', error)
        authStore.logout()
        return next({ name: 'Login' })
      }
    }

    // 사용자 인증 상태 확인
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' })
    }
  }

  // 이미 로그인된 사용자가 로그인 페이지에 접근하려는 경우
  if (to.name === 'Login' && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  next()
})

// ✅ 존재하지 않는 경로 접근 시 → 이전 페이지 또는 /login
router.afterEach((to, from, failure) => {
  if (!to.matched.length) {
    const routerHistory = window.history
    if (routerHistory.length > 1) {
      // 이전 페이지가 있으면 뒤로가기
      router.back()
    } else {
      // 이전 페이지가 없으면 로그인 페이지로
      router.replace('/login')
    }
  }
})

export default router