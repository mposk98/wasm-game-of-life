import { Universe, UniverseMode } from 'wasm-game-of-life-rust'; // eslint-disable-line import/no-unresolved
import * as scene from './webgl';

let size = document.getElementById('universe-options').elements['universe-size'].value;
let universeRows = size;
let universeColumns = size;
const universe = Universe.new(
    universeRows,
    universeColumns,
    UniverseMode.FixedSizePeriodic,
);

scene.init('game-of-life-canvas', universeRows, universeColumns);
scene.attachVertices(universe.webgl_vertices());

const renderScene = () => {
    scene.attachColors(universe.webgl_cells());
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

// const LEFT_BUTTON = 1;
// const RIGHT_BUTTON = 3;

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

// scene.addClickListener((row, col) => {
//     universe.toggle_cell(row, col);
//     requestAnimationFrame(renderScene);
// });

// scene.addMousePressedListener(LEFT_BUTTON, (row, col) => {
//     universe.set_alive(row, col);
//     requestAnimationFrame(renderScene);
// });

// scene.addMousePressedListener(RIGHT_BUTTON, (row, col) => {
//     universe.set_dead(row, col);
//     requestAnimationFrame(renderScene);
// });

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
    universe.reinit_cells(size, size);
    scene.cleanup();
    scene.init('game-of-life-canvas', universeRows, universeColumns);
    scene.attachVertices(universe.webgl_vertices());
    requestAnimationFrame(renderScene);
});

requestAnimationFrame(renderScene);
