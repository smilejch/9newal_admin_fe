import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    openMenuIds: [],      // 펼친 메뉴들의 menu_no 배열
    activeMenuId: null,   // 현재 활성 메뉴 menu_no
  }),
  getters: {
    isOpen: (state) => (id) => state.openMenuIds.includes(id),
  },
  actions: {
    toggleOpen(id) {
      if (this.openMenuIds.includes(id)) {
        this.openMenuIds = this.openMenuIds.filter(x => x !== id)
      } else {
        this.openMenuIds.push(id)
      }
      this.persist()
    },
    openAncestorsByRoute(path, menus) {
      // path로 메뉴 노드 경로 찾고, 그 경로 상위들을 open
      const chain = findChainByPath(menus, path) // [{menu_no,...}, ...]
      if (chain.length) {
        this.activeMenuId = parseInt(localStorage.getItem('ui.activeMenuId'))
        const parents = chain.slice(0, -1).map(n => n.menu_no)
        this.openMenuIds = Array.from(new Set([...this.openMenuIds, ...parents]))
        this.persist()
      }
    },
    setActive(menuId) {
      this.activeMenuId = menuId
      this.persist()
    },
    persist() {
      localStorage.setItem('ui.openMenuIds', JSON.stringify(this.openMenuIds))
      localStorage.setItem('ui.activeMenuId', JSON.stringify(this.activeMenuId))
    },
    initFromStorage() {
      try {
        const o = JSON.parse(localStorage.getItem('ui.openMenuIds') || '[]')
        const a = JSON.parse(localStorage.getItem('ui.activeMenuId') || 'null')
        this.openMenuIds = Array.isArray(o) ? o : []
        this.activeMenuId = a
      } catch { /* noop */ }
    },
    reset() {
      this.openMenuIds = []
      this.activeMenuId = null
      localStorage.removeItem('ui.openMenuIds')
      localStorage.removeItem('ui.activeMenuId')
    }
  }
})

// 헬퍼: path로 메뉴 트리에서 경로(루트→타깃) 찾기
function findChainByPath(menus, path) {
  const norm = (p) => (p?.startsWith('/') ? p : `/${p}`)
  const dfs = (nodes, acc=[]) => {
    for (const n of nodes || []) {
      const here = [...acc, n]
      if (n.path && norm(n.path) === norm(path)) return here
      const found = dfs(n.children, here)
      if (found) return found
    }
    return null
  }
  return dfs(menus) || []
}
