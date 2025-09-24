// 모든 페이지 컴포넌트를 자동으로 로드
const modules = import.meta.glob('@/modules/**/pages/*.vue')

// 절대 경로를 별칭 경로로 변환하는 매핑 생성
const pathMapping = {}
Object.keys(modules).forEach(path => {
  // "/src/modules/setting/pages/Sku.vue" -> "@/modules/setting/pages/Sku.vue"
  const aliasPath = path.replace('/src/', '@/')
  pathMapping[aliasPath] = modules[path]
})

function loadComponent(componentPath) {
  if (!componentPath) {
    return () => import('@/modules/dashboard/pages/DashboardHome.vue')
  }
  
  
  if (pathMapping[componentPath]) {
    return pathMapping[componentPath]
  }
  // 기본 컴포넌트 반환
  return pathMapping['@/modules/dashboard/pages/DashboardHome.vue'] || (() => import('@/modules/dashboard/pages/DashboardHome.vue'))
}

// 메뉴 데이터를 라우트 객체로 변환하는 함수
export function generateRoutesFromMenu(menuData) {
  const routes = []
  
  function processMenuItems(items, parentPath = '') {
    items.forEach(item => {
      if (item.path && item.path !== '/') {
        // 경로 정규화 (앞의 슬래시 제거)
        const normalizedPath = item.path.replace(/^\//, '')

        const route = {
          path: normalizedPath,
          name: item.menu_name,
          component: loadComponent(item.component),
          meta: {
            menuNo: item.menu_no,
            parentNo: item.parent_no,
            icon: item.icon,
            isVisible: item.is_visible,
            requiresAuth: true
          }
        }

        // 컴포넌트가 없는 경우 기본 페이지 컴포넌트 사용
        if (!route.component) {
          route.component = loadComponent('@/modules/dashboard/pages/DashboardHome.vue')
        }
        
        routes.push(route)
      }
      
      // 자식 메뉴가 있는 경우 재귀적으로 처리
      if (item.children && item.children.length > 0) {
        processMenuItems(item.children, item.path)
      }
    })
  }
  
  processMenuItems(menuData)
  return routes
}

// 라우터에 동적 라우트를 추가하는 함수
export function addDynamicRoutes(router, menuData) {
  const dynamicRoutes = generateRoutesFromMenu(menuData)
  
  dynamicRoutes.forEach(route => {
    // 이미 존재하는 라우트인지 확인
    const existingRoute = router.getRoutes().find(r => r.path === route.path)
    if (!existingRoute) {
      try {
        router.addRoute('DefaultLayout', route)
      } catch (error) {
        console.error(`라우트 추가 실패: ${route.path}`, error)
      }
    }
  })
}

// 중복 로직 제거를 위한 중앙집중식 동적 라우트 초기화 함수
export function initializeDynamicRoutes(router, authStore) {
  // 이미 동적 라우트가 추가되었는지 확인
  const existingRoutes = router.getRoutes().filter(route => route.meta && route.meta.menuNo)
  if (existingRoutes.length > 0) {
    return true // 이미 추가됨
  }

  let menuData = null

  // 1. authStore에서 메뉴 데이터 확인
  if (authStore.menu && authStore.menu.length > 0) {
    menuData = authStore.menu
  } 
  // 2. localStorage에서 메뉴 데이터 확인
  else {
    const storedMenu = localStorage.getItem('menu')
    if (storedMenu) {
      try {
        const parsedMenu = JSON.parse(storedMenu)
        if (parsedMenu && parsedMenu.length > 0) {
          authStore.menu = parsedMenu
          menuData = parsedMenu
        }
      } catch (error) {
        console.error('메뉴 데이터 파싱 실패:', error)
        return false
      }
    }
  }

  // 메뉴 데이터가 있으면 동적 라우트 추가
  if (menuData) {
    addDynamicRoutes(router, menuData)
    return true
  }

  return false
}
