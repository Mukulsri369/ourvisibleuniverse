import * as THREE from "three";
import { GALAXY_MEDIUM } from "./galaxy-medium";
/** Incremental full-resolution density and conservative padded empty-space bounds. */
export class GalaxyDensityCache {
  target: THREE.WebGL3DRenderTarget;
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  geometry = new THREE.PlaneGeometry(2, 2);
  material: THREE.ShaderMaterial;
  layer = 0;
  occupancyLayer = 0;
  private warming = false;
  private occupancyCompiled = false;
  private warmTask: Promise<void> | null = null;
  occupancy: THREE.WebGL3DRenderTarget | null = null;
  occupancyMaterial: THREE.ShaderMaterial | null = null;
  occupancyScene = new THREE.Scene();
  readonly occupancySize: number;
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
    this.occupancySize = Math.ceil(size / 4);
    if (!(uniforms.uFeature.value > 9.5 && uniforms.uFeature.value < 11.5)) return;
    this.occupancy = new THREE.WebGL3DRenderTarget(
      this.occupancySize,
      this.occupancySize * 2,
      this.occupancySize,
      {
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      },
    );
    this.occupancy.texture.name = "Conservative galaxy empty-space bounds";
    this.occupancyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSource: { value: this.target.texture },
        uLayer: { value: 0 },
        uBlockEnd: { value: 5 },
      },
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader: `precision highp sampler3D;
        uniform sampler3D uSource;uniform float uLayer;uniform int uBlockEnd;layout(location=0)out vec4 occupancyOutput;
        void main(){ivec3 base=ivec3(gl_FragCoord.xy,uLayer)*4;ivec3 maximum=textureSize(uSource,0)-1;float bound=0.;
        // One source-voxel padding bounds interpolation across every cell face.
        for(int z=-1;z<uBlockEnd;z++)for(int y=-1;y<uBlockEnd;y++)for(int x=-1;x<uBlockEnd;x++){
          vec4 v=texelFetch(uSource,clamp(base+ivec3(x,y,z),ivec3(0),maximum),0);
          bound=max(bound,max(max(v.r,v.g),max(v.b,v.a)));
        }occupancyOutput=vec4(bound);}
      `,
    });
    this.occupancyScene.add(new THREE.Mesh(this.geometry, this.occupancyMaterial));
  }
  bake(gl: THREE.WebGLRenderer) {
    if (this.occupancy && !this.warming) {
      this.warming = true;
      const previous = gl.getRenderTarget(),
        face = gl.getActiveCubeFace(),
        mip = gl.getActiveMipmapLevel(),
        test = gl.getScissorTest();
      gl.getViewport(this.viewport);
      gl.getScissor(this.scissor);
      try {
        // Compile the same linear render-target variant used by the bake.
        gl.setRenderTarget(this.occupancy, 0);
        gl.setScissorTest(false);
        this.warmTask = gl
          .compileAsync(this.occupancyScene, this.camera)
          .then(() => {
            this.occupancyCompiled = true;
          })
          .catch(() => {
            this.occupancyCompiled = false;
          });
      } finally {
        gl.setRenderTarget(previous, face, mip);
        gl.setViewport(this.viewport);
        gl.setScissor(this.scissor);
        gl.setScissorTest(test);
      }
    }
    if (this.layer >= this.size && (!this.occupancy || this.occupancyLayer >= this.occupancySize))
      return true;
    const target = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel(),
      test = gl.getScissorTest();
    gl.getViewport(this.viewport);
    gl.getScissor(this.scissor);
    try {
      if (this.layer < this.size) {
        for (let i = 0; i < 3 && this.layer < this.size; i++, this.layer++) {
          this.material.uniforms.uLayer.value = this.layer;
          gl.setRenderTarget(this.target, this.layer);
          gl.setScissorTest(false);
          gl.render(this.scene, this.camera);
        }
      } else if (this.occupancy && this.occupancyMaterial && this.occupancyCompiled) {
        for (
          let i = 0;
          i < 2 && this.occupancyLayer < this.occupancySize;
          i++, this.occupancyLayer++
        ) {
          this.occupancyMaterial.uniforms.uLayer.value = this.occupancyLayer;
          gl.setRenderTarget(this.occupancy, this.occupancyLayer);
          gl.setScissorTest(false);
          gl.render(this.occupancyScene, this.camera);
        }
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
    this.occupancy?.dispose();
    this.geometry.dispose();
    this.material.dispose();
    const material = this.occupancyMaterial;
    // Keep an in-flight program alive until the parallel compiler finishes.
    if (this.warmTask && !this.occupancyCompiled)
      void this.warmTask.then(() => material?.dispose());
    else material?.dispose();
  }
}
