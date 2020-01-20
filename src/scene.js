export default {
    // private

    htmlElem: document.getElementById('game-of-life-canvas'),
    cellSize: 0,
    rows: 0,
    columns: 0,
    GRID_COLOR: 'rgb(8, 8, 15)',
    ALIVE_COLOR: 'rgb(200, 200, 220)',
    DEAD_COLOR: 'rgb(40, 40, 52)',
    htmlContainerId: '',

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

    getEventCoords(event) {
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
            return null;
        }
        return { row, col };
    },

    getCellSize() {
        this.htmlElem.height = 0;
        this.htmlElem.width = 0;
        const sceneContainer = document.getElementById(this.htmlContainerId);
        const size = this.rows;
        if (sceneContainer.clientWidth > sceneContainer.clientHeight) {
            return ((sceneContainer.clientHeight + 1) / size) - 1 | 0;
        }
        return ((sceneContainer.clientWidth + 1) / size) - 1 | 0;
    },

    // public

    init(rows, columns, htmlContainerId) {
        this.rows = rows;
        this.columns = columns;
        this.htmlContainerId = htmlContainerId;
        this.setCellSize();
        this.htmlElem.oncontextmenu = (event) => {
            event.preventDefault();
        };
    },

    reinit(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.setCellSize();
    },

    setCellSize() {
        this.cellSize = this.getCellSize();
        // 1px border around each of cells
        this.setHtmlSize(
            (this.cellSize + 1) * this.rows + 1,
            (this.cellSize + 1) * this.columns + 1,
        );
    },

    draw(cells, deadCellValue) {
        const ctx = this.htmlElem.getContext('2d');
        this.drawGrid(ctx);
        this.drawCells(ctx, cells, deadCellValue);
    },

    addClickListener(listener) {
        let row;
        let col;
        this.htmlElem.addEventListener('mousedown', (event) => {
            event.preventDefault();
            if (event.which !== 1) return;
            const downCoords = this.getEventCoords(event);
            row = downCoords.row;
            col = downCoords.col;
        });
        this.htmlElem.addEventListener('mouseup', (event) => {
            event.preventDefault();
            if (event.which !== 1) return;
            const upCoords = this.getEventCoords(event);
            if (upCoords.row === row && upCoords.col === col) {
                listener(row, col);
            }
        });
    },

    addMousePressedListener(btnNum, listener) {
        let isPressed = false;
        this.htmlElem.addEventListener('mousedown', (event) => {
            event.preventDefault();
            if (event.which === btnNum) {
                isPressed = true;
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (event.which === btnNum) {
                isPressed = false;
            }
        });

        this.htmlElem.addEventListener('mousemove', (event) => {
            event.preventDefault();
            if (isPressed === true && event.which === btnNum) {
                const { row, col } = this.getEventCoords(event);
                listener(row, col);
            }
        });
    },
};
