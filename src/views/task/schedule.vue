<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="handleEdit(null)">新增</el-button>
    </div>
    <i style="color: red;"><b>当前项目中存在两个jobHandler方法，testHandler（定时打印日志）与testCurlHandler（定时调用接口，参数为必填，必须为json字符串格式）</b></i>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" prop="job_id" label="任务ID" />
      <el-table-column align="center" prop="jobName" label="任务名" />
      <el-table-column align="center" prop="cron" label="Cron" />
      <el-table-column align="center" prop="jobHandler" label="jobHandler" />
      <el-table-column align="center" prop="params" label="参数" />
      <el-table-column align="center" prop="description" label="任务描述" />
      <el-table-column align="center" prop="status" label="状态">
        <template slot-scope="{row}">
          <el-tag v-if="row.status==0" type="success">run</el-tag>
          <el-tag v-else type="info">stop</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{row}">
          <el-button v-if="row.status==-1" type="text" @click="updateStatus(row.job_id, 0)">启动</el-button>
          <el-button v-else type="text" @click="updateStatus(row.job_id, -1)">停止</el-button>
          <el-button type="text" @click="run(row.job_id)">执行</el-button>
          <el-button type="text" @click="showLog(row.job_id)">日志</el-button>
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑任务':'新增任务'" width="400px">
      <el-form ref="editForm" :rules="rules" :model="fromData" label-width="100px" label-position="right">
        <el-form-item label="Cron" prop="cron">
          <el-input v-model="fromData.cron" placeholder="请输入Cron" />
        </el-form-item>
        <el-form-item label="任务名" prop="jobName">
          <el-input v-model="fromData.jobName" placeholder="请输入任务名" />
        </el-form-item>
        <el-form-item label="jobHandler" prop="jobHandler">
          <el-input v-model="fromData.jobHandler" placeholder="请输入jobHandler" />
        </el-form-item>
        <el-form-item label="参数" prop="params">
          <el-input v-model="fromData.params" type="textarea" placeholder="请输入参数" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="fromData.description" type="textarea" placeholder="请输入任务描述" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirm">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="logDialogVisible" fullscreen title="执行记录">
      <el-table :data="logList" border fit highlight-current-row style="width: 100%">
        <el-table-column align="center" prop="id" label="ID" />
        <el-table-column align="center" prop="jobName" label="任务名" />
        <el-table-column align="center" prop="jobHandler" label="处理方法" />
        <el-table-column align="center" prop="jobParam" label="参数" />
        <el-table-column align="center" prop="handleTime" label="执行时间" />
        <el-table-column align="center" prop="jobStatus" label="执行状态">
          <template slot-scope="{row}">
            <el-tag v-if="row.jobStatus==0" type="success">成功</el-tag>
            <el-tag v-else type="info">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="triggerType" label="触发类型">
          <template slot-scope="{row}">
            {{ row.triggerType | triggerTypeFilter }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="executionStatus" label="任务状态">
          <template slot-scope="{row}">
            {{ row.executionStatus | executionStatusFilter }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="{row}">
            <el-button type="text" @click="showDetail(row.id)">详情日志</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="logTotal>0" :total="logTotal" :page.sync="logListQuery.page" :limit.sync="logListQuery.size" @pagination="getLogList" />
    </el-dialog>

    <el-dialog :visible.sync="logDetailDialogVisible" title="执行日志">
      <div v-html="logDetail" />
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import { scheduleList, editSchedule, deleteSchedule, updateStatusSchedule, runSchedule, scheduleLogList, scheduleLogDetail } from '@/api/task'
export default {
  components: { Pagination },
  directives: { waves },
  filters: {
    triggerTypeFilter(val) {
      return val === 0 ? '任务触发' : '手动触发'
    },
    executionStatusFilter(val) {
      return val === 0 ? '执行中' : '执行完成'
    }
  },
  data() {
    return {
      listLoading: false,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        size: 20
      },

      dialogVisible: false,
      dialogType: 'new',
      fromData: {},
      rules: {
        cron: { required: true, message: '请输入Cron', trigger: 'blur' },
        jobName: { required: true, message: '请输入任务名', trigger: 'blur' },
        jobHandler: { required: true, message: '请输入jobHandler', trigger: 'blur' }
      },

      // 日志浮窗
      logDialogVisible: false,
      logListQuery: {
        page: 1,
        size: 20,
        job_id: ''
      },
      logList: [],
      logTotal: 0,

      logDetailDialogVisible: false,
      logDetail: '',
      timer: null
    }
  },
  mounted() {
    this.getList()
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { code, data } = await scheduleList(this.listQuery)
      this.listLoading = false
      if (code === 0) {
        this.list = data.list
        this.total = data.total
      }
    },
    handleEdit(row) {
      this.fromData = {}
      if (row) {
        this.fromData = JSON.parse(JSON.stringify(row))
        this.dialogType = 'edit'
      } else {
        this.dialogType = 'new'
      }
      this.dialogVisible = true
    },
    async confirm() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return false
        const { code } = await editSchedule(this.fromData)
        if (code === 0) {
          this.$message({
            message: this.dialogType === 'edit' ? '编辑成功' : '新增成功',
            type: 'success'
          })
          this.dialogVisible = false
          this.getList()
        }
      })
    },
    del(row) {
      this.$confirm('确定要删除该任务吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await deleteSchedule({ job_id: row.job_id })
        if (code === 0) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getList()
        }
      })
    },
    async updateStatus(job_id, status) {
      const { code } = await updateStatusSchedule({ job_id, status })
      if (code === 0) {
        this.$message({
          message: status === 0 ? '任务启动成功' : '任务停止成功',
          type: 'success'
        })
        this.getList()
      }
    },
    async run(job_id) {
      const { code } = await runSchedule({ job_id })
      if (code === 0) {
        this.$message({
          message: '执行成功',
          type: 'success'
        })
      }
    },
    showLog(job_id) {
      this.logListQuery.job_id = job_id
      this.getLogList()
      this.logDialogVisible = true
    },
    async getLogList() {
      const { code, data } = await scheduleLogList(this.logListQuery)
      if (code === 0) {
        this.logList = data.list
        this.logTotal = data.total
      }
    },
    showDetail(id) {
      this.logDetail = ''
      this.getLogDetail(id)
      this.timer = setInterval(() => {
        this.getLogDetail(id)
      }, 1000)
      this.logDetailDialogVisible = true
    },
    async getLogDetail(id) {
      const { code, data } = await scheduleLogDetail({ id })
      if (code === 0) {
        this.logDetail = data.detail
        if (data.executionStatus === 1) clearInterval(this.timer)
      }
    }
  }
}
</script>
