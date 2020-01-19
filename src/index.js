import { Universe, Cell, UniverseMode } from 'wasm-game-of-life-rust'; // eslint-disable-line import/no-unresolved
import { memory } from 'wasm-game-of-life-rust/wasm_game_of_life_bg'; // eslint-disable-line import/no-unresolved
import scene from './scene';

const ROWS = 20;
const COLUMNS = 20;
const universe = Universe.new(
    ROWS,
    COLUMNS,
    UniverseMode.FixedSizeNonPeriodic,
);
document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32) {
        event.preventDefault();
        universe.tick();
    }
});

scene.init(ROWS, COLUMNS, 'scene-container');

const LEFT_BUTTON = 1;
const RIGHT_BUTTON = 3;
scene.addClickListener((row, col) => universe.toggle_cell(row, col));
scene.addMousePressedListener(LEFT_BUTTON, (row, col) => universe.set_alive(row, col));
scene.addMousePressedListener(RIGHT_BUTTON, (row, col) => universe.set_dead(row, col));

// document.getElementById('universe-size').addEventListener('submit', (event) => {
//     event.preventDefault();
//     const size = event.target.elements.size.value;
//     universe = Universe.new(size, size, UniverseMode.FixedSizeNonPeriodic);
//     scene.reinit(size, size);
// });

const renderLoop = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, ROWS * COLUMNS);
    scene.draw(cells, Cell.Dead);
    requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);
