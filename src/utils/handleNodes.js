import {reactive} from "vue";

const nodesMap = reactive(new Map())

export function generateRandomId() {
    const timestamp = new Date().getTime(); // 获取当前时间戳
    const randomNum = Math.floor(Math.random() * 1000); // 生成一个0-999之间的随机数
    return `${timestamp}${randomNum}`; // 返回拼接后的ID字符串
}

export const getNodesMap = () => nodesMap

export function setNodesMap(val) {
    nodesMap.set(val.id, val)
}

export function clearNodesMap() {
    nodesMap.clear()
}

export function updateDepthRecursively(nodeIds, depth = 0) {
    let maxDepth = depth;

    nodeIds.forEach(nodeId => {
        const node = nodesMap.get(nodeId);
        if (!node) return;

        node.depth = depth;

        if (Array.isArray(node.to) && node.to.length) {
            node.to.forEach((childList, index) => {
                if (index === 0) {
                    // 条件分支，正常递归
                    const childMax = updateDepthRecursively(childList, depth + 1);
                    maxDepth = Math.max(maxDepth, childMax);
                } else {
                    // 汇合后的节点，深度 = 前面分支最大深度 + 1
                    const childMax = updateDepthRecursively(childList, maxDepth + 1);
                    maxDepth = Math.max(maxDepth, childMax);
                }
            });
        }
    });

    return maxDepth;
}

export function handleAdd(val, parentData, i, depth) {
    const condition0 = {
        title: '条件',
        depth: depth,
        content: '',
        placeholder: '请设置条件',
        type: 'condition',
        id: generateRandomId(),
        to: []
    }
    const condition1 = {
        title: '条件',
        depth: depth,
        content: '其他条件进入此流程',
        // placeholder: '其他条件进入此流程',
        type: 'condition',
        id: generateRandomId(),
        // last: true,
        to: []
    }
    nodesMap.set(condition0.id, condition0);
    nodesMap.set(condition1.id, condition1);

    if (parentData) {
        if (parentData[i + 1]) {
            condition0.to = [...parentData.splice(i + 1, parentData.length - 1)]
            parentData.splice(i + 1, 0, [condition0.id, condition1.id])
        } else {
            val.to.push([condition0.id, condition1.id])
        }
        updateDepthRecursively([Array.from(nodesMap.keys())[0]])
        return
    }
    if (val.to && val.to.length) {
        condition0.to = [...val.to]
        val.to = [[condition0.id, condition1.id]]
    } else {
        val.to.push([condition0.id, condition1.id])
    }
    updateDepthRecursively([Array.from(nodesMap.keys())[0]])
}

export function handleAddCcTo(val, i, parentData, key, depth) {
    const ccTo = {
        title: '抄送人',
        depth: depth,
        content: '',
        placeholder: '请选择抄送人',
        type: 'ccTo',
        id: generateRandomId(),
        to: []
    }
    if (key === 'last') {
        if (parentData.length === i + 1) { // 相等表示最后一个节点
            parentData.splice(i + 1, 0, [ccTo.id])
        } else { // 不相等表示不是最后一个节点
            ccTo.to = [[...parentData[i + 1]]]
            parentData.splice(i + 1, 1, [ccTo.id])
        }
    } else {
        ccTo.to = [...val.to || []]
        val.to = [[ccTo.id]]
        // val.to.splice(i, 1, [ccTo.id])
    }
    nodesMap.set(ccTo.id, ccTo)
    updateDepthRecursively([Array.from(nodesMap.keys())[0]])
}

export function handleAddApprover(val, i, parentData, key, depth) {
    const approver = {
        title: '审批人',
        depth: depth,
        content: '',
        placeholder: '请选择审批人',
        type: 'approver',
        id: generateRandomId(),
        to: []
    }
    if (key === 'last') {
        if (parentData.length === i + 1) { // 相等表示最后一个节点
            parentData.splice(i + 1, 0, [approver.id])
        } else { // 不相等表示不是最后一个节点
            approver.to = [[...parentData[i + 1]]]
            parentData.splice(i + 1, 1, [approver.id])
        }
    } else {
        approver.to = [...val.to || []]
        val.to = [[approver.id]]
    }
    nodesMap.set(approver.id, approver)
    updateDepthRecursively([Array.from(nodesMap.keys())[0]])
}
