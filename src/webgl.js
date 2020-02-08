import { memory } from 'wasm-game-of-life-rust/wasm_game_of_life_bg'; // eslint-disable-line

let gl;
let program;
let buffer;
let colorBuffer;

function cleanup() {
    gl.useProgram(null);
    if (buffer) gl.deleteBuffer(buffer);
    if (colorBuffer) gl.deleteBuffer(colorBuffer);
    if (program) gl.deleteProgram(program);
}

function setRenderingContext() {
    const canvas = document.getElementById('game-of-life-canvas');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl = canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('Failed to get WebGL context.Your browser or device may not support WebGL.');
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

export const init = (webglVerticesPtr, cellsLen) => {
    setRenderingContext();
    if (gl === null) return;

    let source = document.querySelector('#vertex-shader').innerHTML;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, source);
    gl.compileShader(vertexShader);
    source = document.querySelector('#fragment-shader').innerHTML;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, source);
    gl.compileShader(fragmentShader);
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const linkErrLog = gl.getProgramInfoLog(program);
        cleanup();
        console.error(`Shader program did not link successfully. Error log: ${linkErrLog}`);
        return;
    }

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);

    const vertexArray = new Float32Array(memory.buffer, webglVerticesPtr, 12 * cellsLen);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
};

export const draw = (cellsPtr, cellsLen) => {
    const aVertexColor = gl.getAttribLocation(program, 'aVertexColor');
    gl.enableVertexAttribArray(aVertexColor);
    const colors = new Uint8Array(memory.buffer, cellsPtr, 6 * cellsLen);
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexColor, 1, gl.UNSIGNED_BYTE, false, 0, 0);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 6 * cellsLen);
    gl.deleteBuffer(colorBuffer);
};

// window.addEventListener('load', setupWebGL, false);
// setupWebGL();
