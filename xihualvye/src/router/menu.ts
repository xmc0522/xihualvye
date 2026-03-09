
// import BanjiDetailView from '@/views/天枢款/BanjiDetailView.vue'
// import BanjiEditView from '@/views/天枢款/BanjiEditView.vue'
import KaoshiAddView from '@/views/Kaoshi/kaoshiAddView.vue'
import KaoshiliebiaoView from '@/views/Kaoshi/KaoshiliebiaoView.vue'
import KaoshixiangqingView from '@/views/Kaoshi/KaoshixiangqingView.vue'
import RibaoAddView from '@/views/Ribao/RibaoAddView.vue'
import RibaoListView from '@/views/Ribao/RibaoListView.vue'
import RibaoDetail from '@/views/Ribao/RibaoDetail.vue'
import danmengbeibang1 from '@/views/天枢款/danmengbeibang-1.vue'
import danmengbeibang2 from '@/views/天枢款/danmengbeibang-2.vue'
import changyongkuan from '@/views/天枢款/changyongkuan.vue'

export const menuArr = [
  {
    path: '/banji',
    name: 'banji',
    title: '天枢款',
    children: [
      { path: '/banji/add', title: '天枢款-单门-加背板', component: danmengbeibang1 },
      { path: '/banji/list', title: '天枢款-单门-加背板-加固', component: danmengbeibang2 },
      { path: '/banji/detail', title: '天枢款-常用款', component: changyongkuan },
      // { path: '/banji/edit/:id', title: '编辑班级', component: BanjiEditView },
    ],
  },
  {
    path: '/kaoshi',
    name: 'kaoshi',
    title: '考试管理',
    children: [
      { path: '/kaoshi/fabukaoshi', title: '创建考试', component: KaoshiAddView },
      { path: '/kaoshi/list', title: '考试列表', component: KaoshiliebiaoView },
      { path: '/kaoshi/xiangqing', title: '考试详情', component: KaoshixiangqingView },
    ],
  },
  {
    path: '/ribao',
    name: 'ribao',
    title: '日报管理',
    children: [
      { path: '/ribao/add', title: '创建日报', component: RibaoAddView },
      { path: '/ribao/list', title: '日报列表', component: RibaoListView },
      { path: '/ribao/detail', title: '日报详情', component: RibaoDetail },
    ],
  },
]

export default menuArr
