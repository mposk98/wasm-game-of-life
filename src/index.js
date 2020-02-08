import { Universe, UniverseMode } from 'wasm-game-of-life-rust'; // eslint-disable-line import/no-unresolved
import * as scene from './webgl';
import * as controller from './controller';

const canvas = document.getElementById('game-of-life-canvas');

let size = document.getElementById('universe-options').elements['universe-size'].value;
let universeRows = size;
let universeColumns = size;
const universe = Universe.new(
    universeRows,
    universeColumns,
    UniverseMode.FixedSizePeriodic,
);

const CELL_SIZE_COEF = 0.8;

scene.init(canvas, universeRows, universeColumns);
scene.attachVertices(universe.webgl_vertices(CELL_SIZE_COEF));

const renderScene = () => {
    scene.attachColors(universe.webgl_colors());
    scene.draw();
    scene.cleanupColors();
};

let isRunning = false;

const loop = () => {
    if (!isRunning) return;
    renderScene();
    universe.tick();
    requestAnimationFrame(loop);
};

// window.addEventListener('resize', () => {
//     // scene.setCellSize();
//     // requestAnimationFrame(renderScene);
// });

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

controller.init(canvas, universeColumns, universeRows);

const addListeners = () => {
    controller.addClickListener((row, col) => {
        universe.toggle_cell(row, col);
        requestAnimationFrame(renderScene);
    });

    controller.addMousePressedListener(LEFT_BUTTON, (row, col) => {
        universe.set_alive(row, col);
        requestAnimationFrame(renderScene);
    });

    controller.addMousePressedListener(RIGHT_BUTTON, (row, col) => {
        universe.set_dead(row, col);
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
    scene.cleanup();
    scene.init(canvas, universeRows, universeColumns);
    scene.attachVertices(universe.webgl_vertices(CELL_SIZE_COEF));
    controller.cleanupListeners();
    controller.init(canvas, universeColumns, universeRows);
    addListeners();
    requestAnimationFrame(renderScene);
});

requestAnimationFrame(renderScene);
