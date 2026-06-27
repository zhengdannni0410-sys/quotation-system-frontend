<template>
  <div>
    <el-card>
      <template #header>
        <span>创建报价单</span>
      </template>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报价标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入报价标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customer_name">
              <el-input v-model="form.customer_name" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="成本基线年度" prop="cost_baseline_year">
              <el-select v-model="form.cost_baseline_year" placeholder="请选择年度">
                <el-option v-for="year in availableYears" :key="year" :label="`${year}年`" :value="year" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工程师" prop="engineer_name">
              <el-input v-model="form.engineer_name" placeholder="请输入工程师姓名" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div style="margin-top: 20px">
        <el-button type="primary" @click="addWorkProcess">添加工作环节</el-button>
      </div>

      <el-table :data="form.details" style="width: 100%; margin-top: 20px">
        <el-table-column prop="work_process_name" label="工作环节" width="150">
          <template #default="scope">
            <el-select v-model="scope.row.work_process_name" @change="onProcessChange(scope.row)" placeholder="请选择工作环节">
              <el-option v-for="process in workProcesses" :key="process.id" :label="process.name" :value="process.name" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="机器工时(小时)" width="150">
          <template #default="scope">
            <el-input-number v-model="scope.row.machine_hours" :min="0" step="0.5" @change="calculateCost" />
          </template>
        </el-table-column>
        <el-table-column label="人工工时(小时)" width="150">
          <template #default="scope">
            <el-input-number v-model="scope.row.labor_hours" :min="0" step="0.5" @change="calculateCost" />
          </template>
        </el-table-column>
        <el-table-column label="人数" width="100">
          <template #default="scope">
            <el-input-number v-model="scope.row.labor_count" :min="1" :max="100" @change="calculateCost" />
          </template>
        </el-table-column>
        <el-table-column label="机器成本" width="120">
          <template #default="scope">
            {{ scope.row.machine_cost?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="人工成本" width="120">
          <template #default="scope">
            {{ scope.row.labor_cost?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button size="small" type="danger" @click="removeWorkProcess(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-divider />

      <el-card style="margin-top: 20px">
        <template #header>
          <span>成本核算</span>
        </template>
        <el-row :gutter="20" style="margin-bottom: 10px">
          <el-col :span="6">
            <el-descriptions-item label="机器成本合计">
              <span style="font-weight: bold; color: #333">{{ totalMachineCost.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="人工成本合计">
              <span style="font-weight: bold; color: #333">{{ totalLaborCost.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="公共分摊">
              <span style="font-weight: bold; color: #333">{{ totalOverhead.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="水电费">
              <span style="font-weight: bold; color: #333">{{ totalUtility.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row>
          <el-col :span="24" style="text-align: right">
            <span style="font-size: 18px; font-weight: bold; color: #e6a23c">
              完全成本：{{ totalCost.toFixed(2) }} 元
            </span>
          </el-col>
        </el-row>
      </el-card>

      <div style="margin-top: 20px; text-align: right">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="saveDraft">保存草稿</el-button>
        <el-button type="success" @click="submitQuotation">提交审核</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { costBaselineApi, workProcessApi, quotationApi, type CostBaseline, type WorkProcess, type QuotationDetail } from '../api'

const form = ref({
  title: '',
  customer_name: '',
  cost_baseline_year: new Date().getFullYear(),
  engineer_name: '',
  details: [] as QuotationDetail[]
})

const costBaselines = ref<CostBaseline[]>([])
const workProcesses = ref<WorkProcess[]>([])

const availableYears = computed(() => costBaselines.value.map(c => c.year))

const currentBaseline = computed(() => {
  return costBaselines.value.find(c => c.year === form.value.cost_baseline_year)
})

const totalMachineCost = computed(() => {
  return form.value.details.reduce((sum, d) => sum + (d.machine_cost || 0), 0)
})

const totalLaborCost = computed(() => {
  return form.value.details.reduce((sum, d) => sum + (d.labor_cost || 0), 0)
})

const totalOverhead = computed(() => {
  if (!currentBaseline.value) return 0
  return totalLaborCost.value * (currentBaseline.value.overhead_rate / 100)
})

const totalUtility = computed(() => {
  if (!currentBaseline.value) return 0
  return totalMachineCost.value * (currentBaseline.value.utility_rate / 100)
})

const totalCost = computed(() => {
  return totalMachineCost.value + totalLaborCost.value + totalOverhead.value + totalUtility.value
})

const loadData = async () => {
  const [baselineRes, processRes] = await Promise.all([
    costBaselineApi.getAll(),
    workProcessApi.getAll({ isActive: 1 })
  ])
  costBaselines.value = baselineRes.data
  workProcesses.value = processRes.data
}

const addWorkProcess = () => {
  form.value.details.push({
    work_process_id: 0,
    work_process_name: '',
    machine_hours: 0,
    labor_hours: 0,
    labor_count: 1,
    machine_cost: 0,
    labor_cost: 0
  })
}

const removeWorkProcess = (index: number) => {
  form.value.details.splice(index, 1)
}

const onProcessChange = (detail: QuotationDetail) => {
  const process = workProcesses.value.find(p => p.name === detail.work_process_name)
  if (process) {
    detail.work_process_id = process.id
    if (!process.machine_required) {
      detail.machine_hours = 0
    }
    calculateCost()
  }
}

const calculateCost = () => {
  if (!currentBaseline.value) return
  
  form.value.details.forEach(detail => {
    detail.machine_cost = detail.machine_hours * currentBaseline.value!.machine_hourly_rate
    detail.labor_cost = detail.labor_hours * detail.labor_count * currentBaseline.value!.labor_hourly_rate
  })
}

const resetForm = () => {
  form.value = {
    title: '',
    customer_name: '',
    cost_baseline_year: new Date().getFullYear(),
    engineer_name: '',
    details: []
  }
}

const saveDraft = async () => {
  if (!form.value.title || form.value.details.length === 0) {
    ElMessage.warning('请填写报价标题并至少添加一个工作环节')
    return
  }
  
  try {
    await quotationApi.create({
      ...form.value,
      status: 'draft'
    })
    ElMessage.success('保存成功')
    resetForm()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '保存失败')
  }
}

const submitQuotation = async () => {
  if (!form.value.title || form.value.details.length === 0) {
    ElMessage.warning('请填写报价标题并至少添加一个工作环节')
    return
  }
  
  try {
    const res = await quotationApi.create({
      ...form.value,
      status: 'draft'
    })
    await quotationApi.submit(res.data.id!)
    ElMessage.success('提交成功，等待财务审核')
    resetForm()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '提交失败')
  }
}

onMounted(loadData)
</script>
