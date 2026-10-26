import { NEBULA_RADIANCE } from "./nebula-radiance";
import * as THREE from "three";
import { NEBULA_MEDIUM } from "./nebula-medium";
/** One selected volume, baked a few slices per frame. No CPU readbacks. */
export class NebulaDensityCache {
  target: THREE.WebGL3DRenderTarget;
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  material: THREE.ShaderMaterial;
  geometry = new THREE.PlaneGeometry(2, 2);
  layer = 0;
  reference: THREE.Texture;
  viewport = new THREE.Vector4();
  scissor = new THREE.Vector4();
  constructor(
    uniforms: Record<string, THREE.IUniform>,
    readonly size = 128,
  ) {
    this.reference = uniforms.uReference.value;
    this.target = new THREE.WebGL3DRenderTarget(size, size, size, {
      count: 2,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.target.texture.name = "Selected nebula density";
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uReference: { value: uniforms.uReference.value },
        uHasReference: { value: 0 },
        uPrimary: uniforms.uPrimary,
        uSecondary: uniforms.uSecondary,
        uLight: uniforms.uLight,
        uDark: uniforms.uDark,
        uAspect: { value: 1 },
        uNoise: uniforms.uNoise,
        uShape: uniforms.uShape,
        uSeed: uniforms.uSeed,
        uLayer: { value: 0 },
        uSize: { value: size },
      },
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader:
        "precision highp sampler3D;uniform sampler3D uNoise;uniform float uShape,uSeed,uLayer,uSize;\n" +
        NEBULA_MEDIUM +
        NEBULA_RADIANCE +
        "\nlayout(location=0)out vec4 densityOutput;layout(location=1)out vec4 emissionOutput;void main(){vec3 p=(vec3(gl_FragCoord.xy,uLayer+.5)/uSize-.5)*3.2;vec2 medium=nebulaMedium(p);densityOutput=vec4(medium,0.,1.);emissionOutput=vec4(nebulaSource(p,medium),1.);}",
    });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
  }
  bake(gl: THREE.WebGLRenderer, uniforms: Record<string, THREE.IUniform>) {
    if (this.reference !== uniforms.uReference.value) {
      this.reference = uniforms.uReference.value;
      this.material.uniforms.uReference.value = this.reference;
      this.material.uniforms.uHasReference.value = 1;
      this.material.uniforms.uAspect.value = uniforms.uAspect.value;
      this.layer = 0;
    }
    if (this.layer >= this.size) return true;
    const previous = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel(),
      test = gl.getScissorTest();
    gl.getViewport(this.viewport);
    gl.getScissor(this.scissor);
    try {
      for (let i = 0; i < 4 && this.layer < this.size; i++, this.layer++) {
        this.material.uniforms.uLayer.value = this.layer;
        gl.setRenderTarget(this.target, this.layer);
        gl.setScissorTest(false);
        gl.render(this.scene, this.camera);
      }
    } finally {
      gl.setRenderTarget(previous, face, mip);
      gl.setViewport(this.viewport);
      gl.setScissor(this.scissor);
      gl.setScissorTest(test);
    }
    return this.layer >= this.size;
  }
  dispose() {
    this.target.dispose();
    this.geometry.dispose();
    this.material.dispose();
  }
}
export const NEBULA_CACHED_MEDIUM = /* glsl */ `uniform sampler3D uDensity;uniform float uDensityReady;
vec2 sampleNebula(vec3 p){if(uDensityReady>.5){vec3 uv=p/3.2+.5;if(any(lessThan(uv,vec3(0.)))||any(greaterThan(uv,vec3(1.))))return vec2(0.);return texture(uDensity,uv).rg;}return vec2(0.);}`;
