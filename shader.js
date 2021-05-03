let Shaders = {}
Shaders.S01 = {
    name: 'S01',
    uniforms: {
        'time': { type: 'f', value: 1.0 },
        'textureA': { value: null },
        'textureB': { value: null }
    },
    vertexShader:
    `uniform float time;
    uniform sampler2D textureA;
    uniform sampler2D textureB;
    varying vec2 vUv;
    void main(){
        vec3 pos = position;
        vec4 color = texture2D(textureA, uv);
        pos.z += color.r;
		pos.z += color.g;
		pos.z += color.b;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`,
    fragmentShader:
    `uniform sampler2D textureB;
	varying vec2 vUv;
	void main() {	
		gl_FragColor = texture2D(textureB, vUv);
	}`
};