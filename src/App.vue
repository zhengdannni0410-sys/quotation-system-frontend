<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background-color: #304156">
      <div class="logo" style="color: #fff; font-size: 20px; padding: 20px; text-align: center; border-bottom: 1px solid #405060">
        试制报价系统
      </div>
      <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" style="height: calc(100% - 60px); border-right: none; color: #fff">
        <el-menu-item index="/">
          <el-icon><Document /></el-icon>
          <span>报价单列表</span>
        </el-menu-item>
        <el-menu-item index="/create-quotation">
          <el-icon><Plus /></el-icon>
          <span>创建报价单</span>
        </el-menu-item>
        <el-menu-item index="/cost-baseline">
          <el-icon><Wallet /></el-icon>
          <span>成本基线管理</span>
        </el-menu-item>
        <el-menu-item index="/work-process">
          <el-icon><Setting /></el-icon>
          <span>工作环节管理</span>
        </el-menu-item>
        <el-menu-item index="/approval">
          <el-icon><CheckCircle /></el-icon>
          <span>审批流程</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background-color: #fff; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: space-between">
        <div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <el-select v-model="currentRole" placeholder="选择角色" style="width: 120px">
            <el-option label="工程师" value="engineer" />
            <el-option label="财务" value="finance" />
            <el-option label="销售" value="sales" />
            <el-option label="业务主管" value="business_manager" />
            <el-option label="财务主管" value="finance_manager" />
          </el-select>
          <span>{{ currentRoleName }}</span>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Plus, Wallet, Setting, CheckCircle } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

const pageNames: Record<string, string> = {
  '/': '报价单列表',
  '/create-quotation': '创建报价单',
  '/cost-baseline': '成本基线管理',
  '/work-process': '工作环节管理',
  '/approval': '审批流程'
}

const currentPageName = computed(() => pageNames[route.path] || '')

const currentRole = computed({
  get: () => {
    return localStorage.getItem('currentRole') || 'engineer'
  },
  set: (val: string) => {
    localStorage.setItem('currentRole', val)
  }
})

const roleNames: Record<string, string> = {
  engineer: '工程师',
  finance: '财务',
  sales: '销售',
  business_manager: '业务主管',
  finance_manager: '财务主管'
}

const currentRoleName = computed(() => roleNames[currentRole.value] || '')
</script>

<style scoped>
.el-menu-vertical-demo {
  color: #fff;
}
</style>
