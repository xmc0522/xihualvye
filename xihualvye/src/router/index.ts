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
      path: '/',
      name: 'home',
      component: () => import('../zhuye.vue'),
      children: childRoutes,
    },
  ],
})

export default router
