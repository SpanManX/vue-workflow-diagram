<template>
  <el-drawer v-model="isShow"
             title="条件设置">
    <el-checkbox-group v-model="checkList" @change="change">
      <el-checkbox v-for="key in Object.keys(options)" :label="options[key]" :value="key"/>
    </el-checkbox-group>
    <template #footer>
      <el-button @click="isShow = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-drawer>
</template>
<script setup>
import {ref} from "vue";

defineExpose({openDrawer});

const emit = defineEmits(['change', 'confirm']);
const isShow = ref(false);
const checkList = ref([])
const currentData = ref([]);

const options = {
  0: '部门'
}

function openDrawer(val) {
  if (val) {
    val.value.forEach(item => {
      checkList.value.push(item.value);
    });
  } else {
    checkList.value = [];
  }
  isShow.value = true;
}

function change(val) {
  currentData.value = val.map(item => ({label: options[item], value: item}));
  emit('change', {
    value: currentData.value,
  })
}

function confirm() {
  emit('confirm', {
    value: currentData.value,
  });
  isShow.value = false;
}
</script>
<style scoped lang="scss">

</style>
