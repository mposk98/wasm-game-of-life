export default {
    // private

    htmlElem: document.getElementById('game-of-life-canvas'),
    cellSize: 0,
    rows: 0,
    columns: 0,
    GRID_COLOR: '#121212',
    ALIVE_COLOR: '#DDDDDD',
    DEAD_COLOR: '#353535',

    setHtmlSize(height, width) {
        this.htmlElem.height = height;
        this.htmlElem.width = width;
    },

    getIndex(i, j) {
        return i * this.rows + j;
    },

    drawGrid(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.GRID_COLOR;

        // Vertical lines.
        for (let i = 0; i <= this.columns; i += 1) {
            ctx.moveTo(i * (this.cellSize + 1) + 1, 0);
            ctx.lineTo(i * (this.cellSize + 1) + 1, (this.cellSize + 1) * this.rows + 1);
        }

        // Horizontal lines.
        for (let j = 0; j <= this.rows; j += 1) {
            ctx.moveTo(0, j * (this.cellSize + 1) + 1);
            ctx.lineTo((this.cellSize + 1) * this.columns + 1, j * (this.cellSize + 1) + 1);
        }

        ctx.stroke();
    },

    drawCells(ctx, cells, deadCellValue) {
        ctx.beginPath();

        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.columns; col += 1) {
                const idx = this.getIndex(row, col);

                ctx.fillStyle = cells[idx] === deadCellValue ? this.DEAD_COLOR : this.ALIVE_COLOR;

                ctx.fillRect(
                    col * (this.cellSize + 1) + 1,
                    row * (this.cellSize + 1) + 1,
                    this.cellSize,
                    this.cellSize,
                );
            }
        }

        ctx.stroke();
    },

    // public

    init(rows, columns, cellSize) {
        this.cellSize = cellSize;
        this.rows = rows;
        this.columns = columns;
        // 1px border around each of cells
        this.setHtmlSize((cellSize + 1) * rows + 1, (cellSize + 1) * columns + 1);
    },

    changeCellSize(cellSize) {
        this.cellSize = cellSize;
        this.setHtmlSize((cellSize + 1) * this.rows + 1, (cellSize + 1) * this.columns + 1);
    },

    draw(cells, deadCellValue) {
        const ctx = this.htmlElem.getContext('2d');
        this.drawGrid(ctx);
        this.drawCells(ctx, cells, deadCellValue);
    },

    addClickListener(listener) {
        this.htmlElem.addEventListener('click', (event) => {
            const { x: sceneX, y: sceneY } = this.htmlElem.getBoundingClientRect();
            const relX = event.clientX - sceneX;
            const relY = event.clientY - sceneY;
            const row = (relY / (this.htmlElem.clientHeight / this.rows)) | 0;
            const col = (relX / (this.htmlElem.clientWidth / this.columns)) | 0;
            if (
                row < 0
                || row > this.columns - 1
                || col < 0
                || col > this.rows - 1
            ) {
                return;
            }
            listener(row, col);
        });
    },
};
