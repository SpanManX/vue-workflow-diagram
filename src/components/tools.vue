<template>
  <div class="popover">
    <span class="add-item">+</span>
    <div class="tools-list">
      <div>
        <div>
          <span class="tools-item" @click="emits('addApprover')">审批人</span>
        </div>
        <div>
          <span class="tools-item" @click="emits('addCcTo')">抄送人</span>
        </div>
        <div>
          <span class="tools-item" @click="emits('add')">添加条件分支</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const emits = defineEmits(["addApprover", 'addCcTo', 'add']);
</script>

<style scoped lang="scss">
$line-color: #cccccc;
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
      left: 5px;
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

  .tools-item {
    cursor: pointer;
    color: #409eff;
  }

  &:hover .tools-list {
    display: block;
  }
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
</style>