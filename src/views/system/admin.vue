<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="handleEdit(null)">添加</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" prop="adminId" label="ID" />
      <el-table-column align="center" prop="username" label="用户名" />
      <el-table-column align="center" prop="avatarUrl" label="头像">
        <template slot-scope="{row}">
          <el-image style="width: 50px; height: 50px" :src="row.avatarUrl" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="roleName" label="角色" />
      <el-table-column align="center" prop="status" label="状态" />
      <el-table-column align="center" prop="updateBy" label="更新人" />
      <el-table-column align="center" label="更新时间">
        <template slot-scope="{row}">
          {{ row.updateTime | dateTimeFilter('yyyy-MM-dd hh:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="createBy" label="创建人" />
      <el-table-column align="center" label="创建时间">
        <template slot-scope="{row}">
          {{ row.createTime | dateTimeFilter('yyyy-MM-dd hh:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{row}">
          <template v-if="row.adminId!==1">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" @click="delAdmin(row)">删除</el-button>
            <el-button type="text" @click="resetPwd(row)">重置密码</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑管理员':'添加管理员'" width="400px">
      <el-form ref="editForm" :model="formData" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="头像" prop="avatarUrl">
          <el-input v-model="formData.avatarUrl" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.role_id" placeholder="角色">
            <el-option v-for="item in roleList" :key="item.role_id" :label="item.name" :value="item.role_id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="confirmRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { getAdminList, editAdmin, delAdmin, resetPassword } from '@/api/system'
export default {
  directives: { waves },
  data() {
    return {
      listLoading: false,
      list: [],

      dialogVisible: false,
      dialogType: 'new',
      formData: {
        username: '',
        role: ''
      },
      rules: {
        username: { required: true, message: '请输入用户名', trigger: 'blur' }
      },

      roleList: []
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { code, data } = await getAdminList()
      this.listLoading = false
      if (code === 0) {
        this.list = data.list
      }
    },
    handleEdit(row) {
      if (row) {
        this.dialogType = 'edit'
        this.formData = JSON.parse(JSON.stringify(row))
      } else {
        this.dialogType = 'new'
        this.formData = {}
      }
      this.dialogVisible = true
    },
    async confirmRole() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return false
        const { code, data } = await editAdmin(this.formData)
        if (code === 0) {
          this.$message({
            message: this.dialogType === 'edit' ? '编辑成功' : '添加成功',
            type: 'success'
          })
          if (this.dialogType === 'new') {
            this.$confirm(`${this.formData.username}的初始登陆密码为${data.pwd}，请妥善保管`, '警告', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
          }
          this.dialogVisible = false
          this.getList()
        }
      })
    },
    async delAdmin(row) {
      this.$confirm('确定删除该账户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await delAdmin({ username: row.username })
        if (code === 0) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        }
        this.getList()
      })
    },
    resetPwd(row) {
      this.$confirm('确定要重置该账号的密码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code, data } = await resetPassword({ username: row.username })
        if (code === 0) {
          this.$message({
            message: '重置成功',
            type: 'success'
          })
          this.$confirm(`重置后的登陆密码为${data.pwd}，请妥善保管`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
      })
    }
  }
}
</script>
