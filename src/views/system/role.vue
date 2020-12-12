<template>
  <div class="app-container">
    <el-row :gutter="15">
      <el-col :span="17">
        <el-card class="box-card">
          <div slot="header">
            <span>角色列表</span>
            <el-button v-waves class="filter-item" style="float: right;" type="primary" icon="el-icon-plus" @click="handleEdit(null)">添加</el-button>
          </div>
          <el-table v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%" @row-click="clickRow">
            <el-table-column align="center" prop="name" label="名称" />
            <el-table-column align="center" prop="description" label="描述" />
            <el-table-column align="center" prop="create_by" label="创建人" />
            <el-table-column align="center" label="创建时间">
              <template slot-scope="{row}">
                {{ row.create_time | dateTimeFilter('yyyy-MM-dd hh:mm:ss') }}
              </template>
            </el-table-column>
            <el-table-column align="center" prop="update_by" label="更新人" />
            <el-table-column align="center" label="更新时间">
              <template slot-scope="{row}">
                {{ row.update_time | dateTimeFilter('yyyy-MM-dd hh:mm:ss') }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="{row}">
                <el-button type="text" @click.stop="handleEdit(row)">编辑</el-button>
                <!-- <el-button type="text" @click="handleDelete(row)">{{ $t('table.delete') }}</el-button> -->
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="box-card">
          <div slot="header">
            <span>菜单分配</span>
            <el-button v-waves class="filter-item" style="float: right;" type="primary" icon="el-icon-check" :disabled="menuIds.length <= 0" @click="confirmRoleMenu">保存</el-button>
          </div>
          <el-tree ref="tree" :data="menuList" show-checkbox node-key="menu_id" :expand-on-click-node="false" @check-change="handleCheckChange">
            <template slot-scope="{ data }">
              <span>{{ data.title }}</span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑角色':'新增角色'" width="450px">
      <el-form ref="editForm" :model="formData" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入名称" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="confirmRole">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { menuList, roleList, editRole, editRoleMenu } from '@/api/system'
export default {
  directives: { waves },
  data() {
    return {
      menuList: [],
      menuOneIds: [],

      roleId: '',
      menuIds: [],

      listLoading: false,
      list: [],

      dialogVisible: false,
      dialogType: 'new',
      formData: {},
      rules: {
        name: { required: true, message: '请输入名称', trigger: 'blur' }
      }
    }
  },
  created() {
    this.getMenuList()
  },
  mounted() {
    this.roleList()
  },
  methods: {
    async roleList() {
      this.listLoading = true
      const { code, data } = await roleList()
      this.listLoading = false
      if (code === 0) {
        this.list = data.list
      }
    },
    async getMenuList() {
      const { code, data } = await menuList()
      if (code === 0) {
        this.menuList = data.list
        this.menuOneIds = data.list.map(item => item.menu_id)
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
    confirmRole() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return false
        const { code } = await editRole(this.formData)
        if (code === 0) {
          this.$message({
            message: this.dialogType === 'edit' ? '编辑成功' : '添加成功',
            type: 'success'
          })
          this.dialogVisible = false
          this.roleList()
        }
      })
    },
    clickRow(row) {
      this.roleId = row.role_id
      this.$refs.tree.setCheckedKeys(row.menus)
    },
    handleCheckChange(data) {
      const menuIds = this.$refs.tree.getCheckedKeys()
      this.menuIds = menuIds.filter(id => !this.menuOneIds.includes(id))
    },
    async confirmRoleMenu() {
      const { code } = await editRoleMenu({ role_id: this.roleId, menuIds: this.menuIds })
      if (code === 0) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        this.role_id = ''
        this.menuIds = []
        this.$refs.tree.setCheckedKeys(this.menuIds)
        this.roleList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  box-shadow: 0 0 0 !important;
}
</style>
