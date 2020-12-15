import request from '@/utils/request'

/**
 * 定时任务列表
 * @param {*} params
 */
export function scheduleList(params) {
  return request({
    url: '/task/schedule/list',
    method: 'GET',
    params
  })
}

/**
 * 修改/新增定时任务
 * @param {*} data
 */
export function editSchedule(data) {
  return request({
    url: '/task/schedule/edit',
    method: 'post',
    data
  })
}

/**
 * 删除定时任务
 * @param {*} data
 */
export function deleteSchedule(data) {
  return request({
    url: '/task/schedule/delete',
    method: 'post',
    data
  })
}

/**
 * 更新定时任务状态
 * @param {*} data
 */
export function updateStatusSchedule(data) {
  return request({
    url: '/task/schedule/status/update',
    method: 'post',
    data
  })
}

/**
 * 执行任务
 * @param {*} data
 */
export function runSchedule(data) {
  return request({
    url: '/task/schedule/run',
    method: 'post',
    data
  })
}
