import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'QuotationList',
      component: () => import('../views/QuotationList.vue')
    },
    {
      path: '/cost-baseline',
      name: 'CostBaseline',
      component: () => import('../views/CostBaseline.vue')
    },
    {
      path: '/work-process',
      name: 'WorkProcess',
      component: () => import('../views/WorkProcess.vue')
    },
    {
      path: '/create-quotation',
      name: 'CreateQuotation',
      component: () => import('../views/CreateQuotation.vue')
    },
    {
      path: '/quotation/:id',
      name: 'QuotationDetail',
      component: () => import('../views/QuotationDetail.vue')
    },
    {
      path: '/approval',
      name: 'Approval',
      component: () => import('../views/Approval.vue')
    }
  ]
})

export default router
