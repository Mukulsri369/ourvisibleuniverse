/** Stellar emissivity and absorbing dust in galaxy-local 3D coordinates. */
export const GALAXY_MEDIUM = /* glsl */ `
uniform sampler3D uNoise;
uniform vec3 uOld,uYoung;
uniform float uMode,uSeed,uArms,uPitch,uBulge,uBar,uDust,uTime,uRotationRate,uSingleTail,uGroup,uCenA;
uniform float uFeature,uThickness,uFlattening,uRing,uAsymmetry,uArmContrast;
uniform float uPopKind,uPopCore,uPopContinuum,uPopHot,uPopDust,uPopHii,uPopTail,uPopKnotCount;
uniform vec3 uPopAxes;uniform vec4 uPopKnots[6];
float noise(vec3 p){return texture(uNoise,p/64.+uSeed*.017).r;}
float cloud(vec3 p){return noise(p*12.)*.5+noise(p*33.)*.3+noise(p*86.)*.2;}
float ball(vec3 p,vec3 center,vec3 axes){vec3 q=(p-center)/axes;return exp(-dot(q,q)*2.);}
vec3 populations(vec3 p,out float dust){
 // Specialize populations at compile time so their code adds no Milky Way shader work.
#ifdef GALAXY_POPULATION
 {
  vec3 q=p/uPopAxes;float e=length(q),profile=pow(1.+e*e/(uPopCore*uPopCore),-2.5);
  float oldLight=profile*uPopContinuum*22.;float hotLight=profile*uPopHot*.55;
  float gas=0.,clusters=0.;dust=0.;
  for(int k=0;k<6;k++){if(float(k)>=uPopKnotCount)break;vec4 knot=uPopKnots[k];
   float d=length((p-knot.xyz)/max(.008,knot.w));float association=exp(-d*d*1.4);
   if(uPopKind<1.5){clusters+=association*.25;dust+=association*uPopDust*2.5;gas+=association*uPopHii*.25;}
   else{hotLight+=association*uPopHot*.8;gas+=association*uPopHii*(.35+.65*cloud(p*1.7));dust+=association*uPopDust*(.25+cloud(p*2.))*2.;}
  }
  if(uPopKind>3.5){oldLight*=.55;hotLight=0.;dust=0.;}
  float tide=exp(-pow((p.z-.12*sin(p.x*3.))/max(.025,uPopAxes.z*.12),2.))*exp(-p.y*p.y/ .007)*smoothstep(.28,.55,abs(p.x))*(1.-smoothstep(.95,1.3,abs(p.x)));
  oldLight+=tide*uPopTail*.10;
  float support=1.-smoothstep(1.1,1.33,length(p*vec3(1.,.7,1.)));
  return (uOld*(oldLight+clusters)+uYoung*hotLight+vec3(1.,.12,.30)*gas*1.6)*support;
 }
#else
 float r=length(p.xz),z=abs(p.y),a=atan(p.z,p.x);
 float coarse=cloud(p),fine=noise(p*190.);
 float warp=sin(a*2.+r*7.+uSeed)*.018*r*r;
 float height=abs(p.y-warp);
 float radial=exp(-r*3.3)*(1.-smoothstep(.9,1.25,r));
 float disk=exp(-height/(uThickness+.018*r))*radial;
 float launch=max(.045,uBar);
 float phase=(a-log(max(r,launch)/launch)/tan(uPitch))*uArms;
 phase+=(noise(p*14.)-.5)*(.9+uAsymmetry*6.);
 float arm=exp(-pow(sin(phase*.5)/mix(.55,.36,uArmContrast),2.))*smoothstep(launch*.7,launch*1.3,r);
 float lane=exp(-pow(sin((phase+.32)*.5)/.13,2.));
 float bulge=exp(-pow(length(p*vec3(1.,1.7,1.))/max(uBulge,.045),.8)*2.3);
 float stars=disk*(.38+arm*1.1)*(.35+coarse),young=disk*arm*smoothstep(.1,.3,r)*pow(coarse,2.)*2.2;
 float ring=exp(-pow((r-max(.15,uRing))/.046,2.))*exp(-height*60.);
 if(uMode>1.5&&uMode<2.5){stars+=ball(p,vec3(0.),vec3(max(uBar,.08),.03,.055))*.65;}
 if(uMode>2.5&&uMode<3.5){stars=ring*(.2+coarse)*.8+disk*.016;young=ring*coarse*.7;}
 if(uRing>.05&&uMode<2.5){stars+=ring*.12;young+=ring*.18;}
 if(uMode>3.5&&uMode<4.5){
  float clouds=0.;for(int j=0;j<8;j++){float k=float(j),ang=k*2.399+uSeed;vec3 center=vec3(cos(ang)*(.15+.035*k),sin(k*1.7)*.04,sin(ang)*(.13+.025*k));clouds+=ball(p,center,vec3(.22,.10,.18));}
  stars=clouds*(.12+coarse*.55);young=stars*.45;bulge=0.;
 }
 if(uMode<.5||(uMode>7.5&&uMode<8.5)){
  float e=length(p/vec3(1.,uFlattening,.9));stars=exp(-pow(e,.78)*7.)*(.95+coarse*.1)*(uMode>7.5?.3:1.);young=0.;bulge=0.;
 }
 if(uMode>8.5){stars=disk*.4;young=0.;}
 dust=uDust*disk*(lane*(.5+coarse)*8.+pow(smoothstep(.4,.73,coarse),2.)*4.)*smoothstep(.07,.2,r);
 if(uMode>4.5&&uMode<5.5||uMode>8.5){dust+=uDust*exp(-height*120.)*radial*2.;}
 // Distinct observed structures are volumes, never pictures on planes.
 if(uFeature>.5&&uFeature<1.5){
  float spheroid=exp(-pow(length(p*vec3(1.,1.2,1.1)),.8)*6.2);
  float warped=p.y-.085*sin(p.x*3.4)-.025*sin(p.z*7.);
  float diskDust=exp(-abs(warped)/(.012+.018*r))*exp(-r*2.4);
  dust=diskDust*(.35+coarse*1.5+fine*.4)*11.;stars=spheroid;bulge=0.;young=diskDust*pow(coarse,3.)*.15;
 }
 if(uFeature>1.5&&uFeature<2.5){bulge=exp(-pow(length(p*vec3(1.,1.2,1.))/.36,.8)*2.6);stars=disk*.18;young=0.;dust=exp(-pow((r-.67)/.1,2.))*exp(-height*110.)*(.5+coarse)*16.;}
 if(uFeature>2.5&&uFeature<3.5){stars=exp(-length(p*vec3(2.4,11.,4.)))*(.5+coarse);bulge=0.;young=stars*.35;float wind=exp(-pow(r/(.035+z*.32),2.))*smoothstep(.05,.13,z)*(1.-smoothstep(.4,.95,z));young+=wind*coarse*.08;dust=stars*uDust*(coarse+fine)*6.;}
 if(uFeature>3.5&&uFeature<4.5){stars+=ball(p,vec3(.02,0.,0.),vec3(.65,.08,.14))*.36;young+=ball(p,vec3(.4,.025,-.18),vec3(.08,.055,.08))*.8;}
 if(uFeature>4.5&&uFeature<5.5){stars*=.55;stars+=ball(p,vec3(.2,.015,.08),vec3(.45,.14,.18))*.25;}
 if(uFeature>5.5&&uFeature<6.5){bulge+=ball(p,vec3(.65,.04,.45),vec3(.13,.12,.13))*.6;}
 if(uMode>6.5&&uMode<7.5){
  if(uFeature>8.5&&uFeature<9.5){float tail=exp(-pow((p.z-.22*sin(p.x*3.)+.12)/.045,2.))*exp(-p.y*p.y*600.)*smoothstep(.1,.3,p.x)*(1.-smoothstep(.9,1.28,p.x));stars+=tail*.18;young+=tail*.14;}
  else {bulge=ball(p,vec3(.24,.04,.08),vec3(.16,.11,.15))*.55+ball(p,vec3(-.24,-.02,-.12),vec3(.16,.13,.17))*.5;float tail=exp(-pow((r-(.64+.24*sin(a*2.)))/.055,2.))*exp(-height*45.);stars=stars*.5+tail*.12;young+=tail*coarse*.12;}
  if(uFeature>7.5&&uFeature<8.5){for(int j=0;j<3;j++){float k=float(j)*2.4;bulge+=ball(p,vec3(sin(k)*.65,sin(k*2.)*.13,cos(k)*.55),vec3(.12,.10,.14))*.5;}}
 }
 // Collisional rings and detached rings have different density fields, not a shared neon torus.
 if(uFeature>9.5&&uFeature<11.5){
  bool cart=uFeature<10.5;
  vec2 off=p.xz-vec2(cart?.035:0.,cart?-.025:0.);float rr=length(off);
  float az=atan(off.y,off.x);float rim=uRing+(cart?.032*sin(az*3.+.4):.013*sin(az*2.));
  float width=(cart?.062:.074)*(1.+.24*sin(az*5.+uSeed));
  float band=exp(-pow((rr-rim)/width,2.))*exp(-pow(p.y/(cart?.028:.024),2.));
  float association=pow(smoothstep(.37,.76,cloud(p*1.8)),1.6);
  float clumpiness=.12+.88*association;float gap=1.-smoothstep(.19,cart?.38:.32,rr);
  bulge=exp(-pow(length(p/vec3(cart?.105:.17,cart?.075:.15,cart?.09:.17)),1.1)*2.)*3.;
  stars=band*clumpiness*.3;young=band*(.08+association*1.65);dust=band*pow(coarse,3.)*(cart?2.6:.22);
  if(cart){
   float inner=exp(-pow((rr-.21)/.039,2.))*exp(-pow(p.y/.028,2.));
   float spoke=pow(max(0.,cos(az*11.+rr*6.+noise(p*22.)*2.)),7.)*exp(-pow(p.y/.025,2.))*smoothstep(.24,.34,rr)*(1.-smoothstep(.67,.78,rr));
   stars+=inner*(.65+coarse*.6)+spoke*(.04+coarse*.23);young+=spoke*association*.65;
   dust+=(inner*.8+spoke*1.5)*coarse;
  }else{stars+=disk*.002*gap;}
 }

 if(uFeature>11.5&&uFeature<12.5){bulge+=ball(p,vec3(.8,.06,.1),vec3(.28,.08,.07))*.6;}
 if(uFeature>12.5&&uFeature<13.5){dust+=ball(p,vec3(.12,.01,.05),vec3(.3,.025,.24))*10.;}
 if(uFeature>14.5&&uFeature<15.5){
  // Malin 1: a compact barred inner disk, embedded in an enormous, faint asymmetric disk.
  float inner=exp(-r/ .105)*exp(-height/.017);
  float phi=(a-log(max(r,.09)/.09)/tan(.34))*2.+sin(r*4.)*.4;
  float outerArm=exp(-pow(sin(phi*.5)/.32,2.));
  float outer=exp(-r*1.8)*smoothstep(.15,.27,r)*(1.-smoothstep(.93,1.2,r))*exp(-height/(.022+.018*r));
  stars=inner*(.75+coarse*.6)+outer*(.02+outerArm*.14)*(.25+coarse);
  young=outer*outerArm*pow(coarse,3.)*.22;bulge=exp(-length(p/vec3(.07,.05,.07))*2.)*2.;
  stars+=ball(p,vec3(0.),vec3(.15,.02,.035))*.3;
  dust=inner*lane*.55+outer*outerArm*pow(coarse,3.)*.18;
 }
 float support=1.-smoothstep(1.12,1.32,length(p*vec3(1.,.75,1.)));
 dust*=support;
 float knots=pow(smoothstep(.65,.9,fine),3.)*young;
 return (uOld*(stars*19.+bulge*30.)+uYoung*young*36.+vec3(1.,.16,.29)*knots*24.)*support;
#endif
}
`;
