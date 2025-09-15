<template>
  <workflow ref="workflowRef" :data="list" @click-node="clickNode"></workflow>
  <drawerInitiator ref="drawerInitiatorRef" @confirm="initiatorConfirm"></drawerInitiator>
  <drawerCondition ref="drawerConditionRef" @confirm="conditionConfirm"></drawerCondition>
  <drawerApprover ref="drawerApproverRef" @confirm="approverConfirm"></drawerApprover>
  <drawerCcTo ref="drawerCcToRef" @confirm="ccToConfirm"></drawerCcTo>
</template>
<script setup>
import drawerInitiator from './components/drawerInitiator.vue'
import drawerCondition from './components/drawerCondition.vue'
import drawerApprover from './components/drawerApprover.vue'
import drawerCcTo from './components/drawerCcTo.vue'
import workflow from './workflow.vue'
import {ref} from "vue";

const drawerInitiatorRef = ref(null)
const drawerConditionRef = ref(null)
const drawerApproverRef = ref(null)
const drawerCcToRef = ref(null)
const workflowRef = ref(null)
const lowCodeFormRef = ref(null)
const formRef = ref(null)
const list = ref(
    []
)
const currentList = ref([])

let currentVal = null
let valueMap = {}

function setValue(val) {
  return {
    radio: val.assigneeType,
    value: {
      data: val.data ? [...val.data] : val.data
    }
  }
}

function clickNode(val, i, arr) {
  currentVal = val
  currentList.value = arr
  if (val.type === 'start') {
    drawerInitiatorRef.value.openDrawer(setValue(val))
    return;
  }

  if (val.type === "approver") {
    drawerApproverRef.value.openDrawer(setValue(val))
    return
  }

  if (val.type === "ccTo") {
    drawerCcToRef.value.openDrawer(setValue(val))
    return;
  }

  if (val.type === 'condition') {
    drawerConditionRef.value.openDrawer(val.conditionExpr)
  }
}

function commonConfirm(val) {
  valueMap[currentVal.id] = val
  if (val.value.data) {
    currentVal.tip = `（${val.value.label}）`
    currentVal.content = val.value.data.map(item => item.name || item.roleName || item).join('，')
    currentVal.assigneeType = val.radio
    if (currentVal.type === 'start' && val.radio === 0 || currentVal.type === 'approver' && val.radio === 2) {
      currentVal.data = null
    } else {
      currentVal.data = val.value.data
    }
  }
}

/**
 * 发起人
 **/
function initiatorConfirm(val) {
  commonConfirm(val)
}

/**
 * 审批人
 **/
function approverConfirm(val) {
  commonConfirm(val)
}

/**
 * 抄送人
 **/
function ccToConfirm(val) {
  valueMap[currentVal.id] = val
  if (val.value.data) {
    currentVal.tip = `（${val.value.label}）`
    currentVal.content = Array.isArray(val.value.data) ? val.value.data.map(item => item.name).join('，') : val.value.data.roleName
    currentVal.data = val.value.data
    currentVal.assigneeType = 0
  }
}

/**
 * 条件
 **/
function conditionConfirm(val) {
  let arr = []
  val.value.forEach((item) => {
    arr.push(item.label)
  })
  currentVal.content = arr.join('，')
  currentVal.conditionExpr = val
}
</script>
<style scoped lang="scss">

</style>
