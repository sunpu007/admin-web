<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-plus" @click="handleEdit(null)">添加</el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%" row-key="menu_id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column align="center" prop="title" label="菜单标题" />
      <el-table-column align="center" prop="icon" label="图标">
        <template slot-scope="{row}">
          <svg-icon :icon-class="row.icon" />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="menu_sort" label="排序" />
      <el-table-column align="center" prop="component" label="组建路径" />
      <el-table-column align="center" label="是否隐藏">
        <template slot-scope="{row}">
          {{ !!row.hidden }}
        </template>
      </el-table-column>
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
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'编辑菜单':'添加菜单'" width="450px">
      <el-form ref="editForm" :model="formData" :rules="rules" label-width="80px" label-position="right">
        <el-form-item label="菜单标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单标题" />
        </el-form-item>
        <el-form-item label="组件名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入组件名" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="formData.component" placeholder="请输入组件" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择图标">
            <el-option v-for="item in icons" :key="item" :label="item" :value="item">
              <svg-icon :icon-class="item" />
              <span style="padding-left: 5px;">{{ item }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="上级菜单" prop="pid">
          <el-select v-model="formData.pid" placeholder="请选择上级菜单">
            <el-option label="一级菜单" :value="0" />
            <el-option v-for="item in list" :key="item.menu_id" :label="item.title" :value="item.menu_id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.pid === 0" label="重定向" prop="redirect">
          <el-input v-model="formData.redirect" placeholder="请输入重定向路径" />
        </el-form-item>
        <el-form-item label="排序" prop="menu_sort">
          <el-input-number v-model="formData.menu_sort" style="width: 100%" type="number" placeholder="请输入菜单排序" />
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-select v-model="formData.hidden" placeholder="请选择是否显示">
            <el-option label="显示" :value="0" />
            <el-option label="隐藏" :value="1" />
          </el-select>
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
import { icons } from '@/icons'
import { menuList, editMenu, deleteMenu } from '@/api/system'
export default {
  directives: { waves },
  data() {
    return {
      listLoading: false,
      list: [],

      dialogVisible: false,
      dialogType: 'new',
      formData: {},
      rules: {
        title: { required: true, message: '请输入菜单标题', trigger: 'blur' },
        name: { required: true, message: '请输入组件名', trigger: 'blur' },
        component: { required: true, message: '请输入组件', trigger: 'blur' },
        icon: { required: true, message: '请选择图标', trigger: 'blur' },
        path: { required: true, message: '请输入路径', trigger: 'blur' },
        pid: { required: true, message: '请选择上级菜单', trigger: 'blur' },
        menu_sort: { required: true, message: '请输入菜单排序', trigger: 'blur' }
      },

      icons
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      const { code, data } = await menuList()
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
    confirmRole() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return false
        const { code } = await editMenu(this.formData)
        if (code === 0) {
          this.$message({
            message: this.dialogType === 'edit' ? '编辑成功' : '添加成功',
            type: 'success'
          })
          this.dialogVisible = false
          this.getList()
        }
      })
    },
    async handleDelete({ menu_id }) {
      this.$confirm('确定删除该菜单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const { code } = await deleteMenu({ menu_id })
        if (code === 0) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        }
        this.getList()
      })
    }
  }
}
</script>
