// import StudentHomeView from "../views/StudentHomeView.vue";
import BanjiAddView from '@/views/Banji/BanjiAddView.vue'
import BanjiListView from '@/views/Banji/BanjiListView.vue'
import BanjiDetailView from '@/views/Banji/BanjiDetailView.vue'
import BanjiEditView from '@/views/Banji/BanjiEditView.vue'
import KaoshiAddView from '@/views/Kaoshi/kaoshiAddView.vue'
import KaoshiliebiaoView from '@/views/Kaoshi/KaoshiliebiaoView.vue'
import KaoshixiangqingView from '@/views/Kaoshi/KaoshixiangqingView.vue'
import RibaoAddView from '@/views/Ribao/RibaoAddView.vue'
import RibaoListView from '@/views/Ribao/RibaoListView.vue'
import RibaoDetail from '@/views/Ribao/RibaoDetail.vue'

export const menuArr = [
  {
    path: '/banji',
    name: 'banji',
    title: '班级管理',
    children: [
      { path: '/banji/add', title: '创建班级', component: BanjiAddView },
      { path: '/banji/list', title: '班级列表', component: BanjiListView },
      { path: '/banji/detail/:id', title: '班级详情', component: BanjiDetailView },
      { path: '/banji/edit/:id', title: '编辑班级', component: BanjiEditView },
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
