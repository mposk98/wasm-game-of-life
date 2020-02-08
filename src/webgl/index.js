import { memory } from 'wasm-game-of-life-rust/wasm_game_of_life_bg'; // eslint-disable-line
import { vsSource } from './vertex-shader';
import { fsSource } from './fragment-shader';

let gl;
let program;
let verticesBuffer;
let colorsBuffer;
let cellsLen;
let vertexArrayLen;
let colorsArrayLen;
let verticesLen;
let scaleFactor = [1.0, 1.0];

export const cleanup = () => {
    gl.useProgram(null);
    if (verticesBuffer) gl.deleteBuffer(verticesBuffer);
    if (colorsBuffer) gl.deleteBuffer(colorsBuffer);
    if (program) gl.deleteProgram(program);
};

export const changeScaleFactor = (delta) => {
    scaleFactor = [
        Math.max(scaleFactor[0] + delta * scaleFactor[0], 1.0),
        Math.max(scaleFactor[1] + delta * scaleFactor[1], 1.0),
    ];
};

const setRenderingContext = (canvas) => {
    gl = canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('Failed to get WebGL context.Your browser or device may not support WebGL.');
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

const linkProgram = () => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
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
        throw new Error(`Shader program did not link successfully. Error log: ${linkErrLog}`);
    }
};

export const init = (canvas, width, height) => {
    setRenderingContext(canvas);
    if (gl === null) return;
    linkProgram();
    cellsLen = width * height;
    vertexArrayLen = 12 * cellsLen;
    colorsArrayLen = 6 * cellsLen;
    verticesLen = 6 * cellsLen;
};

export const cleanupVertices = () => {
    gl.deleteBuffer(verticesBuffer);
};

export const attachVertices = (vertexPtr) => {
    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(aVertexPosition);
    const vertexArray = new Float32Array(memory.buffer, vertexPtr, vertexArrayLen);
    verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
};

export const cleanupColors = () => {
    gl.deleteBuffer(colorsBuffer);
};

export const attachColors = (colorsPtr) => {
    const aVertexColor = gl.getAttribLocation(program, 'aVertexColor');
    gl.enableVertexAttribArray(aVertexColor);
    const colorsArray = new Uint8Array(memory.buffer, colorsPtr, colorsArrayLen);
    colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorsArray, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexColor, 1, gl.UNSIGNED_BYTE, false, 0, 0);
};

export const draw = () => {
    gl.useProgram(program);
    const uScaleFactor = gl.getUniformLocation(program, 'uScaleFactor');
    gl.uniform2fv(uScaleFactor, scaleFactor);
    gl.drawArrays(gl.TRIANGLES, 0, verticesLen);
};
