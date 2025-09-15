<template>
  <el-drawer v-model="isShow" title="条件设置" @close="close">
    <div>
      <p class="subtitle">
        设置分支条件
      </p>
      <div class="select-content">
        <el-checkbox-group v-model="checkList" @change="change">
          <el-checkbox v-for="key in Object.keys(options)" :label="options[key]" :value="key"/>
        </el-checkbox-group>
        <el-form :model="formData" ref="formRef" label-width="75px" style="margin-top:20px;">
          <el-form-item label="请假天数" prop="leaveDays" v-if="checkList.indexOf('0') > -1">
            <el-input v-model="formData.leaveDays" placeholder="请输入请假天数">
              <template #prepend>
                <el-select v-model="formData.judgingCondition" style="width: 115px">
                  <el-option label="大于" value=">"/>
                  <el-option label="小于" value="<"/>
                  <el-option label="等于" value="==="/>
                  <el-option label="大于等于" value=">=="/>
                  <el-option label="小于等于" value="<=="/>
                </el-select>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="角色/职位" prop="roles" v-if="checkList.indexOf('1') > -1">
            <el-select v-model="formData.roles" multiple placeholder="请选择">
              <el-option v-for="item in rolesOptions" :label="item.roleName" :value="item.id"/>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="padding-top-20">
      <p class="subtitle">
        设置判断条件
      </p>
      <div>
        <el-radio-group v-model="logicalOperator" style="display: block">
          <el-radio value="AND">所有条件都满足进入此分支</el-radio>
          <br/>
          <el-radio value="OR">任一条件满足进入此分支</el-radio>
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
import {nextTick, reactive, ref} from "vue";
import {conditionOptions} from "../utils/dictionary.js";

defineExpose({openDrawer});

const emit = defineEmits(['confirm']);
const isShow = ref(false);
const checkList = ref([])
const currentData = ref([]);
const rolesOptions = ref([]);
const logicalOperator = ref('AND')
const formRef = ref(null)

const formData = reactive({
  roles: [],
  leaveDays: null,
  judgingCondition: '>==',
})

const options = conditionOptions

// 定义条件字段映射
const conditionFieldMap = {
  '0': { // 请假天数
    field: 'leaveDays',
    getValue: () => formData.leaveDays,
    operator: () => formData.judgingCondition
  },
  '1': { // 角色/职位
    field: 'roles',
    getValue: () => formData.roles,
    operator: () => '=='
  }
  // 可以继续添加其他条件的映射...
};

function openDrawer(val) {
  if (val) {
    nextTick(() => {
      logicalOperator.value = val.conditionRules.logicalOperator
      Object.keys(val.conditionRules.rules).forEach(key => {
        checkList.value.push(key);
        formData[val.conditionRules.rules[key].field] = val.conditionRules.rules[key].value
      })
    })
  } else {
    checkList.value = [];
  }
  isShow.value = true;
}

function change(val) {
  currentData.value = val.map(item => ({label: options[item], value: item}));
}

function confirm() {
  const rules = {
    logicalOperator: logicalOperator.value,
    rules: {}
  }
  // 动态构建所有选中的条件
  checkList.value.forEach(key => {
    const conditionConfig = conditionFieldMap[key];
    if (conditionConfig) {
      rules.rules[key] = {
        field: conditionConfig.field,
        operator: conditionConfig.operator(),
        value: conditionConfig.getValue()
      };
    }
  });
  emit('confirm', {
    checkList: checkList.value,
    value: currentData.value,
    conditionRules: rules,
  });
  isShow.value = false;
}

function close() {
  isShow.value = false
  checkList.value = [];
  formRef.value.resetFields();
  logicalOperator.value = 'AND'
}
</script>
<style scoped lang="scss">
.select-content {
  margin-left: 20px;
}

.padding-top-20 {
  padding-top: 20px;
}
</style>
