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
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

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

function updateTransform() {
    target.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

export function wheelZoomFunc({scaleFactor, originX = 0.5, originY = 0.5, isExternalCall = false}) {
    let ratio = 1.1;

    if (scaleFactor && scaleFactor > 0) {
        ratio = 1 / ratio;
    }

    const rect = target.getBoundingClientRect();
    let newScale = isExternalCall ? scaleFactor : scale * ratio;

    newScale = Math.max(0.5, Math.min(newScale, 5));

    const deltaScale = newScale / scale;
    translateX -= (originX - 0.5) * rect.width * (deltaScale - 1);
    translateY -= (originY - 0.5) * rect.height * (deltaScale - 1);

    scale = newScale;
    callback && callback((scale * 100).toFixed(0));
    updateTransform();
}
