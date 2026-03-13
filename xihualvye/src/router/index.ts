import { createRouter, createWebHistory } from 'vue-router'
import menuArr from '../router/menu'

// 将菜单配置扁平化为一维路由数组
// 有 children 的菜单项（如"天枢款"）→ 提取子路由
// 没有 children 但有 component 的菜单项（如"订单管理"）→ 直接作为路由
const childRoutes: Array<{ path: string; name?: string; component: any }> = []

for (const item of menuArr) {
  if (item.children && item.children.length > 0) {
    for (const child of item.children) {
      childRoutes.push({
        path: child.path,
        component: child.component,
      })
    }
  } else if ('component' in item && item.component) {
    childRoutes.push({
      path: item.path,
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
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../zhuye.vue'),
      children: childRoutes,
      meta: { requiresAuth: true }
    },
  ],
})

// 标记是否为页面刷新（首次加载）
let isFirstLoad = true

// 导航守卫：未登录时跳转到登录页 + 刷新回首页
router.beforeEach((to, _from, next) => {
  const auth = localStorage.getItem('xhly_auth')
  const isLoggedIn = !!auth

  if (to.path === '/login') {
    // 已登录用户访问登录页，直接跳到首页
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    // 需要登录的页面
    if (!isLoggedIn) {
      next('/login')
    } else if (isFirstLoad && to.path !== '/') {
      // 刷新浏览器时，回到首页（显示图片的页面）
      isFirstLoad = false
      next('/')
    } else {
      isFirstLoad = false
      next()
    }
  }
})

export default router
