<template>
  <el-drawer v-model="isShow"
             title="审批人" @close="close">
    <div>
      <p class="subtitle">
        设置审批人
      </p>
      <div class="select-content">
        <el-radio-group v-model="radio">
          <el-radio v-for="(item, i) in options" :value="i" size="large">{{ item }}</el-radio>
        </el-radio-group>
      </div>
    </div>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-drawer>
</template>
<script setup>
import {ref} from "vue";
import {approverOptions} from "../utils/dictionary.js";

defineExpose({openDrawer});

const emit = defineEmits(['confirm']);

const isShow = ref(false);
const radio = ref(0)

const options = approverOptions

function openDrawer(val) {
  isShow.value = true;
  if (val) {
    radio.value = val.radio || 0
  }
}

function getValue() {
  return [options[radio.value]]
}

function confirm() {
  emit('confirm', {
    radio: radio.value,
    value: {
      label: options[radio.value],
      data: getValue()
    }
  });
  close()
}

function close() {
  isShow.value = false
}
</script>
<style scoped lang="scss">
.select-content {
  margin-left: 20px;
}
</style>
