import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import menuArr from '../router/menu'

// 把绝对路径（`/foo/bar`）转为相对路径（`foo/bar`），用于注册到父路由 `/` 的 children。
// Vue Router 4 子路由建议用相对路径；菜单配置仍保留绝对路径以方便 el-menu 的 index 绑定与 router.push。
function toRelative(p: string): string {
  return p.startsWith('/') ? p.slice(1) : p
}

// 将菜单配置扁平化为 children 路由数组
const childRoutes: RouteRecordRaw[] = []

for (const item of menuArr) {
  if (item.children && item.children.length > 0) {
    for (const child of item.children) {
      childRoutes.push({
        path: toRelative(child.path),
        component: child.component,
      })
    }
  } else if ('component' in item && item.component) {
    childRoutes.push({
      path: toRelative(item.path),
      name: item.name,
      component: item.component,
    })
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/登录页/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../zhuye.vue'),
      redirect: '/dashboard',
      children: childRoutes,
      meta: { requiresAuth: true }
    },
  ],
})

// 导航守卫：未登录时跳转到登录页
router.beforeEach((to, _from, next) => {
  const auth = localStorage.getItem('xhly_auth')
  let isLoggedIn = false

  // 检查是否真正登录（有 loginTime 且在 24 小时有效期内）
  if (auth) {
    try {
      const authData = JSON.parse(auth)
      if (authData.loginTime && Date.now() - authData.loginTime < 24 * 60 * 60 * 1000) {
        isLoggedIn = true
      }
    } catch (e) {
      // 解析失败，清除无效数据
      localStorage.removeItem('xhly_auth')
    }
  }

  if (to.path === '/login') {
    // 已登录用户访问登录页，直接跳到首页
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    // 需要登录的页面：未登录则跳转到登录页
    if (!isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router
