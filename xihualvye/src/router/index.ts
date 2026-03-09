import { createRouter, createWebHistory } from 'vue-router'
import menuArr from '../router/menu'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../zhuye.vue'),
      children: [...menuArr],
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('../views/AboutView.vue'),
    // }
  ],
})

export default router
