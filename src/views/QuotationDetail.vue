<template>
  <div>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <span style="font-size: 18px; font-weight: bold">{{ quotation.code }} - {{ quotation.title }}</span>
            <el-tag :type="getStatusTagType(quotation.status)" style="margin-left: 10px">
              {{ getStatusText(quotation.status) }}
            </el-tag>
          </div>
          <el-button @click="$router.back()">返回列表</el-button>
        </div>
      </template>

      <el-descriptions :column="4" border style="margin-bottom: 20px">
        <el-descriptions-item label="客户名称">{{ quotation.customer_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="成本基线年度">{{ quotation.cost_baseline_year }}年</el-descriptions-item>
        <el-descriptions-item label="工程师">{{ quotation.engineer_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ quotation.created_at || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">工作环节明细</el-divider>
      <el-table :data="quotation.details" style="width: 100%; margin-bottom: 20px">
        <el-table-column prop="work_process_name" label="工作环节" width="150" />
        <el-table-column prop="machine_hours" label="机器工时(小时)" width="150" />
        <el-table-column prop="labor_hours" label="人工工时(小时)" width="150" />
        <el-table-column prop="labor_count" label="人数" width="100" />
        <el-table-column prop="machine_cost" label="机器成本" width="120">
          <template #default="scope">{{ (scope.row.machine_cost || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="labor_cost" label="人工成本" width="120">
          <template #default="scope">{{ (scope.row.labor_cost || 0).toFixed(2) }}</template>
        </el-table-column>
      </el-table>

      <el-divider content-position="left">成本核算</el-divider>
      <el-card style="margin-bottom: 20px">
        <el-row :gutter="20" style="margin-bottom: 10px">
          <el-col :span="6">
            <el-descriptions-item label="机器成本合计">
              <span style="font-weight: bold">{{ (quotation.total_machine_cost || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="人工成本合计">
              <span style="font-weight: bold">{{ (quotation.total_labor_cost || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="公共分摊">
              <span style="font-weight: bold">{{ (quotation.total_overhead || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="水电费">
              <span style="font-weight: bold">{{ (quotation.total_utility || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="6">
            <el-descriptions-item label="完全成本">
              <span style="font-weight: bold; color: #e6a23c; font-size: 16px">{{ (quotation.total_cost || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="加成率">
              <span style="font-weight: bold">{{ (quotation.markup_rate || 0) }}%</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="加成后价格">
              <span style="font-weight: bold">{{ (quotation.price_after_markup || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
          <el-col :span="6">
            <el-descriptions-item label="最终定价">
              <span style="font-weight: bold; color: #409eff; font-size: 16px">{{ (quotation.final_price || 0).toFixed(2) }}</span>
            </el-descriptions-item>
          </el-col>
        </el-row>
      </el-card>

      <el-divider content-position="left">审批记录</el-divider>
      <el-timeline>
        <el-timeline-item
          v-for="record in quotation.approvalRecords"
          :key="record.id"
          :type="record.action === 'approve' ? 'success' : 'danger'"
          :timestamp="record.created_at"
        >
          <div>
            <span style="font-weight: bold">{{ getRoleName(record.role) }} - {{ record.approver_name }}</span>
            <span :style="{ color: record.action === 'approve' ? '#67c23a' : '#f56c6c', marginLeft: '10px' }">
              {{ record.action === 'approve' ? '通过' : '驳回' }}
            </span>
            <div v-if="record.remark" style="margin-top: 5px; color: #999">备注: {{ record.remark }}</div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { quotationApi, type Quotation } from '../api'

const route = useRoute()
const quotation = ref<Quotation>({
  title: '',
  cost_baseline_year: new Date().getFullYear(),
  status: 'draft',
  details: [],
  approvalRecords: []
})

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending_finance: '待财务审核',
    pending_sales: '待销售审核',
    pending_business_manager: '待业务主管审核',
    pending_finance_manager: '待财务主管审核',
    approved: '已敲定'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    pending_finance: 'warning',
    pending_sales: 'warning',
    pending_business_manager: 'warning',
    pending_finance_manager: 'warning',
    approved: 'success'
  }
  return typeMap[status] || 'info'
}

const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    finance: '财务',
    sales: '销售',
    business_manager: '业务主管',
    finance_manager: '财务主管'
  }
  return roleMap[role] || role
}

const loadData = async () => {
  const res = await quotationApi.getById(Number(route.params.id))
  quotation.value = res.data
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
