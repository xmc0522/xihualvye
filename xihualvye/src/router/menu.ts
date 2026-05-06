// 所有路由组件全部使用懒加载（动态 import），减少首屏体积
import { HomeFilled, Document, Operation, Grid, Menu, Pointer } from '@element-plus/icons-vue'
import { markRaw } from 'vue'

// ===== 懒加载所有页面组件 =====
const Dashboard = () => import('@/views/首页/Dashboard.vue')
const OrderManage = () => import('@/views/订单管理页面/OrderManage.vue')

// 自由选择
// const TSKDM = () => import('@/views/自由选择页面/天枢-单门/TSK-DM.vue')
// const TSKSM = () => import('@/views/自由选择页面/天枢-双门/TSK-SM.vue')

// 天枢款
const TSChangyong = () => import('@/views/天枢款/changyongkuan.vue')
const TSDanmeng1 = () => import('@/views/天枢款/danmengbeibang-1.vue')
const TSDanmeng2 = () => import('@/views/天枢款/danmengbeibang-2.vue')
const TSShuang1 = () => import('@/views/天枢款/shuangmianmen-1.vue')
const TSShuang2 = () => import('@/views/天枢款/shuangmianmen-2.vue')

// 天权款
// const TQChangyong = () => import('@/views/天权款/changyongkuan.vue')
// const TQWushang = () => import('@/views/天权款/wushangbaobian.vue')
// const TQDanmeng1 = () => import('@/views/天权款/danmengbeibang-1.vue')
// const TQDanmeng2 = () => import('@/views/天权款/danmengbeibang-2.vue')
// const TQShuang1 = () => import('@/views/天权款/shuangmianmen-1.vue')
// const TQShuang2 = () => import('@/views/天权款/shuangmianmen-2.vue')

// 天璇款
// const TXChangyong = () => import('@/views/天璇款/changyongkuan.vue')
// const TXWushang = () => import('@/views/天璇款/wushangbaobian.vue')
// const TXDanmeng1 = () => import('@/views/天璇款/danmengbeibang-1.vue')
// const TXDanmeng2 = () => import('@/views/天璇款/danmengbeibang-2.vue')
// const TXShuang1 = () => import('@/views/天璇款/shuangmianmen-1.vue')
// const TXShuang2 = () => import('@/views/天璇款/shuangmianmen-2.vue')

export const menuArr = [
  {
    path: '/dashboard',
    name: 'dashboard',
    title: '首页',
    icon: markRaw(HomeFilled),
    component: Dashboard,
  },
  {
    path: '/orders',
    name: 'orders',
    title: '订单管理',
    icon: markRaw(Document),
    component: OrderManage,
  },
  // {
  //   path: '/zyxz',
  //   name: 'zyxz',
  //   title: '自由选择',
  //   icon: markRaw(Pointer),
  //   children: [
  //     { path: '/zyxz/a', title: '天枢款-单面门-选择款', component: TSKDM },
  //     { path: '/zyxz/b', title: '天枢款-双面门-选择款', component: TSKSM },
  //   ],
  // },
  {
    path: '/tianshu',
    name: 'tianshu',
    title: '天枢款',
    icon: markRaw(Menu),
    children: [
      { path: '/tianshu/c', title: '常用款', component: TSChangyong },
      { path: '/tianshu/a', title: '常用款-背板全平', component: TSDanmeng1 },
      { path: '/tianshu/b', title: '天枢款-单门-加背板-加固', component: TSDanmeng2 },
      { path: '/tianshu/e', title: '天枢款-双面门款', component: TSShuang1 },
      { path: '/tianshu/f', title: '天枢款-双面门款-背面假门', component: TSShuang2 },
    ],
  },
  // {
  //   path: '/tianquan',
  //   name: 'tianquan',
  //   title: '天权款（暂时作废）',
  //   icon: markRaw(Operation),
  //   children: [
  //     { path: '/tianquan/a', title: '天权款-常用款', component: TQChangyong },
  //     { path: '/tianquan/b', title: '天权款-单门-加背板', component: TQDanmeng1 },
  //     { path: '/tianquan/c', title: '天权款-单门-加背板-加固', component: TQDanmeng2 },
  //     { path: '/tianquan/d', title: '天权款-无上包边款', component: TQWushang },
  //     { path: '/tianquan/e', title: '天权款-双面门款', component: TQShuang1 },
  //     { path: '/tianquan/f', title: '天权款-双面门款-背面假门', component: TQShuang2 },
  //   ],
  // },
  // {
  //   path: '/tianxuan',
  //   name: 'tianxuan',
  //   title: '天璇款（暂时作废）',
  //   icon: markRaw(Grid),
  //   children: [
  //     { path: '/tianxuan/a', title: '天枢款-单门-加背板', component: TXDanmeng1 },
  //     { path: '/tianxuan/b', title: '天枢款-单门-加背板-加固', component: TXDanmeng2 },
  //     { path: '/tianxuan/c', title: '天枢款-常用款', component: TXChangyong },
  //     { path: '/tianxuan/d', title: '天枢款-无上包边款', component: TXWushang },
  //     { path: '/tianxuan/e', title: '天枢款-双面门款', component: TXShuang1 },
  //     { path: '/tianxuan/f', title: '天枢款-双面门款-背面假门', component: TXShuang2 },
  //   ],
  // },
]

export default menuArr
