/** Reconstructed stellar emissivity and absorbing dust; photographs constrain one view only. */
export const GALAXY_FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform vec3 uEye,uOld,uYoung;
uniform sampler3D uNoise;
uniform sampler2D uReference;
uniform float uMode,uSeed,uArms,uPitch,uBulge,uBar,uDust,uTime,uOpacity,uReveal,uRing,uRotationRate,uSingleTail,uSteps,uHasReference,uInclination,uAspect,uGroup;
varying vec3 vP;
float noise(vec3 p){return texture(uNoise,p/64.+uSeed*.017).r;}
vec3 populations(vec3 p, out float dust){
 float r=length(p.xz),z=abs(p.y),a=atan(p.z,p.x)+uTime*uRotationRate/max(r,.12);
 float coarse=noise(p*38.),fine=noise(p*290.);float grain=coarse*.65+fine*.35;
 float warp=sin(a*2.+r*9.+uSeed)*.014*r*r;
 float height=abs(p.y-warp);
 float radial=exp(-r*3.2)*(1.-smoothstep(.88,1.22,r));
 float disk=exp(-height/(.009+.022*r))*radial;
 float phase=(a-log(max(r,.055))/tan(uPitch))*uArms+(noise(p*18.)-.5)*1.3;
 float arm=exp(-pow(sin(phase*.5)/.23,2.))*smoothstep(.04,.2,r);
 float lane=exp(-pow(sin((phase+.34)*.5)/.105,2.));
 float bulge=exp(-pow(length(p*vec3(1.,1.65,1.))/max(uBulge,.04),.7)*1.8);
 float stars=disk*(.13+arm*2.1)*(.22+grain*1.2)*(.55+.65*pow(fine,.7));
 float young=disk*arm*smoothstep(.08,.3,r)*pow(coarse,2.)*1.8;
 if(uMode>1.5&&uMode<2.5){stars+=exp(-abs(p.z)*55.-abs(p.x)/max(uBar,.04)*2.-height*75.)*.5;}
 if(uMode>2.5&&uMode<3.5){float ring=exp(-pow((r-.68-.015*sin(a*3.))/.045,2.))*exp(-height*65.);stars=ring*(.25+grain)*.65+disk*.025;young=ring*coarse*.9;}
 if(uMode>3.5&&uMode<4.5){float clouds=0.;for(int j=0;j<7;j++){float k=float(j),ang=k*2.399;vec3 center=vec3(cos(ang)*.4,0.,sin(ang)*.3);vec3 q=(p-center)/vec3(.16,.075,.14);clouds+=exp(-dot(q,q)*1.4);}stars=clouds*(.12+pow(coarse,2.)*1.6);young=stars*.6;bulge*=.02;}
 if(uMode>5.5&&uMode<6.5){young+=disk*.45;stars*=1.4;float wind=exp(-pow(r/(.04+z*.33),2.))*smoothstep(.05,.18,z)*(1.-smoothstep(.35,.85,z));young+=wind*coarse*.055;}
 if(uMode>6.5&&uMode<7.5){
  if(uSingleTail<.5){bulge=exp(-length((p-vec3(.22,0.,.06))*vec3(1.,1.6,1.))*30.)*.45+exp(-length((p+vec3(.25,0.,.1))*vec3(1.,1.6,1.))*27.)*.4;}
  if(uGroup>.5){for(int j=0;j<3;j++){float q=float(j)*2.4;vec3 c=vec3(sin(q)*.47,0.,cos(q)*.36);bulge+=exp(-length((p-c)*vec3(1.,1.8,1.))*35.)*.33;}}
  float tail=exp(-pow((r-(.62+.27*sin(a*2.)))/.045,2.))*exp(-height*45.);stars+=tail*.12;young+=tail*grain*.06;
 }
 if(uMode<.5||uMode>7.5&&uMode<8.5){float e=length(p*vec3(1.,uMode>7.5?1.8:1.3,1.1));stars=exp(-pow(e,.8)*7.)*(.8+grain*.3)*(uMode>7.5?.2:1.);young=0.;bulge=0.;}
 if(uMode>8.5){stars=disk*.25;young=0.;}
 dust=uDust*lane*disk*(.6+coarse)*12.*smoothstep(.08,.22,r);
 dust+=uDust*pow(smoothstep(.38,.75,noise(p*95.)),2.)*disk*2.8;
 // Edge-on dust lanes remain dark; no additive reddish fog.
 if(uMode>4.5&&uMode<5.5||uMode>8.5) dust+=uDust*exp(-height*160.)*radial*.9;
 float knots=pow(smoothstep(.68,.88,fine),3.)*young;
 return uOld*(stars*9.+bulge*8.)+uYoung*young*6.+vec3(1.,.22,.35)*knots*3.;
}
void main(){
#include <logdepthbuf_fragment>
 vec3 rd=normalize(vP-uEye);
 vec3 inv=1./(rd+vec3(1.e-8));vec3 aa=(-vec3(1.35)-uEye)*inv,bb=(vec3(1.35)-uEye)*inv;
 vec3 lo=min(aa,bb),hi=max(aa,bb);float start=max(0.,max(lo.x,max(lo.y,lo.z))),finish=min(hi.x,min(hi.y,hi.z));
 if(finish<=start)discard;
 // Thin disks need a tightly clipped integration interval, even at grazing angles.
 bool disk=uMode>.5&&!(uMode>7.5&&uMode<8.5);
 if(disk&&abs(rd.y)>.0001){float a=(-.19-uEye.y)/rd.y,b=(.19-uEye.y)/rd.y;start=max(start,min(a,b));finish=min(finish,max(a,b));}
 if(finish<=start)discard;
 float stepSize=(finish-start)/uSteps;float jitter=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);float trans=1.;vec3 sum=vec3(0.);
 for(int i=0;i<64;i++){if(float(i)>=uSteps)break;
  float q=(float(i)+.45+jitter*.1)/uSteps;
  bool interior=length(uEye)<1.25;
  float t=interior?q*q:q;float ds=interior?stepSize*2.*q:stepSize;
  vec3 p=uEye+rd*mix(start,finish,t);float dust;vec3 emission=populations(p,dust);
  // Blue light is preferentially absorbed through the dusty lanes.
  emission*=mix(vec3(1.),vec3(.86,.68,.53),smoothstep(.15,1.4,dust)*.6);
  dust*=mix(1.,.25,uReveal);
  float extinction=dust+dot(emission,vec3(.2126,.7152,.0722))*.09;
  float alpha=1.-exp(-extinction*ds*9.);
  sum+=trans*emission/max(extinction,.025)*alpha;trans*=1.-alpha;
  if(trans<.008)break;
 }
 // A thin image-constrained layer retains observed filaments at the photographed
 // inclination. It dissolves before entry; the camera never flies into a billboard.
 if(uHasReference>.5&&abs(rd.y)>.001){float t=-uEye.y/rd.y;
  vec3 p=uEye+rd*t;vec2 uv=vec2(p.x,p.z*max(.14,cos(uInclination)))*.43+vec2(.5);
  uv.x=(uv.x-.5)/max(uAspect,.5)+.5;
  float facing=abs(dot(normalize(uEye),normalize(vec3(0.,cos(uInclination),sin(uInclination)))));
  float weight=smoothstep(.6,1.6,length(uEye))*smoothstep(.7,.96,facing);
  if(t>start&&t<finish&&all(greaterThan(uv,vec2(0.)))&&all(lessThan(uv,vec2(1.)))){
   vec3 photo=texture2D(uReference,uv).rgb;
   float mask=(1.-smoothstep(.8,1.15,length(p.xz)))*weight;
   float photoAlpha=clamp(dot(photo,vec3(.2126,.7152,.0722))*3.,0.,.94)*mask;
   sum=mix(sum,photo*8.,mask*.9);
   trans=min(trans,1.-photoAlpha);
  }
 }
 float alpha=clamp(1.-trans,0.,.94)*uOpacity;if(alpha<.002)discard;
 // Compress core luminance locally so optical bloom cannot erase the dust structure.
 sum=sum/(1.+dot(sum,vec3(.2126,.7152,.0722))*.11);
 sum*=mix(.38,1.,smoothstep(.3,1.4,length(uEye)))*mix(1.,.18,uReveal);
 gl_FragColor=vec4(sum/max(1.-trans,.001),alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}
`;
