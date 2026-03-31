
// Dashboard 使用懒加载，避免与 menu.ts 的循环依赖
// （Dashboard.ts 中需要 import menuArr，如果同步 import 会造成循环引用导致白屏）
const Dashboard = () => import('@/views/首页/Dashboard.vue')
import TSKDM from '@/views/自由选择页面/天枢-单门/TSK-DM.vue'
import TSKSM from '@/views/自由选择页面/天枢-双门/TSK-SM.vue'
import OrderManage from '@/views/订单管理页面/OrderManage.vue'
import { HomeFilled, Document, Operation, Grid, Menu, Pointer } from '@element-plus/icons-vue'
import { markRaw, type Component } from 'vue'
import danmengbeibang1 from '@/views/天枢款/danmengbeibang-1.vue'
import danmengbeibang2 from '@/views/天枢款/danmengbeibang-2.vue'
import changyongkuan from '@/views/天枢款/changyongkuan.vue'
import wushangbaobian from '@/views/天枢款/wushangbaobian.vue'
import Shuangmianmen1 from '@/views/天枢款/shuangmianmen-1.vue'
import Shuangmianmen2 from '@/views/天枢款/shuangmianmen-2.vue'
import danmengbeibang11 from '@/views/天权款/danmengbeibang-1.vue'
import danmengbeibang21 from '@/views/天权款/danmengbeibang-2.vue'
import changyongkuan1 from '@/views/天权款/changyongkuan.vue'
import wushangbaobian1 from '@/views/天权款/wushangbaobian.vue'
import Shuangmianmen11 from '@/views/天权款/shuangmianmen-1.vue'
import Shuangmianmen21 from '@/views/天权款/shuangmianmen-2.vue'
import danmengbeibang111 from '@/views/天璇款/danmengbeibang-1.vue'
import danmengbeibang211 from '@/views/天璇款/danmengbeibang-2.vue'
import changyongkuan11 from '@/views/天璇款/changyongkuan.vue'
import wushangbaobian11 from '@/views/天璇款/wushangbaobian.vue'
import Shuangmianmen111 from '@/views/天璇款/shuangmianmen-1.vue'
import Shuangmianmen211 from '@/views/天璇款/shuangmianmen-2.vue'

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
  {
    path: '/zyxz',
    name: 'zyxz',
    title: '自由选择',
    icon: markRaw(Pointer),
    children: [
      { path: '/zyxz/a', title: '天枢款-单面门-选择款', component: TSKDM },
      { path: '/zyxz/b', title: '天枢款-双面门-选择款', component: TSKSM },
    ],
  },
  {
    path: '/tianshu',
    name: 'tianshu',
    title: '天枢款',
    icon: markRaw(Menu),
    children: [
      { path: '/tianshu/c', title: '天枢款-常用款', component: changyongkuan },
      { path: '/tianshu/d', title: '天枢款-无上包边款', component: wushangbaobian },
      { path: '/tianshu/a', title: '天枢款-单门-加背板', component: danmengbeibang1 },
      { path: '/tianshu/b', title: '天枢款-单门-加背板-加固', component: danmengbeibang2 },
      { path: '/tianshu/e', title: '天枢款-双面门款', component: Shuangmianmen1 },
      { path: '/tianshu/f', title: '天枢款-双面门款-背面假门', component: Shuangmianmen2 },
    ],
  },
  {
    path: '/tianquan',
    name: 'tianquan',
    title: '天权款（暂时作废）',
    icon: markRaw(Operation),
    children: [
      { path: '/tianquan/a', title: '天权款-常用款', component: changyongkuan1 },
      { path: '/tianquan/b', title: '天权款-单门-加背板', component: danmengbeibang11 },
      { path: '/tianquan/c', title: '天权款-单门-加背板-加固', component: danmengbeibang21 },
      { path: '/tianquan/d', title: '天权款-无上包边款', component: wushangbaobian1 },
      { path: '/tianquan/e', title: '天权款-双面门款', component: Shuangmianmen11 },
      { path: '/tianquan/f', title: '天权款-双面门款-背面假门', component: Shuangmianmen21 },
    ],
  },
  {
    path: '/tianxuan',
    name: 'tianxuan',
    title: '天璇款（暂时作废）',
    icon: markRaw(Grid),
    children: [
      { path: '/tianxuan/a', title: '天枢款-单门-加背板', component: danmengbeibang111 },
      { path: '/tianxuan/b', title: '天枢款-单门-加背板-加固', component: danmengbeibang211 },
      { path: '/tianxuan/c', title: '天枢款-常用款', component: changyongkuan11 },
      { path: '/tianxuan/d', title: '天枢款-无上包边款', component: wushangbaobian11 },
      { path: '/tianxuan/e', title: '天枢款-双面门款', component: Shuangmianmen111 },
      { path: '/tianxuan/f', title: '天枢款-双面门款-背面假门', component: Shuangmianmen211 },
    ],
  },
  
 
]

export default menuArr
