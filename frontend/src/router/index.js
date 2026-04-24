import Vue from 'vue'
import VueRouter from 'vue-router'
import { Notify } from 'quasar'

import routes from './routes'

Vue.use(VueRouter)

const Router = new VueRouter({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes,
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

const whiteListName = [
  'login'
]

Router.beforeEach((to, from, next) => {
  const token = JSON.parse(localStorage.getItem('token'))

  if (!token) {
    if (whiteListName.indexOf(to.name) == -1) {
      if (to.fullPath !== '/login' && !to.query.tokenSetup) {
        Notify.create({ message: 'Necessário realizar login', position: 'top' })
        next({ name: 'login' })
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

Router.afterEach(to => {
  window.scrollTo(0, 0)
})

export default Router
