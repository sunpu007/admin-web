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