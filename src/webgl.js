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
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('Failed to get WebGL context.Your browser or device may not support WebGL.');
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setupWebGL() {
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

    const vertexArray = new Float32Array([
        -0.8, 0.8,
        0.5, 0.5,
        0.5, -0.5,
        -0.5, 0.5,
    ]);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);

    const aVertexColor = gl.getAttribLocation(program, 'aVertexColor');
    gl.enableVertexAttribArray(aVertexColor);
    const colors = [
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 1.0, 0.0, 1.0, // green
        0.0, 0.0, 1.0, 1.0, // blue
    ];
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aVertexColor, 4, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, 4);

    cleanup();
}

// window.addEventListener('load', setupWebGL, false);
setupWebGL();
