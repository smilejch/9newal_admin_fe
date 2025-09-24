// src/store/auth.js
import { defineStore } from 'pinia';
import { login, logout, switchCompany } from '@/modules/auth/api/auth';
import axios from '@/api/axios';
import { useUiStore } from '@/store/ui';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    companies: [], // 예: 사용자에게 할당된 회사 정보
    menu: [], // 메뉴 정보 추가
  }),
  actions: {
    // localStorage에서 데이터 복원
    initializeFromStorage() {
      const token = localStorage.getItem('token');
      const menu = localStorage.getItem('menu');
      
      if (token) {
        this.token = token;
        // axios 헤더에 토큰 설정
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      if (menu) {
        try {
          this.menu = JSON.parse(menu);
        } catch (error) {
          console.error('메뉴 데이터 파싱 실패:', error);
          this.menu = [];
        }
      }
    },

    async loginAction(credentials) {
      try {
        // 백엔드로 로그인 요청
        const response = await login(credentials);
        // 백엔드에서 token, user, companies 등을 리턴한다고 가정
        const { access_token, user, companies, menu } = response.data;
        
        // 상태 업데이트
        this.token = access_token;
        this.user = user;
        this.companies = companies;
        this.menu = menu;

        // 필요 시 로컬 스토리지에 저장
        localStorage.setItem("token", access_token);
        localStorage.setItem("menu", JSON.stringify(menu));

        // /dashboard path를 가진 메뉴의 menu_no 찾기
        const findDashboardId = (menuItems) => {
          for (const item of menuItems) {
            if (item.path === '/dashboard') {
              return item.menu_no;
            }
            if (item.children && item.children.length > 0) {
              const found = findDashboardId(item.children);
              if (found) return found;
            }
          }
          return null;
        };

        const dashboardId = findDashboardId(menu);
        if (dashboardId) {
          localStorage.setItem("ui.activeMenuId", dashboardId);
        }
        
        // axios 헤더에 토큰 설정
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        // 메뉴 데이터로 동적 라우트 생성
        if (menu && menu.length > 0 && window.router) {
          const { addDynamicRoutes } = await import('@/utils/routeGenerator');
          addDynamicRoutes(window.router, menu);
        }

        return { success: true };
      } catch (error) {
        // 로그인 실패 시 처리
        console.error('로그인 실패:', error);
        throw error;
      }
    },

    async logout() {
      try {
        // 백엔드로 로그아웃 요청
        await logout();
      } catch (error) {
        console.warn('로그아웃 API 호출 실패:', error);
      } finally {
        // 상태 초기화
        this.token = null;
        this.user = null;
        this.companies = [];
        this.menu = [];
        localStorage.removeItem('token');
        localStorage.removeItem('menu');

        const uiStore = useUiStore();
        uiStore.reset();

        // axios 기본 헤더에서도 토큰 제거
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    },

    async switchCompanyAction(payload) {
      try {
        const response = await switchCompany(payload);
        const { access_token, user, companies, menu } = response.data;

        this.token = access_token;
        this.user = user;
        this.companies = companies;
        this.menu = menu;

        localStorage.setItem("token", access_token);
        localStorage.setItem("menu", JSON.stringify(menu));

        const findDashboardId = (menuItems) => {
          for (const item of menuItems) {
            if (item.path === '/dashboard') {
              return item.menu_no;
            }
            if (item.children && item.children.length > 0) {
              const found = findDashboardId(item.children);
              if (found) return found;
            }
          }
          return null;
        };

        const dashboardId = findDashboardId(menu);
        if (dashboardId) {
          localStorage.setItem("ui.activeMenuId", dashboardId);
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        window.location.reload();
      } catch (error) {
        console.error('회사 전환 실패:', error);
        throw error;
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || state.user?.username || '사용자',
    userEmail: (state) => state.user?.email || '',
    userRole: (state) => state.user?.role || 'Admin'
  },
});