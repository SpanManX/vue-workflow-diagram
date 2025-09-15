<template>
  <el-drawer v-model="isShow"
             title="发起人">
    <el-radio-group v-model="radio">
      <el-radio v-for="(item,i) in options" :value="i">{{ item }}</el-radio>
    </el-radio-group>
    <template #footer>
      <el-button @click="isShow = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-drawer>
</template>
<script setup>
import {ref} from "vue";
import {startOptions} from "../utils/dictionary.js";

defineExpose({openDrawer});

const emit = defineEmits(['confirm']);

const isShow = ref(false);
const radio = ref(0)
const currentDept = ref([]);

const options = startOptions

function openDrawer(val) {
  isShow.value = true;
  if (val) {
    radio.value = val.radio
  }
}

function confirm() {
  emit('confirm', {
    radio: radio.value,
    value: {
      label: options[radio.value],
      data: ['所有人']
    }
  });
  isShow.value = false;
}
</script>
<style scoped lang="scss">

</style>
