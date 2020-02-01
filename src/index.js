import { Universe, UniverseMode } from 'wasm-game-of-life-rust'; // eslint-disable-line import/no-unresolved
// import { memory } from 'wasm-game-of-life-rust/wasm_game_of_life_bg'; // eslint-disable-line
// import { scene } from './scene';
import './webgl';

let universeRows = 30;
let universeColumns = 30;
const universe = Universe.new(
    universeRows,
    universeColumns,
    UniverseMode.FixedSizePeriodic,
);

// scene.init(universeRows, universeColumns, 'scene-container');

const renderScene = () => {
    // console.log(universe.render_string());
    // const cellsPtr = universe.cells();
    // const cells = new Uint8Array(memory.buffer, cellsPtr, universeRows * universeColumns);
    // scene.draw(cells);
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

window.addEventListener('resize', () => {
    // scene.setCellSize();
    requestAnimationFrame(renderScene);
});

// prevent submit caused by space keyup
document.addEventListener('keyup', (event) => {
    if (event.keyCode === 32) {
        event.preventDefault();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32) {
        event.preventDefault();
        universe.tick();
        requestAnimationFrame(renderScene);
    }

    if (event.keyCode === 82 && !isRunning) {
        isRunning = true;
        requestAnimationFrame(loop);
    }

    if (event.keyCode === 83 && isRunning) {
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
    const size = event.target.elements['universe-size'].value;
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
    // scene.reinit(size, size);
    // requestAnimationFrame(renderScene);
});

requestAnimationFrame(renderScene);
