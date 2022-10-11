// Canvas
const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const logo = document.getElementById("canvasVideo");

let imageSize = 345;

if (window.matchMedia("(max-width: 767px)").matches) {
    imageSize = 150;
} else if (window.matchMedia("(max-width: 1365px)").matches) {
    imageSize = 260;
} else if (window.matchMedia("(max-width: 1799px)").matches) {
    imageSize = 284;
}

const strokeColor = "#050505";

function addSourceToVideo(size) {
    logo.innerHTML = "";

    let mp4 = document.createElement("source");
    mp4.src = `${logo.dataset.path}-${size}.mp4`;
    mp4.type = "video/mp4";
    logo.appendChild(mp4);

    let webm = document.createElement("source");
    webm.src = `${logo.dataset.path}-${size}.webm`;
    webm.type = "video/webm";
    logo.appendChild(webm);

    logo.load();
}

function perImage(per) {
    return (imageSize / 100) * per;
}

function render(xTo, yTo) {
    if (xTo <= imageSize / 2) xTo = imageSize / 2;

    if (xTo > canvas.offsetWidth - imageSize / 2) xTo = canvas.offsetWidth - imageSize / 2;

    if (yTo <= imageSize / 2) yTo = imageSize / 2;

    if (yTo > canvas.offsetHeight - imageSize / 2) yTo = canvas.offsetHeight - imageSize / 2;

    ctx.drawImage(logo, xTo - imageSize / 2, yTo - imageSize / 2, imageSize, imageSize);

    // 1 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(-1, -1);
    ctx.lineTo(xTo - imageSize / 2 + perImage(1.5), yTo - imageSize / 2 + perImage(21.3));
    ctx.stroke();

    // 2 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(canvas.offsetWidth / 2.3, -1);
    ctx.lineTo(xTo - imageSize / 2 + perImage(21.8), yTo - imageSize / 2 + perImage(0.8));
    ctx.stroke();

    // 3 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(canvas.offsetWidth / 1.35, -1);
    ctx.lineTo(xTo + imageSize / 2 - perImage(22), yTo - imageSize / 2 + perImage(1.5));
    ctx.stroke();

    // 4 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(canvas.offsetWidth + 1, canvas.offsetHeight / 4);
    ctx.lineTo(xTo + imageSize / 2 - perImage(1.5), yTo - imageSize / 2 + perImage(21.8));
    ctx.stroke();

    // 5 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(canvas.offsetWidth + 1, canvas.offsetHeight * 0.9);
    ctx.lineTo(xTo + imageSize / 2 - perImage(0.8), yTo + imageSize / 2 - perImage(22));
    ctx.stroke();

    // 6 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(canvas.offsetWidth / 1.5, canvas.offsetHeight + 1);
    ctx.lineTo(xTo + imageSize / 2 - perImage(21.3), yTo + imageSize / 2 - perImage(1.5));
    ctx.stroke();

    // 7 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(canvas.offsetWidth / 3, canvas.offsetHeight + 1);
    ctx.lineTo(xTo - imageSize / 2 + perImage(21.3), yTo + imageSize / 2 - perImage(0.8));
    ctx.stroke();

    // 8 line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.moveTo(-1, canvas.offsetHeight * 0.8);
    ctx.lineTo(xTo - imageSize / 2 + perImage(0.8), yTo + imageSize / 2 - perImage(21.3));
    ctx.stroke();
}

function fitCanvas() {
    setTimeout(() => {
        const [w, h] = [canvas.offsetWidth, canvas.offsetHeight];

        canvas.width = w * devicePixelRatio;
        canvas.height = h * devicePixelRatio;

        ctx.scale(devicePixelRatio, devicePixelRatio);

        render();
    }, 100);
}

// Mouse following
let mouseX = window.innerWidth / 2 - getPosition(canvas).x * 2;
let mouseY = window.innerHeight / 2 - getPosition(canvas).y;
let xPos = window.innerWidth / 2 - getPosition(canvas).x * 2;
let yPos = window.innerHeight / 2 - getPosition(canvas).y;

function getPosition(el) {
    let xPos = 0;
    let yPos = 0;

    while (el) {
        if (el.tagName == "BODY") {
            let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            let yScroll = el.scrollTop || document.documentElement.scrollTop;

            xPos += el.offsetLeft - xScroll + el.clientLeft;
            yPos += el.offsetTop - yScroll + el.clientTop;
        } else {
            xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
            yPos += el.offsetTop - el.scrollTop + el.clientTop;
        }

        el = el.offsetParent;
    }
    return {
        x: xPos,
        y: yPos,
    };
}

function setMousePosition(e) {
    mouseX = e.clientX - getPosition(canvas).x;
    mouseY = e.clientY - getPosition(canvas).y;
}

function resetMousePosition() {
    mouseX = window.innerWidth / 2 - getCoords(canvas).left * 2;
    mouseY = window.innerHeight / 2 - getCoords(canvas).top;
}

function getCoords(elem) {
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function animate() {
    xPos += (mouseX - xPos) / 44;
    yPos += (mouseY - yPos) / 44;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    render(xPos, yPos);

    requestAnimationFrame(animate);
}

function resizeWindow() {
    if (window.matchMedia("(max-width: 767px)").matches) {
        imageSize = 150;
    } else if (window.matchMedia("(max-width: 1365px)").matches) {
        imageSize = 260;
    } else if (window.matchMedia("(max-width: 1799px)").matches) {
        imageSize = 284;
    } else {
        imageSize = 345;
    }

    resetMousePosition();
    fitCanvas();
}

addSourceToVideo(imageSize * 2);

logo.addEventListener("loadeddata", function () {
    logo.play();

    fitCanvas();
    animate();

    setTimeout(() => {
        canvas.parentElement.classList.remove("opacity-0");
        document.getElementById("canvasLoader").classList.add("opacity-0");
    }, 200);
});
window.addEventListener("resize", resizeWindow, false);
canvas.addEventListener("mousemove", setMousePosition, false);
canvas.addEventListener("mouseleave", resetMousePosition, false);
