import * as THREE from "three";
import { GALAXY_MEDIUM } from "./galaxy-medium";
/** One selected galaxy; bounded incremental GPU baking, with render state restored. */
export class GalaxyDensityCache {
  target: THREE.WebGL3DRenderTarget;
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  geometry = new THREE.PlaneGeometry(2, 2);
  material: THREE.ShaderMaterial;
  layer = 0;
  viewport = new THREE.Vector4();
  scissor = new THREE.Vector4();
  constructor(
    uniforms: Record<string, THREE.IUniform>,
    readonly size = 96,
  ) {
    this.target = new THREE.WebGL3DRenderTarget(size, size * 2, size, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.target.texture.name = "Selected galaxy emissivity and dust";
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        ...uniforms,
        uTime: { value: 0 },
        uLayer: { value: 0 },
        uSize: { value: new THREE.Vector3(size, size * 2, size) },
      },
      defines: uniforms.uPopKind?.value > 0 ? { GALAXY_POPULATION: 1 } : {},
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader:
        "precision highp sampler3D;uniform float uLayer;uniform vec3 uSize;\n" +
        GALAXY_MEDIUM +
        "\nlayout(location=0)out vec4 fieldOutput;void main(){vec3 p=(vec3(gl_FragCoord.xy,uLayer+.5)/uSize-.5)*2.7;float dust;vec3 emission=populations(p,dust);fieldOutput=vec4(emission,dust);}",
    });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
  }
  bake(gl: THREE.WebGLRenderer) {
    if (this.layer >= this.size) return true;
    const target = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel(),
      test = gl.getScissorTest();
    gl.getViewport(this.viewport);
    gl.getScissor(this.scissor);
    try {
      for (let i = 0; i < 3 && this.layer < this.size; i++, this.layer++) {
        this.material.uniforms.uLayer.value = this.layer;
        gl.setRenderTarget(this.target, this.layer);
        gl.setScissorTest(false);
        gl.render(this.scene, this.camera);
      }
    } finally {
      gl.setRenderTarget(target, face, mip);
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
