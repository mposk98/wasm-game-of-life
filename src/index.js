import { Universe, UniverseMode } from 'wasm-game-of-life-rust'; // eslint-disable-line import/no-unresolved
import { life } from './life';

const canvas = document.getElementById('game-of-life-canvas');

const setCanvasSize = () => {
    const { width, height } = document.getElementById('scene-container').getBoundingClientRect();
    const size = Math.min(width, height);
    canvas.width = size | 0;
    canvas.height = size | 0;
};

setCanvasSize();

let size = document.getElementById('universe-options').elements['universe-size'].value;
let universeRows = size;
let universeColumns = size;
const universe = Universe.new(
    universeRows,
    universeColumns,
    UniverseMode.FixedSizePeriodic,
);

const CELL_SIZE_COEF = 0.9;

life.scene.init(canvas, universeRows, universeColumns);
life.scene.attachVertices(universe.webgl_vertices(CELL_SIZE_COEF));

const renderScene = () => {
    life.scene.attachColors(universe.webgl_colors());
    life.scene.draw();
    life.scene.cleanupColors();
};

let isRunning = false;

const loop = () => {
    if (!isRunning) return;
    renderScene();
    universe.tick();
    requestAnimationFrame(loop);
};

window.addEventListener('resize', () => {
    setCanvasSize();
    life.scene.cleanup();
    life.scene.init(canvas, universeRows, universeColumns);
    life.scene.attachVertices(universe.webgl_vertices(CELL_SIZE_COEF));
    requestAnimationFrame(renderScene);
});

// prevent submit caused by space keyup
document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        universe.tick();
        requestAnimationFrame(renderScene);
    }

    if (event.code === 'KeyR' && !isRunning) {
        isRunning = true;
        requestAnimationFrame(loop);
    }

    if (event.code === 'KeyS' && isRunning) {
        isRunning = false;
    }
});

const LEFT_BUTTON = 1;
const RIGHT_BUTTON = 3;

life.controller.init(canvas, universeColumns, universeRows);

const addListeners = () => {
    life.controller.addClickListener((row, col) => {
        universe.toggle_cell(row, col);
        requestAnimationFrame(renderScene);
    });

    life.controller.addMousePressedListener(LEFT_BUTTON, (row, col) => {
        universe.set_alive(row, col);
        requestAnimationFrame(renderScene);
    });

    life.controller.addMousePressedListener(RIGHT_BUTTON, (row, col) => {
        universe.set_dead(row, col);
        requestAnimationFrame(renderScene);
    });

    life.controller.addWheelListener((event) => {
        event.preventDefault();
        life.camera.changeScaleFactor(event.deltaY * -0.001);
        requestAnimationFrame(renderScene);
    });
};
addListeners();

document.getElementById('universe-options').addEventListener('submit', (event) => {
    event.preventDefault();
    isRunning = false;
    size = event.target.elements['universe-size'].value;
    const mode = event.target.elements['universe-mode'].value;
    if (mode === 'periodic') {
        universe.set_mode(UniverseMode.FixedSizePeriodic);
    }
    if (mode === 'non-periodic') {
        universe.set_mode(UniverseMode.FixedSizeNonPeriodic);
    }
    universeRows = size;
    universeColumns = size;
    universe.reinit_cells(universeRows, universeColumns);
    life.scene.cleanup();
    life.scene.init(canvas, universeRows, universeColumns);
    life.scene.attachVertices(universe.webgl_vertices(CELL_SIZE_COEF));
    life.controller.cleanupListeners();
    life.controller.init(canvas, universeColumns, universeRows);
    addListeners();
    requestAnimationFrame(renderScene);
});

requestAnimationFrame(renderScene);
