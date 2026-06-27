<template>
  <div>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>报价单列表</span>
          <el-button type="primary" @click="$router.push('/create-quotation')">创建报价单</el-button>
        </div>
      </template>
      <div style="margin-bottom: 20px">
        <el-input v-model="keyword" placeholder="搜索报价单号、标题或客户名称" style="width: 300px; margin-right: 10px" />
        <el-select v-model="statusFilter" placeholder="状态筛选">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="待财务审核" value="pending_finance" />
          <el-option label="待销售审核" value="pending_sales" />
          <el-option label="待业务主管审核" value="pending_business_manager" />
          <el-option label="待财务主管审核" value="pending_finance_manager" />
          <el-option label="已敲定" value="approved" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="code" label="报价单号" width="150" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="total_cost" label="完全成本" width="120">
          <template #default="scope">
            {{ scope.row.total_cost?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="final_price" label="最终定价" width="120">
          <template #default="scope">
            {{ scope.row.final_price?.toFixed(2) || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="engineer_name" label="工程师" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <el-button v-if="scope.row.status === 'draft'" size="small" @click="editQuotation(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status === 'draft'" size="small" type="danger" @click="deleteQuotation(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { quotationApi, type Quotation } from '../api'

const router = useRouter()
const tableData = ref<Quotation[]>([])
const keyword = ref('')
const statusFilter = ref('')

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

const loadData = async () => {
  const params: { status?: string; keyword?: string } = {}
  if (statusFilter.value) params.status = statusFilter.value
  if (keyword.value) params.keyword = keyword.value
  
  const res = await quotationApi.getAll(params)
  tableData.value = res.data
}

const viewDetail = (row: Quotation) => {
  router.push(`/quotation/${row.id}`)
}

const editQuotation = (row: Quotation) => {
  router.push(`/create-quotation?id=${row.id}`)
}

const deleteQuotation = async (row: Quotation) => {
  try {
    await quotationApi.delete(row.id!)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '删除失败')
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
