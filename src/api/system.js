import request from '@/utils/request'

export function getAdminList(params) {
  return request({
    url: '/system/admin/list',
    method: 'get',
    params
  })
}

export function editAdmin(data) {
  return request({
    url: '/system/admin/edit',
    method: 'post',
    data
  })
}

export function delAdmin(data) {
  return request({
    url: '/system/admin/delete',
    method: 'post',
    data
  })
}

export function resetPassword(data) {
  return request({
    url: '/system/admin/pwd/reset',
    method: 'post',
    data
  })
}

/**
 * 获取菜单列表
 * @param {*} params
 */
export function menuList(params) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params
  })
}

/**
 * 编辑菜单
 * @param {*} data
 */
export function editMenu(data) {
  return request({
    url: '/system/menu/edit',
    method: 'post',
    data
  })
}

/**
 * 删除菜单
 * @param {*} data
 */
export function deleteMenu(data) {
  return request({
    url: '/system/menu/delete',
    method: 'post',
    data
  })
}

/**
 * 获取角色列表
 * @param {*} params
 */
export function roleList(params) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params
  })
}

/**
 * 编辑角色
 * @param {*} data
 */
export function editRole(data) {
  return request({
    url: '/system/role/edit',
    method: 'post',
    data
  })
}

/**
 * 编辑角色菜单
 * @param {*} data
 */
export function editRoleMenu(data) {
  return request({
    url: '/system/role/menu/edit',
    method: 'post',
    data
  })
}
