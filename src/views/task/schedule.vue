<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="handleEdit(null)">新增</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" prop="job_id" label="任务ID" />
      <el-table-column align="center" prop="jobName" label="任务名" />
      <el-table-column align="center" prop="cron" label="Cron" />
      <el-table-column align="center" prop="jobHandler" label="jobHandler" />
      <el-table-column align="center" prop="params" label="参数" />
      <el-table-column align="center" prop="remark" label="任务描述" />
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
        <el-form-item label="任务描述" prop="remark">
          <el-input v-model="fromData.remark" type="textarea" placeholder="请输入任务描述" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirm">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import { scheduleList, editSchedule, deleteSchedule, updateStatusSchedule, runSchedule } from '@/api/task'
export default {
  components: { Pagination },
  directives: { waves },
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
      }
    }
  },
  mounted() {
    this.getList()
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
          message: '编辑成功',
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
    }
  }
}
</script>
