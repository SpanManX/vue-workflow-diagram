<template>
  <workflow :data="list" @click-node="clickNode"></workflow>
  <drawerInitiator ref="drawerInitiatorRef" @change="change" @confirm="confirm"></drawerInitiator>
  <drawerCondition ref="drawerConditionRef" @change="change" @confirm="confirm"></drawerCondition>
</template>
<script setup>
import drawerInitiator from './components/drawerInitiator.vue'
import drawerCondition from './components/drawerCondition.vue'
import workflow from './workflow.vue'
import {ref} from "vue";

const drawerInitiatorRef = ref(null)
const drawerConditionRef = ref(null)
const list = ref(
    []
)
const currentVal = ref(null)
const currentList = ref([])

function clickNode(val, i, list) {
  currentVal.value = val
  currentList.value = list
  if (val.type === 'start') {
    drawerInitiatorRef.value.openDrawer()
  } else if (val.type === 'condition') {
    drawerConditionRef.value.openDrawer(val.data)
  }
}

function change(val) {
  // console.log(val)
}

function confirm(val) {
  if (val.value) {
    let arr = []
    val.value.forEach((item) => {
      arr.push(item.label)
    })
    currentVal.value.content = arr.join('，')
  }

  // 最后一个条件设置为“其他条件进入此流程”，并且去掉placeholder
  if (currentVal.value.type === 'condition' && currentVal.value.last && currentVal.value.content === '') {
    currentVal.value.content = '其他条件进入此流程'
    currentVal.value.placeholder = ''
  }

  currentVal.value.data = val
  console.log(currentVal.value)
}
</script>
<style scoped lang="scss">

</style>
