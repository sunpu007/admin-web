import { constantRoutes } from '@/router'

import Layout from '@/layout'

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 */
export function filterAsyncRoutes(routers) {
  const res = []

  routers.forEach(route => {
    const temp = { ...route }
    if (temp.component) {
      if (temp.component === 'layout') {
        temp.component = Layout
        temp.path = `/${temp.path}`
      } else {
        temp.component = loadView(temp.component)
      }
    }

    if (temp.children) {
      temp.children = filterAsyncRoutes(temp.children)
    }
    res.push(temp)
  })
  res.push({ path: '*', redirect: '/404', hidden: true })
  return res
}

const loadView = (view) => {
  return resolve => require([`@/views/${view}`], resolve)
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, asyncRoutes) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
