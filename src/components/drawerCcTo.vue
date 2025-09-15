<template>
  <el-drawer v-model="isShow"
             title="抄送人" @close="close">
    <div>
      <p class="subtitle">
        设置抄送人
      </p>
      <div class="select-content">
        <el-button type="primary" :icon="Plus">添加抄送人</el-button>
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
import {Plus} from "@element-plus/icons-vue";

defineExpose({openDrawer});

const emit = defineEmits(['change', 'confirm']);

const isShow = ref(false);
const selected = ref([])

function openDrawer(val) {
  isShow.value = true;
  if (val) {
    selected.value = val.value.data
  }
}

function confirm() {
  emit('confirm', {
    value: {
      label: '指定抄送人',
      data: selected.value
    }
  });
  close()
}

function close() {
  isShow.value = false
  selected.value = []
}
</script>
<style scoped lang="scss">
.select-content {
  margin-left: 20px;
}
</style>
