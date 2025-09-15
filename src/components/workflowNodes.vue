<template>
  <span class="but" @click="addCondition(list)" v-if="judgeBranch()">添加条件分支</span>
  <div class="workflow-content-nodes"
       :style="{flex:list.length === 1 ? nodesMap.get(list[0]).type === 'start' ? '' : 1 : ''}">
    <div class="workflow-node" v-for="(val,i) in list"
         :class="{'node-border':list.length > 1}">
      <div class="workflow-item" :class="nodesMap.get(val).type" v-if="nodesMap.get(val).title">
        <div>
          <div class="title"
               :class="{'default':nodesMap.get(val).type === 'start','indigo':nodesMap.get(val).type === 'ccTo',yellow:nodesMap.get(val).type === 'approver',purple:nodesMap.get(val).type === 'condition'}">
            {{ nodesMap.get(val).title }}{{ nodesMap.get(val).tip }}
            <span class="priority" v-if="nodesMap.get(val).type === 'condition'">
              {{ setPriorityLevel(nodesMap.get(val), i) }}
            </span>
            <!--删除-->
            <span class="close" @click="removeNode(list,index,i,parentData,nodesMap.get(val))"
                  v-if="nodesMap.get(val).type !== 'start'">×</span>
          </div>
          <div class="content" @click="clickNode(nodesMap.get(val),i,`优先级${i + 1}`)">
              <span class="left-arrow" v-if="i && nodesMap.get(val).type === 'condition'"
                    @click.stop="moveToLeft(list,i)">⇦</span>
            <span class="text" v-if="nodesMap.get(val).content && nodesMap.get(val).content !== ''">
              {{ nodesMap.get(val).content }}
            </span>
            <span class="placeholder" v-else>{{ nodesMap.get(val).placeholder }}</span>
            <span class="right-arrow" v-if="nodesMap.get(val).type === 'condition' && i !== list.length - 1"
                  @click.stop="moveToRight(list,i)">⇨</span>
          </div>
        </div>
      </div>
      <div class="add-box"
           :class="{'last-add-box':!nodesMap.get(val).to[0] || !nodesMap.get(val).to[0].length, 'short-add-box':list[i] && nodesMap.get(list[i]).to}"
           v-if="nodesMap.get(val).title || (nodesMap.get(val).to && nodesMap.get(val).to.length)">
        <tools @addApprover="addApprover(nodesMap.get(val),index)" @addCcTo="addCcTo(nodesMap.get(val),index)"
               @add="add(nodesMap.get(val))"></tools>
      </div>
      <template v-if="nodesMap.get(val).to && nodesMap.get(val).to.length">
        <workflowNodes v-for="(child, ci) in nodesMap.get(val).to"
                       :list="child"
                       :index="ci"
                       :parent-data="nodesMap.get(val).to"
                       :parent-node="nodesMap.get(val)"
                       :id="nodesMap.get(val).id"
                       @click-node="clickNode"></workflowNodes>
      </template>
    </div>
  </div>
  <div class="workflow-bottom-nodes" :class="{'workflow-bottom-nodes-flex': parentData.length === 1}"
       v-if="typeof props.index !== 'undefined' && list.length > 1">
    <div class="add-box">
      <tools @addApprover="addApprover(parentNode,index,parentData,'last')"
             @addCcTo="addCcTo(parentNode,index,parentData,'last')"
             @add="add(parentNode,parentData,index)"></tools>
    </div>
  </div>
</template>
<script setup>
import tools from "./tools.vue";
import workflowNodes from "./workflowNodes.vue";
import {computed, nextTick} from "vue";
import {
  generateRandomId,
  getNodesMap,
  handleAdd,
  handleAddApprover,
  handleAddCcTo,
  setNodesMap,
  updateDepthRecursively
} from "../utils/handleNodes.js";

const props = defineProps({
  list: Array,
  index: Number,
  parentData: [Object, Array],
  id: String,
  parentNode: {
    type: Object,
    default: () => ({
      children: [],
    })
  }
})

const emit = defineEmits(['clickNode'])

const nodesMap = computed(() => getNodesMap())

function setPriorityLevel(val, i) {
  val.priorityLevel = i + 1
  return `（优先级${val.priorityLevel}）`
}

/**
 * 插入审批人
 */
function addApprover(val, i, parentData, key) {
  handleAddApprover(val, i, parentData, key)
}

/**
 * 插入抄送人
 */
function addCcTo(val, i, parentData, key) {
  handleAddCcTo(val, i, parentData, key)
}

/**
 * 添加条件分支
 *
 * @param val 需要操作的数组
 * @param parentData
 * @param i
 */
function add(val, parentData, i) {
  handleAdd(val, parentData, i)
}

function setPlaceholder(val) {
  for (let item of val) {
    const node = nodesMap.value.get(item)
    if (node.content === '其他条件进入此流程') {
      node.placeholder = '请设置条件'
      node.content = ''
    }
  }
}

function setContent(ids) {
  if (nodesMap.value.get(ids.at(-1)).placeholder === '请设置条件' && nodesMap.value.get(ids.at(-1)).content === '') {
    nodesMap.value.get(ids.at(-1)).content = '其他条件进入此流程'
    nodesMap.value.get(ids.at(-1)).placeholder = ''
  }
}

/**
 * 添加条件分支
 *
 * @param val 要添加条件的数组
 */
function addCondition(val) {
  setPlaceholder(val)
  const obj = {
    title: `条件`,
    content: '其他条件进入此流程',
    // placeholder: '其他条件进入此流程',
    type: 'condition',
    id: generateRandomId(),
    to: []
  }
  setNodesMap(obj)
  val.push(obj.id)
  updateDepthRecursively([Array.from(nodesMap.value.keys())[0]])
}

function moveToLeft(nodeList, i) {
  let temp = nodeList[i];
  nodeList[i] = nodeList[i - 1];
  nodeList[i - 1] = temp;

  setPlaceholder(nodeList)
  setContent(nodeList)
}

function moveToRight(nodeList, i) {
  let temp = nodeList[i];
  nodeList[i] = nodeList[i + 1];
  nodeList[i + 1] = temp;

  setPlaceholder(nodeList)
  setContent(nodeList)
}

// 递归删除子节点函数
const deleteChildren = (nodeIds) => {
  if (nodeIds.length) {
    nodeIds.forEach((childId) => {
      const node = nodesMap.value.get(childId);
      nodesMap.value.delete(childId);
      if (node && node.to.length) {
        deleteChildren(node.to.flat(Infinity)); // 递归删除子节点
      }
    });
  }
};

/**
 * 从图结构中删除指定节点
 *
 * @param nodeList 需要删除节点的列表
 * @param nodeIndex 节点索引（在props中的位置）
 * @param childIndex 子节点索引（在当前列表中的位置）
 * @param parentList 父级数据（当前列表的父级to数组）
 * @param currentNode 当前节点对象
 */
function removeNode(nodeList, nodeIndex, childIndex, parentList, currentNode) {
  // 如果是条件节点
  if (currentNode.type === 'condition') {
    const copyNode = JSON.parse(JSON.stringify(currentNode));
    // 从当前列表中移除该节点
    nodeList.splice(childIndex, 1);
    // 从nodesMap中删除该节点
    nodesMap.value.delete(currentNode.id);
    // 删除关联节点
    nextTick(() => deleteChildren(copyNode.to.flat(Infinity)))

    // 处理特殊情况：如果删除后只剩一个节点，需要合并分支
    if (nodeList.length === 1 && parentList && props.parentNode) {
      const remainingNodeId = nodeList[0];
      const remainingNode = nodesMap.value.get(remainingNodeId);
      nodeList.splice(0, 1); // 删除最后一个节点

      // 将剩余节点的子节点提升到父节点
      if (remainingNode && remainingNode.to && remainingNode.to.length) {
        const parentToIndex = props.parentNode.to.indexOf(props.list);
        if (parentToIndex !== -1) {
          const deletedToData = props.parentNode.to.splice(
              parentToIndex,
              props.parentNode.to.length - parentToIndex || 1,
              [...remainingNode.to[0]]
          );

          // 如果子分支只有一层或多层，动态找到最底层节点
          if (remainingNode.to[0].length >= 1) {
            let arr = [];
            deletedToData.forEach(item => {
              if (item && item.length) {
                arr.push(item);
              }
            });
            // 找到最底层节点并更新它的 to
            const deepestNode = getDeepestNode(remainingNode.to[0][0]);
            if (deepestNode) {
              deepestNode.to = [...arr];
            }
          }
        }
      }
      // 从nodesMap中删除剩余节点
      nodesMap.value.delete(remainingNodeId);
    }
  } else { // 如果是普通节点
    // 从当前列表中移除该节点
    nodeList.splice(childIndex, 1);
    nodesMap.value.delete(currentNode.id);
    // 将当前节点的子节点添加到父节点的to数组中
    props.parentNode.to.push(...currentNode.to)
  }

  nextTick(() => {
    // 过滤掉空数组
    for (let i = parentList.length - 1; i >= 0; i--) {
      if (!Array.isArray(parentList[i]) || parentList[i].length === 0) {
        parentList.splice(i, 1);
      }
    }
    updateDepthRecursively([Array.from(nodesMap.value.keys())[0]])
  })

  // 更新条件提示
  if (nodesMap.value.get(nodeList.at(-1)) && nodeList.length) {
    setPlaceholder(nodeList);
    setContent(nodeList);
  }
}

/**
 * 工具函数：动态找到分支的最底层节点
 **/
function getDeepestNode(startId) {
  let currentNode = nodesMap.value.get(startId);
  while (
      currentNode &&
      Array.isArray(currentNode.to) &&
      currentNode.to.length &&
      Array.isArray(currentNode.to[0]) &&
      currentNode.to[0].length
      ) {
    // 一直沿着第一个子分支向下
    currentNode = nodesMap.value.get(currentNode.to[0][0]);
  }
  return currentNode;
}

function clickNode(val, i) {
  emit('clickNode', val, i, props.list)
}

function judgeBranch() {
  for (const id of props.list) {
    if (nodesMap.value.get(id).type !== 'condition') {
      return false
    }
  }
  return typeof props.index !== 'undefined' && props.list.length
}
</script>
<style scoped lang="scss">
$line-color: #cccccc;

.default {
  background: #6e8dd5;
}

.purple {
  background: #8e70c7;
}

.indigo {
  background: #5c6bc0;
}

.yellow {
  background: #f5a623;
}

.blue {
  background: #2385c8;
}

.workflow-bottom-nodes-flex {
  flex: 1;
}

.workflow-bottom-nodes {
  text-align: center;

  .add-box {
    height: 100%;
  }
}

.priority {
  color: #cccccc;
}

.but {
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 15px;
  color: #3296fa;
  background: #fff;
  cursor: pointer;
  position: relative;
  top: 14px;
  display: inline-flex;
  justify-content: center;
  z-index: 500;
  box-shadow: 0 0 10px rgba(0, 0, 0, .2);

  &:before {
    content: '';
    position: absolute;
    top: -15px;
    width: 2px;
    height: 14px;
    background: $line-color;
  }
}

.workflow-content-nodes {
  position: relative;

  .workflow-item {
    box-sizing: border-box;
    position: relative;
    padding: 0 50px 0;
  }

  .condition {
    padding-top: 50px;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: calc(50% - 1px);
      border: 1px solid $line-color;
      box-sizing: border-box;
      height: 100%;
      z-index: -1;
    }
  }

  .workflow-node {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    //top: -2px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .node-border {
    &:before, &:after {
      content: '';
      position: absolute;
      width: 100%;
      border: 1px solid $line-color;
      box-sizing: border-box;
    }

    &:before {
      top: 0;
    }

    &:last-child:before, &:last-child:after {
      width: calc(100% / 2);
      left: 0;
    }

    &:first-child:before, &:first-child:after {
      width: calc(100% / 2);
      right: 0;
    }

    &:after {
      bottom: 0;
    }
  }
}

//全局
.workflow-item {
  display: inline-block;

  & > div {
    width: 220px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .2);
    position: relative;

    &:after {
      content: '';
      display: none;
      pointer-events: none;
      box-sizing: border-box;
      border-radius: 5px;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
    }
  }

  & > div:hover {
    &:after {
      display: block;
      border: 1px solid #409eff;
    }
  }

  .title {
    position: relative;
    padding-left: 15px;
    padding-right: 15px;
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    text-align: left;
    border-radius: 4px 4px 0 0;
    color: #fff;

    .close {
      cursor: pointer;
      float: right;
      font-size: 16px;
    }
  }

  .content {
    position: relative;
    text-align: left;
    border-bottom-right-radius: 5px;
    border-bottom-left-radius: 5px;
    background: #fff;
    cursor: pointer;
    color: #000000;
    font-size: 14px;
    padding: 15px 15px 15px 20px;
    height: 54px;
    box-sizing: border-box;

    &:hover {
      .left-arrow, .right-arrow {
        display: inline-block;
      }
    }

    .text {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .placeholder {
      color: #9c9090;
    }

    .left-arrow, .right-arrow {
      position: absolute;
      color: #5c6bc0;
      display: none;
    }

    .left-arrow {
      left: 2px;
    }

    .right-arrow {
      right: 2px;
    }
  }
}

.last-add-box {
  flex: 1;
}

.add-box:not(.short-add-box) {
  padding: 50px 0;
  //flex: 1;
}

.short-add-box {
  padding-top: 50px;
  padding-bottom: 36px;
}

.add-box {
  position: relative;
  display: flex;
  justify-content: center;
  box-sizing: border-box;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: calc(50% - 1px);
    width: 2px;
    height: calc(100% + 2px);
    background: $line-color;
    z-index: -1;
  }
}
</style>
