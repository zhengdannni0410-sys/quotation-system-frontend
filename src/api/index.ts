import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export interface CostBaseline {
  id?: number
  year: number
  machine_hourly_rate: number
  labor_hourly_rate: number
  overhead_rate: number
  utility_rate: number
  created_at?: string
  updated_at?: string
}

export interface WorkProcess {
  id: number
  name: string
  description: string
  machine_required: number
  is_active: number
  created_at?: string
  updated_at?: string
}

export interface QuotationDetail {
  id?: number
  quotation_id?: number
  work_process_id: number
  work_process_name: string
  machine_hours: number
  labor_hours: number
  labor_count: number
  machine_cost?: number
  labor_cost?: number
}

export interface Quotation {
  id?: number
  code?: string
  title: string
  customer_name?: string
  cost_baseline_year: number
  total_machine_cost?: number
  total_labor_cost?: number
  total_overhead?: number
  total_utility?: number
  total_cost?: number
  markup_rate?: number
  price_after_markup?: number
  final_price?: number
  status: string
  engineer_id?: number
  engineer_name?: string
  finance_reviewer_id?: number
  finance_reviewer_name?: string
  sales_reviewer_id?: number
  sales_reviewer_name?: string
  business_manager_id?: number
  business_manager_name?: string
  finance_manager_id?: number
  finance_manager_name?: string
  created_at?: string
  updated_at?: string
  details?: QuotationDetail[]
  approvalRecords?: ApprovalRecord[]
}

export interface ApprovalRecord {
  id?: number
  quotation_id: number
  approver_id?: number
  approver_name: string
  role: string
  action: string
  remark?: string
  created_at?: string
}

export const costBaselineApi = {
  getAll: () => api.get<CostBaseline[]>('/cost-baseline'),
  getByYear: (year: number) => api.get<CostBaseline>(`/cost-baseline/${year}`),
  create: (data: CostBaseline) => api.post<CostBaseline>('/cost-baseline', data),
  update: (year: number, data: Partial<CostBaseline>) => api.put<CostBaseline>(`/cost-baseline/${year}`, data),
  delete: (year: number) => api.delete(`/cost-baseline/${year}`)
}

export const workProcessApi = {
  getAll: (params?: { isActive?: number }) => api.get<WorkProcess[]>('/work-process', { params }),
  getById: (id: number) => api.get<WorkProcess>(`/work-process/${id}`),
  create: (data: Omit<WorkProcess, 'id' | 'created_at' | 'updated_at'>) => api.post<WorkProcess>('/work-process', data),
  update: (id: number, data: Partial<WorkProcess>) => api.put<WorkProcess>(`/work-process/${id}`, data),
  delete: (id: number) => api.delete(`/work-process/${id}`)
}

export const quotationApi = {
  getAll: (params?: { status?: string; keyword?: string }) => api.get<Quotation[]>('/quotation', { params }),
  getById: (id: number) => api.get<Quotation>(`/quotation/${id}`),
  create: (data: Omit<Quotation, 'id' | 'code' | 'created_at' | 'updated_at'>) => api.post<Quotation>('/quotation', data),
  update: (id: number, data: Partial<Quotation>) => api.put<Quotation>(`/quotation/${id}`, data),
  delete: (id: number) => api.delete(`/quotation/${id}`),
  submit: (id: number) => api.post(`/quotation/${id}/submit`)
}

export const approvalApi = {
  finance: (id: number, data: { action: string; markup_rate?: number; approver_id?: number; approver_name?: string; remark?: string }) =>
    api.post(`/approval/${id}/finance`, data),
  sales: (id: number, data: { action: string; final_price?: number; approver_id?: number; approver_name?: string; remark?: string }) =>
    api.post(`/approval/${id}/sales`, data),
  businessManager: (id: number, data: { action: string; approver_id?: number; approver_name?: string; remark?: string }) =>
    api.post(`/approval/${id}/business-manager`, data),
  financeManager: (id: number, data: { action: string; approver_id?: number; approver_name?: string; remark?: string }) =>
    api.post(`/approval/${id}/finance-manager`, data)
}

export default api
