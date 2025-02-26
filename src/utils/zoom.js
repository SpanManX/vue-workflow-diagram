let scale = 1; // 当前缩放比例
let callback = null; // 缩放回调函数
let translateX = 0, translateY = 0; // 平移偏移量
let isDragging = false; // 是否处于拖拽状态
let startX, startY; // 记录鼠标拖拽起始位置
let target = null; // 目标元素
let wrapper = null; // 容器元素

export function zoomInit(dom1, dom2, cb) {
    callback = cb;
    scale = 1;
    wrapper = dom1.value
    target = dom2.value

    // 在 wrapper 内部监听鼠标滚轮缩放
    wrapper.addEventListener("wheel", function (event) {
        event.preventDefault(); // 阻止默认滚动行为

        const rect = target.getBoundingClientRect();

        /**
         * 计算鼠标位置所在坐标
         * clientX = 浏览器窗口可视区域左边到鼠标点击位置的横向距离
         * rect.left = 目标元素左边到浏览器窗口可视区域左边的距离
         * 同理可得 clientY 和 rect.top
         * offsetX,offsetY = 鼠标所在位置的正确坐标
         **/
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        /**
         * 计算出鼠标相对于元素宽度的比例（百分比）。这个比例值在 [0, 1] 范围内，表示鼠标相对于目标元素宽度的位置
         * 例如，如果鼠标位于元素的左侧，那么 originX 接近 0；如果鼠标位于右侧，则 originX 接近 1；如果位于中间，则 originX 接近 0.5
         * 同理可得 originY
         **/
        const originX = offsetX / rect.width;
        const originY = offsetY / rect.height;

        wheelZoomFunc({scaleFactor: event.deltaY, originX, originY});
    });

    // 鼠标按下，开始拖拽
    wrapper.addEventListener("mousedown", function (event) {
        isDragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        target.style.cursor = "grabbing";
        // setTimeout(() => {
        //     target.setPointerCapture(event.pointerId);
        // },100)
    });

    // 鼠标移动，执行拖拽
    wrapper.addEventListener("mousemove", function (event) {
        if (!isDragging) return;

        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        updateTransform();
    });

    // 鼠标松开，停止拖拽
    wrapper.addEventListener("mouseup", function () {
        isDragging = false;
        target.style.cursor = "grab";
    });
}

/**
 * 重置大小和位置
 **/
export function resetImage() {
    scale = 1;
    translateX = 0
    translateY = 0;
    isDragging = false;
    startX = null
    startY = null;
    target.style.transform = "translate3d(0px, 0px, 0px) scale(1)";
}

/**
 * 更新目标元素的变换属性
 * 该函数用于更新目标元素的CSS变换属性，包括平移和缩放。
 */
function updateTransform() {
    target.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

/**
 * 滚轮缩放函数
 *
 * 根据滚轮事件或外部调用实现缩放功能，同时调整目标元素的平移位置以保持缩放中心不变。
 *
 * @param {Object} options - 参数对象
 * @param {number} options.scaleFactor - 缩放因子，大于0表示缩小，小于0表示放大
 * @param {number} [options.originX=0.5] - 缩放中心点的X坐标比例，默认为0.5（即中心点）
 * @param {number} [options.originY=0.5] - 缩放中心点的Y坐标比例，默认为0.5（即中心点）
 * @param {boolean} [options.isExternalCall=false] - 是否为外部调用，默认为false
 * @param {Function} [callback] - 缩放完成后的回调函数，接收缩放比例（百分比形式）作为参数
 */
export function wheelZoomFunc({scaleFactor, originX = 0.5, originY = 0.5, isExternalCall = false}) {
    // ratio 是一个比例因子，用来控制每次滚轮操作的缩放程度。这里设置为 1.1，意味着每次滚轮滚动将导致大约 10% 的缩放变化（放大或缩小）。
    let ratio = 1.1;

    // 缩小执行。ratio = 1 / 1.1 会变成 0.909
    if (scaleFactor && scaleFactor > 0) {
        ratio = 1 / ratio;
    }

    const rect = target.getBoundingClientRect();
    let newScale = isExternalCall ? scaleFactor : scale * ratio;

    newScale = newScale.toFixed(1)

    // 确保 newScale 在一定范围内（0.5 到 5），保持缩放比例在 50% 到 500% 之间
    newScale = Math.max(0.5, Math.min(newScale, 5));

    // deltaScale 代表当前缩放比例和原始缩放比例之间的比值
    // 比值，在数学和编程中，表示的是两个数量之间的相对关系或比例，表示一个数是另一个数的多少倍
    // newScale 是 scale = 的多少倍 deltaScale
    const deltaScale = newScale / scale;

    // (originX - 0.5) * rect.width 计算的是鼠标相对于目标元素中心点的水平偏移量(px)
    // (deltaScale - 1) 表示缩放倍数比值与原始比例（原始比例是1，所以要减去1）的差值，用来计算平移的增量，且可控制平移，减到 0 就不在平移,
    translateX -= (originX - 0.5) * rect.width * (deltaScale - 1);
    translateY -= (originY - 0.5) * rect.height * (deltaScale - 1);

    scale = newScale;
    callback && callback((scale * 100).toFixed(0));
    updateTransform();
}
