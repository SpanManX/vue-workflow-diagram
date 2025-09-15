<template>
  <div ref="boxRef" class="workflow-box">
    <div class="zoom-wrapper">
      <span class="zoom-out" @click="zoomOut">─</span>
      <span class="num">{{ num }}%</span>
      <span class="zoom-in" @click="zoomIn">＋</span>
      <span class="zoom-reset" @click="zoomReset">重置</span>
      <span class="zoom-reset" @click="getData">获取数据</span>
    </div>
    <div ref="contentRef" class="workflow-content-wrapper">
      <workflowNodes :list="list"
                     :parentData="list" @click-node="clickNode"></workflowNodes>
      <div class="end">
        <br/>
        流程结束
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, onUnmounted, ref, watch} from "vue";
import workflowNodes from "./components/workflowNodes.vue";
import {resetImage, wheelZoomFunc, zoomInit} from "./utils/zoom.js";
import {
  clearNodesMap,
  generateRandomId,
  getNodesMap,
  setNodesMap
} from "./utils/handleNodes.js";
import {startOptions} from "./utils/dictionary.js";

defineExpose({
  getData
})

const props = defineProps({
  data: Array,
})

const emit = defineEmits(['clickNode'])

const list = ref(
    // Array.from(getNodesMap1().keys())
    // Object.keys(getNodesMap())
)
const boxRef = ref(null)
const contentRef = ref(null)
const num = ref(100)

watch(() => props.data, (val) => {
  if (val && val.length) {
    props.data.forEach(item => {
      setNodesMap(item)
      if (item.type === 'condition' && !item.conditionExpr) {
        item.content = '其他条件进入此流程'
      }
    })
    list.value = [props.data[0].id]
  } else {
    const obj = {
      title: '发起人',
      placeholder: '请选择发起人',
      content: '所有人',
      type: 'start',
      tip: `（${startOptions[0]}）`,
      assigneeType: 0,
      id: generateRandomId(),
      to: []
    }
    setNodesMap(obj)
    list.value = [obj.id]
  }
}, {immediate: true})

onMounted(() => {
  zoomInit(boxRef, contentRef, {
    cb: (val) => {
      num.value = val
    }
  })
})

function zoomReset() {
  resetImage()
}

function zoomIn() {
  wheelZoomFunc({scaleFactor: num.value / 100 + 0.1, isExternalCall: true})
}

function zoomOut() {
  wheelZoomFunc({scaleFactor: num.value / 100 - 0.1, isExternalCall: true})
}

function clickNode(val, i, list) {
  emit('clickNode', val, i, list)
}

function getData() {
  console.log(JSON.stringify(Array.from(getNodesMap().values())))
  console.log(getNodesMap())
  return getNodesMap()
}

onUnmounted(() => {
  list.value = []
  clearNodesMap()
  zoomReset()
})
</script>
<style lang="scss">
html, body, #vue-workflow-diagram {
  margin: 0;
  height: 100%;
}

.workflow-box {
  height: 100%;
  //overflow: auto;
  overflow: hidden;
  //text-align: center;
  position: relative;
  //padding: 20px;
  box-sizing: border-box;

  .zoom-wrapper {
    position: absolute;
    right: 20px;
    z-index: 100;
    user-select: none;

    .zoom-reset {
      color: #8c939d;
      cursor: pointer;
      margin-right: 15px;
    }

    .zoom-out, .zoom-in {
      display: inline-block;
      cursor: pointer;
      color: #8c939d;
      font-weight: bolder;
      padding: 0 15px;
    }
  }
}

.workflow-content-wrapper {
  user-select: none;
  height: 100%;
  width: 100%; // 如果要使用滚动条，则去掉此行
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  white-space: nowrap;
}

.end {
  text-align: center;
  color: #8c939d;

  &:before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #cccccc;
  }
}

.num {
  color: #8c939d;
}
</style>
