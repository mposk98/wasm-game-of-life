export const vsSource = `
attribute vec2 aVertexPosition;
attribute float aVertexColor;
uniform vec2 uScaleFactor;
varying lowp vec4 vColor;
void main() {
    gl_Position = vec4(aVertexPosition * uScaleFactor, 0.0, 1.0);
    if (aVertexColor > 0.5) {
        vColor = vec4(0.8, 0.8, 0.8, 1.0);
    } else {
        vColor = vec4(0.2, 0.2, 0.4, 1.0);
    }
}
`;
