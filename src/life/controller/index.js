import { camera } from '../camera';

let rows;
let cols;
let colSize;
let rowSize;
let canvas;
let canvasLeft;
let canvasTop;
let mouseDownListeners = [];
let mouseUpListeners = [];
let mouseMoveListeners = [];
let documentMouseUpListeners = [];
let wheelListener = null;

export const init = (canvas_, cols_, rows_) => {
    canvas = canvas_;
    cols = cols_;
    rows = rows_;
    colSize = canvas.width / cols_;
    rowSize = canvas.height / rows_;
    const boundingRect = canvas.getBoundingClientRect();
    canvasTop = boundingRect.top;
    canvasLeft = boundingRect.left;
};

export const getEventCoords = (event) => {
    const cameraX = camera.X + canvas.width / 2;
    const cameraY = camera.Y + canvas.height / 2;

    const relX = event.clientX - canvasLeft;
    const relY = event.clientY - canvasTop;

    const sceneX = (relX - cameraX) / camera.scaleFactor + cameraX;
    const sceneY = (relY - cameraY) / camera.scaleFactor + cameraY;

    const col = Math.min((sceneX / colSize) | 0, cols - 1);
    const row = Math.min((sceneY / rowSize) | 0, rows - 1);

    return { col, row };
};

export const addMousePressedListener = (btnNum, listener) => {
    let isPressed = false;
    const handleMouseDown = (event) => {
        event.preventDefault();
        if (event.which === btnNum) {
            isPressed = true;
        }
    };
    mouseDownListeners.push(handleMouseDown);
    canvas.addEventListener('mousedown', handleMouseDown);

    const handleMouseUp = (event) => {
        if (event.which === btnNum) {
            isPressed = false;
        }
    };
    documentMouseUpListeners.push(handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);

    const handleMouseMove = (event) => {
        event.preventDefault();
        if (isPressed === true && event.which === btnNum) {
            const { row, col } = getEventCoords(event);
            listener(row, col);
        }
    };
    mouseMoveListeners.push(handleMouseMove);
    canvas.addEventListener('mousemove', handleMouseMove);
};

export const addClickListener = (listener) => {
    let row;
    let col;
    const handleMouseDown = (event) => {
        event.preventDefault();
        if (event.which !== 1) return;
        const downCoords = getEventCoords(event);
        row = downCoords.row;
        col = downCoords.col;
    };
    mouseDownListeners.push(handleMouseDown);
    canvas.addEventListener('mousedown', handleMouseDown);

    const handleMouseUp = (event) => {
        event.preventDefault();
        if (event.which !== 1) return;
        const upCoords = getEventCoords(event);
        if (upCoords.row === row && upCoords.col === col) {
            listener(row, col);
        }
    };
    mouseUpListeners.push(handleMouseUp);
    canvas.addEventListener('mouseup', handleMouseUp);
};

export const addWheelListener = (listener) => {
    wheelListener = listener;
    canvas.addEventListener('wheel', wheelListener);
};

export const cleanupListeners = () => {
    mouseDownListeners.forEach((listener) => {
        canvas.removeEventListener('mousedown', listener);
    });
    mouseDownListeners = [];
    mouseMoveListeners.forEach((listener) => {
        canvas.removeEventListener('mousemove', listener);
    });
    mouseMoveListeners = [];
    mouseUpListeners.forEach((listener) => {
        canvas.removeEventListener('mouseup', listener);
    });
    mouseUpListeners = [];
    documentMouseUpListeners.forEach((listener) => {
        document.removeEventListener('mouseup', listener);
    });
    documentMouseUpListeners = [];
    canvas.removeEventListener('wheel', wheelListener);
};
