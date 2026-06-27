<template>
  <div>
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>审批流程</span>
          <el-select v-model="currentRoleFilter" placeholder="选择角色查看">
            <el-option label="全部" value="" />
            <el-option label="财务审核" value="finance" />
            <el-option label="销售审核" value="sales" />
            <el-option label="业务主管审核" value="business_manager" />
            <el-option label="财务主管审核" value="finance_manager" />
          </el-select>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="code" label="报价单号" width="150" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="total_cost" label="完全成本" width="120">
          <template #default="scope">{{ (scope.row.total_cost || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="price_after_markup" label="加成后价格" width="120">
          <template #default="scope">{{ (scope.row.price_after_markup || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="final_price" label="最终定价" width="120">
          <template #default="scope">{{ (scope.row.final_price || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="当前状态" width="150">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="engineer_name" label="工程师" width="100" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            <el-button v-if="canApprove(scope.row)" size="small" type="primary" @click="openApprovalDialog(scope.row)">审批</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="`审批 - ${currentQuotation?.code}`" width="600px">
      <el-form :model="approvalForm" label-width="100px">
        <el-form-item label="审核动作" prop="action">
          <el-radio-group v-model="approvalForm.action">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="approvalForm.action === 'approve' && currentApprovalRole === 'finance'" label="加成率(%)" prop="markup_rate">
          <el-input-number v-model="approvalForm.markup_rate" :min="0" :max="100" step="0.5" />
        </el-form-item>
        <el-form-item v-if="approvalForm.action === 'approve' && currentApprovalRole === 'sales'" label="最终定价" prop="final_price">
          <el-input-number v-model="approvalForm.final_price" :min="0" step="0.01" />
        </el-form-item>
        <el-form-item label="审核人" prop="approver_name">
          <el-input v-model="approvalForm.approver_name" placeholder="请输入审核人姓名" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="approvalForm.remark" type="textarea" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { quotationApi, approvalApi, type Quotation } from '../api'

const router = useRouter()
const tableData = ref<Quotation[]>([])
const dialogVisible = ref(false)
const currentQuotation = ref<Quotation | null>(null)
const currentApprovalRole = ref('')
const currentRoleFilter = ref('')

const approvalForm = ref({
  action: 'approve',
  markup_rate: 10,
  final_price: 0,
  approver_name: '',
  remark: ''
})

const currentRole = computed(() => {
  return localStorage.getItem('currentRole') || 'engineer'
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

const roleToStatus: Record<string, string> = {
  finance: 'pending_finance',
  sales: 'pending_sales',
  business_manager: 'pending_business_manager',
  finance_manager: 'pending_finance_manager'
}

const canApprove = (row: Quotation) => {
  const filter = currentRoleFilter.value || currentRole.value
  return row.status === roleToStatus[filter]
}

const loadData = async () => {
  const filter = currentRoleFilter.value || currentRole.value
  const status = roleToStatus[filter]
  
  if (!status) {
    tableData.value = []
    return
  }
  
  const res = await quotationApi.getAll({ status })
  tableData.value = res.data
}

const viewDetail = (row: Quotation) => {
  router.push(`/quotation/${row.id}`)
}

const openApprovalDialog = (row: Quotation) => {
  currentQuotation.value = row
  currentApprovalRole.value = currentRoleFilter.value || currentRole.value
  approvalForm.value = {
    action: 'approve',
    markup_rate: 10,
    final_price: row.price_after_markup || 0,
    approver_name: '',
    remark: ''
  }
  dialogVisible.value = true
}

const submitApproval = async () => {
  if (!currentQuotation.value || !approvalForm.value.approver_name) {
    ElMessage.warning('请填写审核人姓名')
    return
  }
  
  try {
    const role = currentApprovalRole.value
    
    if (role === 'finance') {
      if (approvalForm.value.action === 'approve' && (!approvalForm.value.markup_rate && approvalForm.value.markup_rate !== 0)) {
        ElMessage.warning('请输入加成率')
        return
      }
      await approvalApi.finance(currentQuotation.value.id!, {
        action: approvalForm.value.action,
        markup_rate: approvalForm.value.action === 'approve' ? approvalForm.value.markup_rate : undefined,
        approver_name: approvalForm.value.approver_name,
        remark: approvalForm.value.remark
      })
    } else if (role === 'sales') {
      if (approvalForm.value.action === 'approve' && (!approvalForm.value.final_price || approvalForm.value.final_price <= 0)) {
        ElMessage.warning('请输入最终定价')
        return
      }
      await approvalApi.sales(currentQuotation.value.id!, {
        action: approvalForm.value.action,
        final_price: approvalForm.value.action === 'approve' ? approvalForm.value.final_price : undefined,
        approver_name: approvalForm.value.approver_name,
        remark: approvalForm.value.remark
      })
    } else if (role === 'business_manager') {
      await approvalApi.businessManager(currentQuotation.value.id!, {
        action: approvalForm.value.action,
        approver_name: approvalForm.value.approver_name,
        remark: approvalForm.value.remark
      })
    } else if (role === 'finance_manager') {
      await approvalApi.financeManager(currentQuotation.value.id!, {
        action: approvalForm.value.action,
        approver_name: approvalForm.value.approver_name,
        remark: approvalForm.value.remark
      })
    }
    
    ElMessage.success('审核成功')
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '审核失败')
  }
}

watch(currentRoleFilter, loadData)

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
