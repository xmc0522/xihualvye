
import danmengbeibang1 from '@/views/天枢款/danmengbeibang-1.vue'
import danmengbeibang2 from '@/views/天枢款/danmengbeibang-2.vue'
import changyongkuan from '@/views/天枢款/changyongkuan.vue'
import wushangbaobian from '@/views/天枢款/wushangbaobian.vue'
import Shuangmianmen1 from '@/views/天枢款/shuangmianmen-1.vue'
import Shuangmianmen2 from '@/views/天枢款/shuangmianmen-2.vue'

export const menuArr = [
  {
    path: '/tianshu',
    name: 'tianshu',
    title: '天枢款',
    children: [
      { path: '/tianshu/a', title: '天枢款-单门-加背板', component: danmengbeibang1 },
      { path: '/tianshu/b', title: '天枢款-单门-加背板-加固', component: danmengbeibang2 },
      { path: '/tianshu/c', title: '天枢款-常用款', component: changyongkuan },
      { path: '/tianshu/d', title: '天枢款-无上包边款', component: wushangbaobian },
      { path: '/tianshu/e', title: '天枢款-双面门款', component: Shuangmianmen1 },
      { path: '/tianshu/f', title: '天枢款-双面门款-背面假门', component: Shuangmianmen2 },
    ],
  },
  // {
  //   path: '/tianquan',
  //   name: 'tianquan',
  //   title: '天权款',
  //   children: [
  //     { path: '/tianquan/a', title: '天枢款-单门-加背板', component: danmengbeibang1 },
  //     { path: '/tianquan/b', title: '天枢款-单门-加背板-加固', component: danmengbeibang2 },
  //     { path: '/tianquan/c', title: '天枢款-常用款', component: changyongkuan },
  //     { path: '/tianquan/d', title: '天枢款-无上包边款', component: wushangbaobian },
  //     { path: '/tianquan/e', title: '天枢款-双面门款', component: Shuangmianmen1 },
  //     { path: '/tianquan/f', title: '天枢款-双面门款-背面假门', component: Shuangmianmen2 },
  //   ],
  // },
  
 
]

export default menuArr
