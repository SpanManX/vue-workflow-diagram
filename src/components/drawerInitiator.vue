<template>
  <el-drawer v-model="isShow"
             title="发起人">
    <el-radio-group v-model="radio" @change="change('radio')">
      <el-radio value="1" size="large">所有人</el-radio>
      <el-radio value="2" size="large">其他</el-radio>
    </el-radio-group>

    <div>
      <el-select v-if="radio === '2'"
                 @change="change"
                 v-model="currentDept"
                 placeholder="请选择部门"
                 size="large"
                 multiple
                 collapse-tags
                 collapse-tags-tooltip
                 clearable
                 :max-collapse-tags="2"
                 style="width: 240px">
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item"
        />
      </el-select>
    </div>
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
const radio = ref('1')

const options = [
  {
    value: '1',
    label: '人事部',
  },
  {
    value: '2',
    label: '行政部',
  },
  {
    value: '3',
    label: '工程部',
  },
  {
    value: '4',
    label: '研发部',
  },
  {
    value: '5',
    label: '营销部',
  },
]

let currentDept = ref([]);

function openDrawer() {
  isShow.value = true;
}

function change(val) {
  if (val === 'radio') {
    currentDept.value = []
  }
  emit('change', {
    radio: radio.value,
    value: radio.value === '1' ? [{label: '所有人'}] : currentDept.value
  })
}

function confirm() {
  emit('confirm', {
    radio: radio.value,
    value: radio.value === '1' ? [{label: '所有人'}] : currentDept.value
  });
  isShow.value = false;
}
</script>
<style scoped lang="scss">

</style>
