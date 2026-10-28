export const BLACK_HOLE_VERTEX = /*glsl*/ `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}
`;
export const BLACK_HOLE_FRAGMENT = /*glsl*/ `
precision highp float;
uniform sampler2D tDiffuse,uNoise;
uniform samplerCube uSky;
uniform mat3 uCameraToDisk,uDiskToWorld,uWorldToCamera;
uniform vec3 uEye;
uniform vec2 uResolution;
uniform vec2 uView; // tan(vertical FOV/2), aspect
uniform float uViewGain,uContrast;
uniform float uTime,uInner,uOuter,uIntensity,uOpacity,uDisk,uHotFlow,uFall,uStep,uSkyReady,uActivation,uTidal,uJourneyProgress,uFlightTime;
varying vec2 vUv;
float noise(vec2 p,float lod){return textureLod(uNoise,p,lod).r;}
// Circular embedding has identical values and derivatives at +/- pi.
float flowNoise(float angle,float radial,float frequency,vec2 drift,float lod){
 return noise(vec2(cos(angle),sin(angle))*frequency+vec2(radial*.023,radial*.047)+drift,lod);
}
float opticalCoverage(float r,float influence){return mix(influence,1.,1.-smoothstep(24.,70.,r));}
vec3 sky(vec3 diskDirection){
 vec3 world=normalize(uDiskToWorld*diskDirection);
 vec3 color=textureLod(uSky,world,0.).rgb*uSkyReady;
 vec3 view=uWorldToCamera*world;
 if(view.z<-.001){vec2 uv=view.xy/(-view.z)/vec2(uView.x*uView.y,uView.x)*.5+.5;
  float edge=min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y));
  float screenWeight=smoothstep(.003,.045,edge);
  if(screenWeight>0.)color=mix(color,textureLod(tDiffuse,clamp(uv,vec2(0.),vec2(1.)),0.).rgb,screenWeight); }
 return color;
}
vec4 diskEmission(vec3 hit,vec3 tangent,float observerR){
 float r=length(hit.xz);if(r<uInner||r>uOuter||uDisk<.5)return vec4(0.);
 float a=atan(hit.z,hit.x);
 float omega=1./pow(max(r,1.3),1.5);
 // Blend continuously between advected turbulence patches. Bounded shear
 // prevents a long-running simulation winding its texture into subpixel rings.
 float cycle=floor(uTime/48.),age=mod(uTime,48.),blend=smoothstep(0.,48.,age);
 float phase=a-age*omega*.62,phaseNext=a-(age-48.)*omega*.62;
 vec2 drift=fract(vec2(.371,.619)*cycle),nextDrift=fract(drift+vec2(.371,.619));
 float pixelWorld=2.*uView.x*length(uEye-hit)/max(uResolution.y,1.)/max(.15,abs(normalize(tangent).y));
 float lod=clamp(log2(max(1.,pixelWorld/r*1024.*.18)),0.,6.);
 // Magnetically sheared, broken azimuthal streaks, not perfect decorative rings.
 float coarse=mix(flowNoise(phase,log(r),.021,drift,lod),flowNoise(phaseNext,log(r),.021,nextDrift,lod),blend);
 float fine=mix(flowNoise(phase*3.+coarse*.015,log(r)*3.,.047,drift,min(lod+.25,7.)),flowNoise(phaseNext*3.+coarse*.015,log(r)*3.,.047,nextDrift,min(lod+.25,7.)),blend);
 float streams=coarse*.68+fine*.32;
 float inner=smoothstep(uInner,uInner+.55,r),outer=1.-smoothstep(uOuter*.72,uOuter,r);
 float radial=pow(uInner/r,3.)*(1.-sqrt(uInner/r));
 float density=(.45+coarse*.45+fine*.25+streams*.25)*inner*outer;
 vec3 gasVelocity=normalize(vec3(-hit.z,0.,hit.x));
 float beta=min(.64,sqrt(1./max(2.*(r-1.),1.)));
 float doppler=sqrt(1.-beta*beta)/max(.25,1.+beta*dot(normalize(tangent),gasVelocity));
 float gravity=sqrt(max(.01,1.-1./r)/max(.025,1.-1./observerR));
 float shift=clamp(gravity*doppler,.18,2.5);
 float temperature=clamp(pow(max(radial*24.,.001),.25)*shift,0.,1.5);
 vec3 hot=mix(vec3(1.,.12,.015),vec3(1.,.78,.36),smoothstep(.25,.85,temperature));
 hot=mix(hot,vec3(.78,.9,1.),smoothstep(.85,1.4,temperature)*.8);
 float power=clamp(pow(shift,3.),.035,7.);
 float alpha=1.-exp(-density*uOpacity/max(.17,abs(normalize(tangent).y)));
 float filaments=.20+.80*smoothstep(.18,.82,streams);
 float emission=(.012+radial*32.)*power*filaments*(.92+fine*.08)*uIntensity*20.;
 emission=18.*(1.-exp(-emission/18.));
 return vec4(pow(max(hot*emission,vec3(0.)),vec3(uContrast))*uViewGain,clamp(alpha,0.,.98));
}
// Second-order asymptotic transport for outer, weakly bent primary images.
// Strong-field rays and all photon-ring images always use geodesic integration.
vec3 weakPath(float s,vec3 d,vec3 offset,float z0,float ro,out vec3 tangent){
 float b2=max(dot(offset,offset),.001),b=sqrt(b2),z=z0+s,r=sqrt(b2+z*z);
 float factor=(1.+1.4726216/b)/b2;
 tangent=normalize(d-offset*factor*(z/r-z0/ro));
 return uEye+d*s-offset*factor*(r-ro-s*z0/ro);
}
vec3 weakTransport(vec3 d,float ro,out float valid){
 float z0=dot(uEye,d);vec3 offset=uEye-d*z0;float b2=max(dot(offset,offset),.001);
 vec3 escaped=normalize(d-offset*(1.+1.4726216/sqrt(b2))/b2*(1.-z0/ro));
 vec3 background=sky(escaped);valid=1.;
 if(uDisk<.5)return background;
 if(abs(d.y)<.04){valid=0.;return background;}
 float t=-uEye.y/d.y;
 if(t<0.)return background;
 vec3 tangent,hit;
 for(int j=0;j<5;j++){
  hit=weakPath(t,d,offset,z0,ro,tangent);
  float dy=tangent.y;if(abs(dy)<.005){valid=0.;return background;}
  // Derivative magnitude differs only at second order; the bounded Newton
  // solve is continuous across zoom and avoids stepped disk intersections.
  t=clamp(t-hit.y/dy,0.,ro*3.+uOuter*3.);
 }
 hit=weakPath(t,d,offset,z0,ro,tangent);
 if(abs(hit.y)>.003*max(1.,length(hit))){valid=0.;return background;}
 vec4 light=diskEmission(hit,tangent,ro);
 return light.rgb*light.a+background*(1.-light.a);
}
vec3 acceleration(vec3 p,float angularMomentum2){
 float r2=max(dot(p,p),.01);return -1.5*angularMomentum2*p/(r2*r2*sqrt(r2));
}
vec4 trace(vec2 imageUV){
 float ro=length(uEye);
 if(ro<=1.002){return vec4(0.,0.,0.,1.);}
 vec3 d=normalize(uCameraToDisk*vec3((imageUV*2.-1.)*vec2(uView.x*uView.y,uView.x),-1.));
 vec3 radial=uEye/ro;
 // Aberration from the infalling observer's tetrad into the local static frame.
 if(uFall>.001){vec3 axis=-radial;float beta=min(.985,sqrt(1./ro))*uFall;float mu=dot(d,axis);
  float denom=max(.015,1.-beta*mu),gamma=inversesqrt(1.-beta*beta);
  d=normalize(axis*((mu-beta)/denom)+(d-axis*mu)/(gamma*denom));}
 float mu=dot(d,radial),f=max(.001,1.-1./ro);
 vec3 velocity=radial*mu+(d-radial*mu)/sqrt(f);
 float l2=dot(cross(uEye,velocity),cross(uEye,velocity));
 float impact=sqrt(l2);
 float influence=1.-smoothstep(30.,58.,impact);
 if(ro>75.&&(mu>=0.||influence<.001)){return vec4(0.);}
 float weakWeight=mu<0.?smoothstep(20.,28.,ro)*smoothstep(7.,10.,impact):0.;
 vec3 weakColor=vec3(0.);
 if(weakWeight>0.){float valid;weakColor=weakTransport(d,ro,valid);weakWeight*=valid;
  if(weakWeight>.999)return vec4(weakColor,opticalCoverage(ro,influence));}
 vec3 p=uEye;
 // Skip empty travel before the integration domain. Weak bending there is tiny.
 if(ro>80.){
  float b=dot(p,d),disc=b*b-dot(p,p)+6400.;
  if(disc<0.){return vec4(0.);}
  p+=d*max(0.,-b-sqrt(disc));
  vec3 er=normalize(p),tangentDirection=d-er*dot(d,er);
  vec3 et=tangentDirection/max(length(tangentDirection),.000001);float r=length(p);
  float vr=-sqrt(max(0.,1.-l2/(r*r)*(1.-1./r)));
  velocity=er*vr+et*sqrt(l2)/r;
 }
 // The orbital plane is fixed. Integrate Binet's null-geodesic equation
 // u'' + u = 1.5*u*u, u=1/r, using fourth-order scalar RK stages.
 // This avoids vector force evaluations and square roots at every affine step.
 if(impact<.025)return vec4(mu<0.?vec3(0.):sky(d),opticalCoverage(ro,influence));
 float radius=length(p);vec3 er0=p/radius;
 float vr0=dot(velocity,er0);vec3 et0=normalize(velocity-er0*vr0);
 vec2 orbit=vec2(1./radius,-vr0/impact);
 float phi=0.,crossing=mod(atan(-er0.y,et0.y)+3.14159265359,3.14159265359);
 if(crossing<.00001)crossing+=3.14159265359;
 vec3 sum=vec3(0.);float trans=1.;bool escaped=false,captured=false;
 float maxAngle=clamp(uStep*2.1,.10,.20);
 for(int i=0;i<256;i++){
  float u=orbit.x;
  if(u>1./1.002){captured=true;break;}
  if(u<1./81.&&orbit.y<0.){escaped=true;break;}
  float h=clamp(.3*u/max(abs(orbit.y),.01),.0005,maxAngle);
  vec2 k1=vec2(orbit.y,1.5*u*u-u);
  vec2 s2=orbit+k1*(h*.5),k2=vec2(s2.y,1.5*s2.x*s2.x-s2.x);
  vec2 s3=orbit+k2*(h*.5),k3=vec2(s3.y,1.5*s3.x*s3.x-s3.x);
  vec2 s4=orbit+k3*h,k4=vec2(s4.y,1.5*s4.x*s4.x-s4.x);
  vec2 next=orbit+(k1+2.*k2+2.*k3+k4)*(h/6.);
  if(phi+h>=crossing){
   float x=clamp((crossing-phi)/h,0.,1.),x2=x*x,x3=x2*x;
   float uc=(2.*x3-3.*x2+1.)*u+(x3-2.*x2+x)*h*orbit.y+(-2.*x3+3.*x2)*next.x+(x3-x2)*h*next.y;
   float duc=(6.*x2-6.*x)*u/h+(3.*x2-4.*x+1.)*orbit.y+(-6.*x2+6.*x)*next.x/h+(3.*x2-2.*x)*next.y;
   vec3 er=er0*cos(crossing)+et0*sin(crossing),et=-er0*sin(crossing)+et0*cos(crossing);
   vec4 light=diskEmission(er/max(uc,.0001),-impact*duc*er+impact*uc*et,ro);
   sum+=trans*light.rgb*light.a;trans*=1.-light.a;crossing+=3.14159265359;
   if(trans<.007)break;
  }
  // Sparse quadrature is sufficient for this deliberately optically thin corona.
  if(uHotFlow>.5&&uDisk>.5&&u>1./7.&&i%3==0){
   float r=1./u,height=abs(er0.y*cos(phi)+et0.y*sin(phi));
   float q=(r-3.3)*.5,halo=exp(-q*q-height*7.);
   float alpha=(1.-exp(-halo*h*3./max(impact*u*u,.001)*.0004))*uIntensity;
   sum+=trans*alpha*vec3(1.,.27,.065)*7.;trans*=1.-alpha;
  }
  orbit=next;phi+=h;
 }
 velocity=-impact*orbit.y*(er0*cos(phi)+et0*sin(phi))+impact*orbit.x*(-er0*sin(phi)+et0*cos(phi));
 // Unresolved high-order rays end dark rather than leaking an unbent sky.
 if(escaped&&!captured)sum+=trans*sky(normalize(velocity));
 float blend=opticalCoverage(ro,influence);
 return vec4(mix(sum,weakColor,weakWeight),blend);
}
// Cinematic, optically thin tracer material close to the travelling observer.
// Radial correlation grows as tidal strain rises; circular sampling remains seamless.
vec3 tidalMatter(vec3 direction){
 if(uTidal<.001||uDisk<.5)return vec3(0.);
 vec3 light=vec3(0.);float trans=1.;
 for(int i=0;i<18;i++){
  float q=(float(i)+.5)/18.,s=.025+q*q*2.8;
  vec3 p=uEye+direction*s;
  float r=length(p.xz);
  float height=exp(-pow(p.y/max(.035,r*.07),2.));
  float radial=log(max(.6,r))*mix(3.2,.16,uTidal)-uFlightTime*.035;
  vec2 uv=p.xz/max(r,.001)*.12+vec2(radial*.08,radial*.021);
  float filament=smoothstep(.57,.83,noise(uv,0.));
  float detail=noise(uv*2.7+vec2(.21,.37),.5);
  float density=filament*(.4+detail*.6)*height*(1.-smoothstep(3.,5.,r));
  float alpha=1.-exp(-density*uTidal*.34);
  vec3 tint=mix(vec3(1.,.18,.035),vec3(.75,.9,1.),detail*.55);
  light+=trans*tint*alpha*(1.8+detail*2.4);trans*=1.-alpha;
 }
 return light;
}
void main(){
 if(uJourneyProgress>=.99999){gl_FragColor=vec4(0.,0.,0.,uActivation);return;}
 vec3 d=normalize(uCameraToDisk*vec3((vUv*2.-1.)*vec2(uView.x*uView.y,uView.x),-1.));
 float ro=length(uEye);float b=length(cross(uEye,d))/sqrt(max(.001,1.-1./max(ro,1.001)));
 // Keep one geodesic call site. Three expanded copies create very large driver
 // programs; a dynamic sample loop preserves exactly the same native-pixel rays.
 int samples=(abs(b-2.598076)<max(.025,fwidth(b)*1.35)&&uFall<.01)?3:1;
 vec2 pixel=.32/max(uResolution,vec2(1.));
 vec4 color=vec4(0.);
 for(int sampleIndex=0;sampleIndex<samples;sampleIndex++){
  vec2 offset=sampleIndex==0?vec2(0.):pixel*(sampleIndex==1?1.:-1.);
  color+=trace(vUv+offset);
 }
 color/=float(samples);
 float finalFade=1.-smoothstep(.975,1.,uJourneyProgress);
 if(uTidal>.001){color.rgb+=tidalMatter(d);color.a=max(color.a,uTidal);}
 color.rgb*=finalFade;
 color.a*=uActivation;
 gl_FragColor=color;
}

`;
export const BLACK_HOLE_COMPOSITE = /*glsl*/ `
uniform sampler2D tDiffuse,uLensed;varying vec2 vUv;
void main(){vec4 base=texture2D(tDiffuse,vUv);vec4 lens=texture2D(uLensed,vUv);gl_FragColor=vec4(mix(base.rgb,lens.rgb,lens.a),base.a);}

`;
