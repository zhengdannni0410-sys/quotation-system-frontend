<template>
  <div>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>成本基线管理</span>
          <el-button type="primary" @click="openDialog">新增年度成本数据</el-button>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="year" label="年度" width="100" />
        <el-table-column prop="machine_hourly_rate" label="机器单小时报价(元)" width="180" />
        <el-table-column prop="labor_hourly_rate" label="人力单小时成本(元)" width="180" />
        <el-table-column prop="overhead_rate" label="公共分摊率(%)" width="150" />
        <el-table-column prop="utility_rate" label="水电费率(%)" width="150" />
        <el-table-column prop="updated_at" label="更新时间" width="200" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="editRow(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑成本基线' : '新增成本基线'" width="500px">
      <el-form :model="form" label-width="150px">
        <el-form-item label="年度" prop="year">
          <el-input-number v-model="form.year" :min="2000" :max="2100" />
        </el-form-item>
        <el-form-item label="机器单小时报价(元)" prop="machine_hourly_rate">
          <el-input-number v-model="form.machine_hourly_rate" :min="0" step="0.5" />
        </el-form-item>
        <el-form-item label="人力单小时成本(元)" prop="labor_hourly_rate">
          <el-input-number v-model="form.labor_hourly_rate" :min="0" step="0.5" />
        </el-form-item>
        <el-form-item label="公共分摊率(%)" prop="overhead_rate">
          <el-input-number v-model="form.overhead_rate" :min="0" :max="100" step="0.1" />
        </el-form-item>
        <el-form-item label="水电费率(%)" prop="utility_rate">
          <el-input-number v-model="form.utility_rate" :min="0" :max="100" step="0.1" />
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
import { costBaselineApi, type CostBaseline } from '../api'

const tableData = ref<CostBaseline[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref<CostBaseline>({
  year: new Date().getFullYear(),
  machine_hourly_rate: 0,
  labor_hourly_rate: 0,
  overhead_rate: 0,
  utility_rate: 0
})

const loadData = async () => {
  const res = await costBaselineApi.getAll()
  tableData.value = res.data
}

const openDialog = () => {
  isEdit.value = false
  form.value = {
    year: new Date().getFullYear(),
    machine_hourly_rate: 0,
    labor_hourly_rate: 0,
    overhead_rate: 0,
    utility_rate: 0
  }
  dialogVisible.value = true
}

const editRow = (row: CostBaseline) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const deleteRow = async (row: CostBaseline) => {
  try {
    await costBaselineApi.delete(row.year)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '删除失败')
  }
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await costBaselineApi.update(form.value.year, form.value)
      ElMessage.success('更新成功')
    } else {
      await costBaselineApi.create(form.value)
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
