<template>
  <span class="but" @click="addCondition(list)" v-if="typeof props.index !== 'undefined'">添加条件分支</span>
  <div class="workflow-content-nodes">
    <div class="workflow-node" v-for="(item,i) in list"
         :class="{'node-border':list.length > 1}">
      <template v-for="(val,l) in item">
        <div class="workflow-item" :class="val.type" v-if="val.title">
          <div>
            <div class="title"
                 :class="{'default':val.type === 'start','indigo':val.type === 'ccTo',yellow:val.type === 'approver',purple:val.type === 'condition'}">
              <!--              <span v-if="val.type === 'approver'">📝</span> -->
              {{ val.title }}
              <span class="priority" v-if="val.type === 'condition'">（优先级{{ i + 1 }}）</span>
              <span class="close" @click="removeNode(list,i,l,parentData,val)" v-if="val.type !== 'start'">×</span>
            </div>
            <div class="content" @click="clickNode(val,i,`优先级${i + 1}`)">
              <span class="left-arrow" v-if="i && val.type === 'condition'" @click.stop="moveToLeft(list,i,l)">⇦</span>
              <span v-if="val.content && val.content !== ''">{{ val.content }}</span>
              <span class="placeholder" v-else>{{ val.placeholder }}</span>
              <span class="right-arrow" v-if="val.type === 'condition' && i !== list.length - 1"
                    @click.stop="moveToRight(list,i,l)">⇨</span>
            </div>
          </div>
        </div>
        <div class="add-box"
             :class="{'last-add-box':l === item.length - 1 && (!val.children || !val.children.length), 'short-add-box':item[l + 1] && item[l + 1].children}"
             v-if="val.title">
          <div class="popover">
            <span class="add-item">+</span>
            <div class="tools-list">
              <div>
                <div>
                  <span class="tools-item" @click="addApprover(item,l)">审批人</span>
                </div>
                <div>
                  <span class="tools-item" @click="addCcTo(item,l)">抄送人</span>
                </div>
                <div>
                  <span class="tools-item" @click="add(item,l)">添加条件分支</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <workflowNodes v-if="val.children" :list="val.children" :index="l" :parent-data="item"
                       @click-node="clickNode"></workflowNodes>
      </template>
    </div>
  </div>
  <div class="workflow-bottom-nodes" v-if="typeof props.index !== 'undefined'">
    <div class="add-box">
      <div class="popover">
        <span class="add-item">+</span>

        <div class="tools-list">
          <div>
            <div>
              <span class="tools-item" @click="addApprover(parentData,index)">审批人</span>
            </div>
            <div>
              <span class="tools-item" @click="addCcTo(parentData,index)">抄送人</span>
            </div>
            <div>
              <span class="tools-item" @click="add(parentData,index)">添加条件分支</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import workflowNodes from "./workflowNodes.vue";
import {watch} from "vue";

const props = defineProps({
  list: Array,
  index: Number,
  depth: Number,
  parentData: [Object, Array],
  testData: Object
})

const emit = defineEmits(['clickNode'])

function generateRandomId() {
  const timestamp = new Date().getTime(); // 获取当前时间戳
  const randomNum = Math.floor(Math.random() * 1000); // 生成一个0-999之间的随机数
  return `${timestamp}${randomNum}`; // 返回拼接后的ID字符串
}

/**
 * 插入审批人
 */
function addApprover(val, i) {
  val.splice(i + 1, 0, {
    title: '审批人',
    content: '',
    placeholder: '请选择审批人',
    type: 'approver',
    id: generateRandomId(),
  })
}

/**
 * 插入抄送人
 */
function addCcTo(val, i) {
  val.splice(i + 1, 0, {
    title: '抄送人',
    content: '',
    placeholder: '请选择抄送人',
    type: 'ccTo',
    id: generateRandomId(),
  })
}

function setPlaceholder(val) {
  for (let item of val) {
    if (item[0].last) {
      delete item[0].last
    }
    if (item[0].content === '其他条件进入此流程') {
      item[0].placeholder = '请设置条件'
      item[0].content = ''
    }
  }
}

function setContent(nodeList) {
  if (nodeList[nodeList.length - 1][0].placeholder === '请设置条件' && nodeList[nodeList.length - 1][0].content === '') {
    nodeList[nodeList.length - 1][0].content = '其他条件进入此流程'
    nodeList[nodeList.length - 1][0].placeholder = ''
  }
  nodeList[nodeList.length - 1][0].last = true
}

/**
 * 添加条件分支
 *
 * @param val 需要操作的数组
 * @param i 插入子项的索引位置
 */
function add(val, i) {
  let arr = [[
    {
      title: '条件',
      content: '',
      placeholder: '请设置条件',
      type: 'condition',
      id: generateRandomId(),
    }
  ],
    [
      {
        title: '条件',
        content: '其他条件进入此流程',
        // placeholder: '其他条件进入此流程',
        type: 'condition',
        id: generateRandomId(),
        last:true
      }
    ]
  ]

  if (val[i + 1]) {
    let data = val.splice(i + 1, val.length - 1)
    arr[0].push(...data)
    val.splice(i + 1, 0, {children: arr})
  } else {
    val.push({children: arr})
  }
}

/**
 * 添加条件分支
 *
 * @param val 要添加条件的数组
 */
function addCondition(val) {
  setPlaceholder(val)
  val.push([
    {
      title: `条件`,
      content: '其他条件进入此流程',
      // placeholder: '',
      type: 'condition',
    }
  ])
}

function moveToLeft(nodeList, i, l) {
  let temp = nodeList[i];
  nodeList[i] = nodeList[i - 1];
  nodeList[i - 1] = temp;

  setPlaceholder(nodeList)
  setContent(nodeList)
}

function moveToRight(nodeList, i, l) {
  let temp = nodeList[i];
  nodeList[i] = nodeList[i + 1];
  nodeList[i + 1] = temp;

  setPlaceholder(nodeList)
  setContent(nodeList)
}

/**
 * 从树形中删除指定节点
 *
 * @param nodeList 需要删除节点的列表
 * @param nodeIndex 节点索引
 * @param childIndex 子节点索引
 * @param parentList 父级数据
 * @param currentNode 当前节点
 */
function removeNode(nodeList, nodeIndex, childIndex, parentList, currentNode) {
  console.log('currentNode:', currentNode);
  console.log('parentList:', parentList, nodeList, nodeIndex, childIndex);

  // 如果是“条件”节点
  if (currentNode.type === 'condition') {
    if (nodeList.length === 2) {

      let parentIndex = -1

      // 查找父级索引
      parentList.map((item, i) => {
        if (item.children) {
          item.children.map(val => {
            if (val[0].id === currentNode.id) {
              parentIndex = i
            }
          })
        }
      })

      if (parentIndex === -1) return;

      let parentChildren = parentList[parentIndex];

      // 删除当前节点
      nodeList.splice(nodeIndex, 1);

      // 删除“条件”节点
      parentChildren.children[0].splice(0, 1);

      // 获取 children 剩下的所有数据
      let childrenData = parentChildren.children[0];

      if (childrenData.length) {
        // 删除父级原 children 数据，并展开 childrenData 插入
        parentList.splice(parentIndex, 1, ...childrenData);
      } else {
        // 直接删除整个父级 children
        parentList.splice(parentIndex, 1);
      }
    } else {
      // 如果 `nodeList` 中仍有多个元素，则正常删除
      nodeList.splice(nodeIndex, 1);
    }
  } else {  // 普通节点删除
    nodeList[nodeIndex].splice(childIndex, 1);
  }

  // 设置条件文字提示，如果最后一个条件节点是“其他条件进入此流程”则不显示 placeholder
  if (nodeList[nodeList.length - 1][0]) {
    setPlaceholder(nodeList)
    // nodeList.forEach((item,i)=>{
    //   item[0].title = `条件${i + 1}`
    // })
    setContent(nodeList)
  }
}

function clickNode(val, i) {
  emit('clickNode', val, i, props.list)
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

.workflow-bottom-nodes {
  text-align: center;
  flex: 1;

  .add-box {
    height: 100%;
  }
}

.priority {
  color: #cccccc;
}

.tools-item {
  cursor: pointer;
  color: #409eff;
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
      width: 2px;
      height: 100%;
      background: $line-color;
      z-index: -1;
    }
  }

  .workflow-node {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    height: 100%;
    box-sizing: border-box;
  }

  .node-border {
    &:before, &:after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      background: #cccccc;
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

    &:hover {
      .left-arrow, .right-arrow {
        display: inline-block;
      }
    }

    .placeholder {
      color: $line-color;
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
    height: 100%;
    background: $line-color;
    z-index: -1;
  }

  .add-item {
    display: inline-block;
    cursor: pointer;
    width: 30px;
    height: 30px;
    text-align: center;
    font-size: 21px;
    font-weight: bold;
    background: #2385c8;
    color: #fff;
    border-radius: 50%;
  }
}

.popover {
  position: relative;
  z-index: 1000;

  .tools-list {
    padding-left: 10px;
    display: none;
    position: absolute;
    top: -23px;
    left: 30px;

    &:before {
      content: '';
      position: absolute;
      top: calc(50% - 6px);
      left: 4px;
      width: 10px;
      height: 10px;
      background: #ffffff;
      transform: rotate(45deg);
      border-left: 1px solid $line-color;
      border-bottom: 1px solid $line-color;
    }

    & > div {
      text-align: center;
      background: #ffffff;
      padding: 5px 15px;
      border: 1px solid $line-color;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0, 0, 0, .2);
    }
  }

  &:hover .tools-list {
    display: block;
  }
}
</style>
