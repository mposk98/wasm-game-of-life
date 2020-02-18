export const camera = {
    scaleFactor: 1.0,
    X: 0.0,
    Y: 0.0,
    changeScaleFactor(delta) {
        this.scaleFactor = Math.max(this.scaleFactor + delta * this.scaleFactor, 1.0);
    },
};
