import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '/', name: 'Home', component: () => import('../views/Details.vue') },
    { path: '/details', name: 'MoneyDetails', component: () => import('../views/Details.vue') },
    { path: '/addDetails', name: 'AddDetails', component: () => import('../views/AddDetails/AddDetails.vue') },
    { path: '/editDetails', name: 'EditDetails', component: () => import('../views/AddDetails/EditDetails.vue') },
    { path: '/graphViews', name: 'GraphView', component: () => import('../views/GraphView.vue') },
    { path: '/moneyManagement', name: 'MoneyManagement', component: () => import('../views/MoneyManagement.vue') },
    { path: '/myAssetsDetail', name: 'MyAssetsDetail', component: () => import('../views/MyAssetsDetail.vue') },
    { path: '/billDetail', name: 'BillDetail', component: () => import('../views/BillDetail.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' } //未匹配路由重定向到首页
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router