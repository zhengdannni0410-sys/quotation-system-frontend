<template>
  <div>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>工作环节管理</span>
          <el-button type="primary" @click="openDialog">新增工作环节</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="machine_required" label="是否需要机器" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.machine_required ? 'success' : 'info'">
              {{ scope.row.machine_required ? '需要' : '不需要' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editRow(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRow(scope.row)">删除</el-button>
            <el-button size="small" @click="toggleStatus(scope.row)">
              {{ scope.row.is_active ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑工作环节' : '新增工作环节'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="是否需要机器" prop="machine_required">
          <el-switch v-model="form.machine_required" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="form.is_active" active-value="1" inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { workProcessApi, type WorkProcess } from '../api'

const tableData = ref<WorkProcess[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<Omit<WorkProcess, 'id' | 'created_at' | 'updated_at'>>({
  name: '',
  description: '',
  machine_required: 0,
  is_active: 1
})

const loadData = async () => {
  const res = await workProcessApi.getAll()
  tableData.value = res.data
}

const openDialog = () => {
  isEdit.value = false
  form.value = {
    name: '',
    description: '',
    machine_required: 0,
    is_active: 1
  }
  dialogVisible.value = true
}

const editRow = (row: WorkProcess) => {
  isEdit.value = true
  form.value = {
    name: row.name,
    description: row.description,
    machine_required: row.machine_required,
    is_active: row.is_active
  }
  dialogVisible.value = true
}

const deleteRow = async (row: WorkProcess) => {
  try {
    await workProcessApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '删除失败')
  }
}

const toggleStatus = async (row: WorkProcess) => {
  try {
    await workProcessApi.update(row.id, { is_active: row.is_active ? 0 : 1 })
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '操作失败')
  }
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await workProcessApi.update(tableData.value.find(r => r.name === form.value.name)?.id!, form.value)
      ElMessage.success('更新成功')
    } else {
      await workProcessApi.create(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '操作失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
</style>
