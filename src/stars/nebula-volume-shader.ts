/** Camera-correct, front-to-back participating media. The box is only a ray bound. */
export const NEBULA_VOLUME_VERTEX = /* glsl */ `
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
 vLocal=position;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
 #include <logdepthbuf_vertex>
}`;
export const NEBULA_VOLUME_FRAGMENT = /* glsl */ `
precision highp sampler3D;
uniform sampler3D uNoise;
uniform sampler2D uReference;
uniform vec3 uEye,uPrimary,uSecondary;
uniform float uShape,uSteps,uHasReference,uDark,uAspect,uSeed;
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_fragment>
float n(vec3 p){return texture(uNoise,p/32.+uSeed).r;}
float fbm(vec3 p){return n(p)*.56+n(p*2.03+3.1)*.28+n(p*4.07+7.7)*.16;}
float bell(float x,float w){return exp(-x*x/(w*w));}
float ell(vec3 p,vec3 r){return exp(-dot(p/r,p/r)*2.);}
float ring(vec3 p,float r,float w){return bell(length(p.xy)-r,w)*bell(p.z,.19);}
// Each profile encodes observed structure; unobserved depth is a reconstruction.
vec2 structure(vec3 p,float f){
 float gas=0.,dust=0.;float r=length(p.xy);float a=atan(p.y,p.x);
 vec3 q=p+vec3(f-.5,n(p*5.+9.)-.5,n(p*5.+17.)-.5)*.12;
 if(uShape<.5){ // Orion: blister cavity, broad wings and foreground bar
  gas=ell(q-vec3(-.36,.05,0.),vec3(.73,.43,.35))+ell(q-vec3(.42,-.14,.05),vec3(.72,.52,.38));
  gas*=1.-.78*ell(q-vec3(.06,.12,.18),vec3(.31,.28,.27));
  dust=bell(q.y+.2+.32*q.x,.07)*ell(q,vec3(1.,.8,.25));
 }else if(uShape<1.5){ // Eagle: three eroded columns, illuminated cloud behind
  gas=ell(q,vec3(.9,.85,.34))*.45;
  for(int j=0;j<3;j++){float k=float(j);float x=-.42+k*.37;float top=.57-k*.19;
   float column=bell(q.x-x-.055*sin(q.y*8.+k),.075+.025*(.5-q.y))*bell(q.z,.16)*smoothstep(-.8,-.6,q.y)*(1.-smoothstep(top-.1,top+.04,q.y));
   dust+=column*3.;gas+=column*.15+ell(q-vec3(x,top,0.),vec3(.13,.10,.17))*.9;}
 }else if(uShape<2.5){ // Carina: corrugated ionisation front, not a bubble
  float ridge=-.18+.18*sin(q.x*3.5)+.07*sin(q.x*13.);
  gas=bell(q.y-ridge,.17)*ell(q,vec3(1.15,.9,.32));
  dust=(1.-smoothstep(ridge-.18,ridge+.07,q.y))*ell(q,vec3(1.1,.8,.42))*1.7;
 }else if(uShape<3.5){ // Pleiades: separated, wind-combed reflection sheets
  gas=0.;for(int j=0;j<5;j++){float k=float(j);vec3 c=vec3(sin(k*2.4)*.57,cos(k*3.1)*.49,sin(k*4.)*.2);
   gas+=ell(q-c,vec3(.30,.18,.13))*bell(sin(q.x*23.+q.y*7.+k),.65);}
  dust=gas*.18;
 }else if(uShape<4.5){ // Witch Head: elongated, curved molecular cloud
  gas=bell(q.x+.22*sin(q.y*3.8),.16+.09*cos(q.y*5.))*bell(q.y,.7)*bell(q.z,.21);
  dust=gas*.65;
 }else if(uShape<5.5){ // Horsehead: neck and bent head against an emission curtain
  float neck=ell(q-vec3(-.14,-.25,0.),vec3(.19,.57,.22));
  float head=ell(q-vec3(.06,.29,0.),vec3(.33,.17,.22));
  dust=(neck+head)*4.;gas=ell(q-vec3(0.,0.,-.32),vec3(.95,.9,.13))*.75;
 }else if(uShape<6.5){ // Barnard 68: irregular opaque globule with a faint scattered rim
  float body=ell(q,vec3(.55,.66,.43));dust=body*8.;gas=bell(length(q/vec3(.55,.66,.43))-.92,.17)*.11;
 }else if(uShape<7.5){ // M57: thick, hollow barrel; polar gas remains transparent
  gas=bell(length(q.xy/vec2(1.,.83))-.58,.15)*bell(q.z,.40)+ell(q,vec3(.5,.43,.36))*.08;
  dust=gas*.12;
 }else if(uShape<8.5){ // Helix: two tilted toroidal flows and outer knots
  gas=ring(q,.62,.12)+ring(vec3(q.x,q.y*.86+q.z*.45,q.z*.86-q.y*.45),.79,.065)*.42;
  gas+=ring(q,.55,.20)*pow(max(0.,sin(a*41.+f*6.)),10.)*.5;dust=gas*.22;
 }else if(uShape<9.5){ // Cat's Eye: nested, intersecting ellipsoidal shells
  gas=bell(length(q/vec3(.40,.7,.35))-1.,.10)+bell(length(q/vec3(.65,.44,.43))-1.,.08)*.65;
  gas+=bell(length(q/vec3(.78,.85,.65))-1.,.055)*.18;dust=gas*.12;
 }else if(uShape<10.5){ // Butterfly / Homunculus: hollow bipolar lobes, opaque waist
  float y=abs(q.y);float width=.08+.60*pow(y,.7);
  gas=bell(length(q.xz)-width,.10)*bell(y-.48,.35)*(1.-smoothstep(.80,1.,y));
  dust=ell(q,vec3(.46,.08,.35))*4.;
 }else if(uShape<11.5){ // Crab: tangled ejecta surrounding a softer synchrotron interior
  float e=length(q/vec3(.78,.93,.58));
  gas=bell(e-.80,.18)*smoothstep(.41,.66,f)*3.+ell(q,vec3(.51,.64,.42))*.22;dust=gas*.23;
 }else if(uShape<12.5){ // Veil: thin folded shock ribbons, open arcs
  float curve=.40*sin(q.x*2.8)+.12*sin(q.x*8.);
  gas=(bell(q.y-curve-.24,.025)+bell(q.y-curve+.29,.038))*bell(q.x,.85)*bell(q.z+.16*sin(q.x*4.),.13);
  dust=gas*.08;
 }else if(uShape<13.5){ // Cassiopeia A: ruptured, clumpy ejecta shell
  gas=bell(length(q/vec3(.76,.79,.66))-.91,.13)*smoothstep(.34,.65,f)*2.6;
  gas*=.65+.35*sin(a*7.+q.z*5.);dust=gas*.3;
 }else if(uShape<14.5){ // Rosette: wind-carved cavity, scalloped wall and dust fingers
  gas=bell(r-(.63+.055*sin(a*9.)),.19)*bell(q.z,.31);
  dust=gas*smoothstep(.48,.68,f)*1.5;
 }else if(uShape<15.5){ // Tarantula: intersecting superbubbles and filament networks
  gas=bell(length(q-vec3(.22,.10,0.))-.52,.11)+bell(length(q-vec3(-.41,-.13,.08))-.42,.09)*.7;
  gas*=ell(q,vec3(1.2,.9,.6))*(.25+f);dust=ell(q,vec3(1.,.6,.32))*smoothstep(.51,.7,f)*2.;
 }else if(uShape<16.5){ // Lagoon: bright ionisation front split by a foreground dust ridge
  gas=ell(q,vec3(.85,.78,.35))*(.35+f)+ell(q-vec3(.24,.14,.08),vec3(.18,.27,.2));
  dust=bell(q.x+.15*sin(q.y*5.),.12)*ell(q,vec3(.9,.85,.35))*2.5;
 }else if(uShape<17.5){ // Trifid: three radial dust lanes and a northern reflection cloud
  gas=ell(q-vec3(0.,-.22,0.),vec3(.67,.59,.31))+ell(q-vec3(.12,.62,.03),vec3(.44,.30,.26))*.45;
  float lanes=pow(max(0.,cos(a*3.+.5)),18.);dust=lanes*smoothstep(.04,.18,r)*bell(r,.62)*bell(q.z,.25)*3.;
 }else if(uShape<18.5){ // SN1987A: three gas rings, not solid torus meshes
  gas=ring(q,.46,.035)+ring(vec3(q.x,q.y-.42,q.z+.22*q.y),.68,.035)*.35+ring(vec3(q.x,q.y+.42,q.z-.22*q.y),.68,.035)*.35;dust=gas*.15;
 }else if(uShape<19.5){ // WR104: a thin Archimedean dust spiral
  float spiral=abs(fract((r-.03)/.24-a/6.2831853+.5)-.5)*.24;
  gas=bell(spiral,.018)*bell(q.z,.065)*smoothstep(.02,.10,r)*(1.-smoothstep(.74,.95,r));dust=gas*.55;
 }else{gas=ell(q,vec3(.85,.43,.65))*smoothstep(.35,.68,f);dust=gas*.4;}
 return vec2(gas,dust);
}
void main(){
 #include <logdepthbuf_fragment>
 vec3 ray=normalize(vLocal-uEye);
 // Robust slab intersection also handles a camera inside the proxy.
 vec3 safeRay=mix(vec3(.000001),ray,step(vec3(.000001),abs(ray)));
 vec3 inv=1./safeRay;
 vec3 t0=(-vec3(1.6)-uEye)*inv,t1=(vec3(1.6)-uEye)*inv;
 vec3 lo=min(t0,t1),hi=max(t0,t1);
 float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(hi.x,min(hi.y,hi.z));
 if(end<=start)discard;
 float stepSize=(end-start)/uSteps;
 // Resolve the thinnest observed filament sheet analytically, so it is never
 // blurred into radial streaks or skipped between volume samples on zoom-in.
 float sheetT=-uEye.z/(abs(ray.z)>.0001?ray.z:.0001);
 for(int k=0;k<4;k++){
  vec3 h=uEye+ray*sheetT;float depth=(fbm(vec3(h.xy*3.,uSeed))-.5)*.18;
  sheetT=(depth-uEye.z)/(abs(ray.z)>.0001?ray.z:.0001);
 }
 vec3 sheetP=uEye+ray*sheetT;
 vec2 sheetUV=sheetP.xy*.43+vec2(.5);
 sheetUV.x=.5+(sheetUV.x-.5)/max(1.,uAspect);sheetUV.y=.5+(sheetUV.y-.5)*min(1.,uAspect);
 vec3 sharp=texture2D(uReference,sheetUV).rgb;
 vec3 smoothPhoto=textureLod(uReference,sheetUV,4.).rgb;
 // Stars in the thin observed sheet remain sharp; only the surrounding volume uses a coarse guide.
 float photoLuma=dot(sharp,vec3(.2126,.7152,.0722));
 float photoFrame=smoothstep(.015,.14,sheetUV.x)*smoothstep(.015,.14,sheetUV.y)*(1.-smoothstep(.86,.985,sheetUV.x))*(1.-smoothstep(.86,.985,sheetUV.y));
 float silhouette=length((sheetUV-.5)*2.);
 float feather=1.-smoothstep(.56,.99,silhouette+(fbm(vec3(sheetP.xy*8.,uSeed))-.5)*.20);
 photoFrame*=feather;
 float darkGuide=uShape>4.5&&uShape<5.5?.75:uShape>5.5&&uShape<6.5?.45:1.-uDark;
 float photoAlpha=(1.-exp(-photoLuma*5.))*photoFrame*uHasReference*darkGuide*smoothstep(.015,.12,abs(ray.z));
 vec3 sheetColor=sharp/(max(max(sharp.r,sharp.g),sharp.b)+.035)*10.;
 if(uShape>13.5&&uShape<14.5)sheetColor=mix(uPrimary,uSecondary,clamp(sheetP.y*.4+.5,0.,1.))*10.;
 float jitter=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 vec3 sum=vec3(0.);float trans=1.;
 for(int i=0;i<88;i++){
  if(float(i)>=uSteps||trans<.015)break;
  float segmentStart=start+float(i)*stepSize;
  if(sheetT>=segmentStart&&sheetT<segmentStart+stepSize){
   sum+=trans*photoAlpha*sheetColor;trans*=1.-photoAlpha;
  }
  vec3 p=uEye+ray*(segmentStart+jitter*stepSize);
  // Compact support reaches zero before every face; no spherical or box outline.
  float edge=1.-smoothstep(1.08,1.40,max(abs(p.x),max(abs(p.y),abs(p.z))));
  if(edge<.001)continue;
  float f=fbm(p*7.);vec2 media=structure(p,f);
  float fine=n(p*67.+11.);float turbulence=smoothstep(.23,.78,f)*(.7+.6*fine);
  vec2 uv=p.xy*.43+vec2(.5);uv.x=.5+(uv.x-.5)/max(1.,uAspect);uv.y=.5+(uv.y-.5)*min(1.,uAspect);
  // Texture coordinates stay in object space; geometry supplies parallax, never a camera-facing billboard.
  vec3 photo=textureLod(uReference,uv,4.).rgb;
  vec3 broad=photo;
  float lum=dot(broad,vec3(.2126,.7152,.0722));
  float frame=smoothstep(0.,.10,uv.x)*smoothstep(0.,.10,uv.y)*(1.-smoothstep(.90,1.,uv.x))*(1.-smoothstep(.90,1.,uv.y));
  // An isolated stellar point must not become a luminous column through the cloud.
  float starReject=1.-smoothstep(.13,.65,max(photo.r,max(photo.g,photo.b))-max(broad.r,max(broad.g,broad.b)));
  vec3 observed=mix(broad,photo,starReject*.72);
  float guide=mix(1.,(.24+pow(max(lum,0.),.55)*2.5)*frame,uHasReference);
  float gas=media.x*turbulence*edge*guide*.45;
  float dust=media.y*(.35+f)*edge;
  float alpha=1.-exp(-(gas*1.9+dust*2.4)*stepSize);
  vec3 palette=mix(uPrimary,uSecondary,smoothstep(.28,.73,f+p.y*.15));
  vec3 photoColor=observed/(max(max(observed.r,observed.g),observed.b)+.04);
  vec3 color=mix(palette,photoColor,uHasReference*.78);
  float illumination=gas/(gas+dust*1.8+.0001);
  vec3 source=color*(15.+lum*9.)*illumination+vec3(.018,.012,.008)*(1.-illumination);
  source*=mix(1.,.40,uDark);
  if(uShape>19.5)source*=.20;
  sum+=trans*alpha*source;trans*=1.-alpha;
 }
 float opacity=1.-trans;if(opacity<.002)discard;
 gl_FragColor=vec4(sum/max(opacity,.001),opacity);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
