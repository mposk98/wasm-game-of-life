import { Universe, Cell, UniverseMode } from 'wasm-game-of-life-rust'; // eslint-disable-line import/no-unresolved
import { memory } from 'wasm-game-of-life-rust/wasm_game_of_life_bg'; // eslint-disable-line import/no-unresolved
import scene from './scene';

const UNIVERSE_HEIGHT = 64;
const UNIVERSE_WIDTH = 64;

const universe = Universe.new(
    UNIVERSE_HEIGHT,
    UNIVERSE_WIDTH,
    UniverseMode.FixedSizeNonPeriodic,
);
const rows = universe.height();
const columns = universe.width();
const cellSize = 12;

scene.init(rows, columns, cellSize);
scene.addClickListener((row, col) => universe.toggle_cell(row, col));
const LEFT_BUTTON = 1;
const RIGHT_BUTTON = 3;
scene.addMousePressedListener(LEFT_BUTTON, (row, col) => universe.set_alive(row, col));
scene.addMousePressedListener(RIGHT_BUTTON, (row, col) => universe.set_dead(row, col));

document.addEventListener('keydown', (event) => {
    if (event.keyCode === 32) {
        universe.tick();
    }
});

const renderLoop = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, rows * columns);
    scene.draw(cells, Cell.Dead);
    requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);
