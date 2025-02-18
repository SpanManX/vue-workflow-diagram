<template>
  <div class="workflow-box" ref="boxRef">
    <div class="zoom-wrapper">
      <span class="zoom-out" @click="zoomOut">─</span>
      <span class="num">{{ num }}%</span>
      <span class="zoom-in" @click="zoomIn">＋</span>
      <span class="zoom-reset" @click="zoomReset">重置</span>
      <span class="zoom-reset" @click="getData">获取数据</span>
    </div>
    <div class="workflow-content-wrapper" ref="contentRef">
      <workflowNodes :list="[list]"
                     :parentData="list" @click-node="clickNode"></workflowNodes>
      <div class="end">
        <br/>
        流程结束
      </div>
    </div>
  </div>
</template>
<script setup>
import {onMounted, ref} from "vue";
import workflowNodes from "./components/workflowNodes.vue";
import {resetImage, wheelZoomFunc, zoomInit} from "./utils/zoom.js";

const props = defineProps({
  data: Array,
})

const emit = defineEmits(['clickNode'])

let list = ref(
    [
      {
        title: '发起人',
        placeholder: '请选择发起人',
        content: '所有人',
        type: 'start',
        id: 0
      }
    ]
)

let boxRef = ref(null)
let contentRef = ref(null)
let num = ref(100)

onMounted(() => {
  if (props.data && props.data.length) {
    list.value.push(props.data)
  }
  zoomInit(boxRef, contentRef, (val) => {
    num.value = val
  })
})

function zoomReset() {
  num.value = 100
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
  console.log(list.value)

  let num = list.value.findIndex(item => item.type === 'approver')
  let str = ''
  if (num !== -1) {
    str = '流程开始或流程结束阶段，须配置至少一个审批人节点'
  }

  // return num !== -1
}
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
  text-align: center;
  position: relative;
  padding: 20px;
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
