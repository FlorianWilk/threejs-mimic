uniform float thickness;
//        attribute float thickness;
		attribute float lineMiter;
        attribute vec2 lineNormal;
        void main() {
        vec3 pointPos = position.xyz + vec3( vec2(0,0.0) * (thickness+1.0) / 2.0 * 1.0, 0.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pointPos, 1.0);
        }