/** Shared true 3D density: used by emission rays and embedded-star extinction. */
export const NEBULA_MEDIUM = /* glsl */ `
float n(vec3 p){return texture(uNoise,p/32.+uSeed).r;}
float fbm(vec3 p){return n(p)*.56+n(p*2.03+3.1)*.28+n(p*4.07+7.7)*.16;}
float bell(float x,float w){return exp(-x*x/(w*w));}
float ell(vec3 p,vec3 r){return exp(-dot(p/r,p/r)*2.);}
float ring(vec3 p,float r,float w){return bell(length(p.xy)-r,w)*bell(p.z,.19);}
// Each profile encodes observed structure; unobserved depth is a reconstruction.
vec2 structure(vec3 p,float f){
 float gas=0.,dust=0.;float r=length(p.xy);float a=atan(p.y,p.x);
 vec3 q=p+vec3(f-.5,n(p*5.+9.)-.5,n(p*5.+17.)-.5)*.12;
 if(uShape<.5){ // Open blister: a bowl in a molecular wall, not a painted plane.
  float bowl=-.28+.75*(q.x*q.x+q.y*q.y);
  gas=bell(q.z-bowl,.14)*ell(q,vec3(.97,.8,.95));
  gas+=ell(q-vec3(-.55,-.12,.08),vec3(.43,.38,.45))*.5;
  gas+=ell(q-vec3(.55,-.2,-.08),vec3(.5,.36,.48))*.5;
  float cavity=1.-.88*ell(q-vec3(.02,.1,.25),vec3(.33,.3,.45));gas*=cavity;
  dust=bell(q.y+.22+.3*q.x,.075)*ell(q-vec3(0.,0.,.28),vec3(.95,.8,.32))*2.;
 }else if(uShape<1.5){ // Four distinct clouds: left pillar 1A and 1B lie at different depths.
  gas=ell(q-vec3(0.,0.,-.4),vec3(1.,.85,.55))*.25;
  for(int j=0;j<4;j++){float k=float(j);float x=j<2?-.43: -.03+(k-2.)*.4;
   float depth=j==0?.28:j==1?-.26:j==2?.03:-.36;
   float top=j==0?.64:j==1?-.03:j==2?.40:.22;
   float bottom=j==0?-.04:-.82;float width=.075+.035*(top-q.y);
   float column=bell(length(vec2(q.x-x-.06*sin(q.y*6.+k),q.z-depth)),width)*smoothstep(bottom-.1,bottom+.07,q.y)*(1.-smoothstep(top-.08,top+.08,q.y));
   float rim=bell(length(vec2(q.x-x-.06*sin(q.y*6.+k),q.z-depth))-width*1.12,width*.24)*smoothstep(bottom-.1,bottom+.07,q.y)*(1.-smoothstep(top-.08,top+.08,q.y));
   dust+=column*3.2;gas+=column*.24+rim*.9+ell(q-vec3(x,top,depth),vec3(.13,.11,.15))*.75;}
 }else if(uShape<2.5){ // Sculpted three-dimensional ionisation wall and separated ridges.
  float ridge=-.18+.2*sin(q.x*3.5)+.09*sin(q.x*12.+q.z*3.);
  float wall=-.12+.34*sin(q.x*2.)+.22*q.y*q.y;
  gas=bell(q.y-ridge,.16)*bell(q.z-wall,.35)*ell(q,vec3(1.2,1.,1.));
  dust=(1.-smoothstep(ridge-.22,ridge+.05,q.y))*ell(q-vec3(0.,-.25,wall),vec3(1.1,.65,.5))*1.5;
 }else if(uShape<3.5){ // Separated, wind-combed reflection wisps at several depths.
  for(int j=0;j<6;j++){float k=float(j);vec3 c=vec3(sin(k*2.4)*.57,cos(k*3.1)*.49,sin(k*4.)*.45);
   vec3 h=q-c;h.x+=h.z*.5;gas+=ell(h,vec3(.34,.21,.23))*(.35+.65*bell(sin(q.x*25.+q.y*9.+q.z*12.+k),.55));}dust=gas*.2;
 }else if(uShape<4.5){ // Curved molecular filament, with depth, not a flat silhouette.
  vec3 h=q;h.x+=.22*sin(q.y*3.8);h.z-=.18*sin(q.y*3.);
  gas=ell(h,vec3(.25,.83,.37))*(.5+f);dust=gas*.7;
 }else if(uShape<5.5){ // Horsehead: neck and bent head against an emission curtain
  float neck=ell(q-vec3(-.14,-.25,0.),vec3(.19,.57,.22));
  float head=ell(q-vec3(.06,.29,0.),vec3(.33,.17,.22));
  dust=(neck+head)*4.;gas=ell(q-vec3(0.,0.,-.32),vec3(.95,.9,.13))*.75;
 }else if(uShape<6.5){ // Barnard 68: irregular opaque globule with a faint scattered rim
  float body=ell(q,vec3(.55,.66,.43));dust=body*8.;gas=bell(length(q/vec3(.55,.66,.43))-.92,.17)*.11;
 }else if(uShape<7.5){ // M57: equatorial doughnut pierced by an end-on prolate shell.
  float torus=length(vec2(length(q.xy/vec2(1.,.87))-.59,q.z));
  float football=length(q/vec3(.43,.37,.96));
  gas=bell(torus,.14)+bell(football-1.,.14)*.35+bell(length(q/vec3(.93,.83,1.14))-1.,.06)*.09;
  dust=bell(torus,.12)*.2;
 }else if(uShape<8.5){ // Helix: inner disk and a substantially tilted outer ring.
  vec3 h=vec3(q.x,q.y*.26+q.z*.966,q.z*.26-q.y*.966);
  gas=ring(q,.58,.13)+ell(q,vec3(.55,.55,.16))*.2+ring(h,.85,.08)*.48;
  gas+=ring(q,.55,.17)*pow(max(0.,sin(a*41.+f*6.)),10.)*.45;dust=gas*.25;
 }else if(uShape<9.5){ // Cat's Eye: nested ellipsoids and intersecting bipolar structures.
  vec3 h=vec3(q.x*.87+q.z*.5,q.y,q.z*.87-q.x*.5);
  gas=bell(length(h/vec3(.36,.77,.38))-1.,.09)+bell(length(q/vec3(.63,.42,.48))-1.,.08)*.7;
  for(int j=0;j<4;j++){float k=float(j);gas+=bell(length(q)-(.71+k*.09),.025)*.07;}dust=gas*.13;
 }else if(uShape<10.5){ // Butterfly / Homunculus: hollow bipolar lobes, opaque waist
  float y=abs(q.y);float width=.08+.60*pow(y,.7);
  gas=bell(length(q.xz)-width,.10)*bell(y-.48,.35)*(1.-smoothstep(.80,1.,y));
  dust=ell(q,vec3(.46,.08,.35))*4.;
 }else if(uShape<11.5){ // Crab: tangled ejecta surrounding a softer synchrotron interior
  float e=length(q/vec3(.78,.93,.58));
  gas=bell(e-.80,.18)*smoothstep(.41,.66,f)*3.+ell(q,vec3(.51,.64,.42))*.22;dust=gas*.23;
 }else if(uShape<12.5){ // Veil: folds of an expanding shock shell, open ribbons in depth.
  float curve=.4*sin(q.x*2.8)+.12*sin(q.x*8.+q.z*2.);
  float fold=.25*sin(q.x*4.)+.3*q.y;
  gas=(bell(q.y-curve-.24,.04)*bell(q.z-fold,.18)+bell(q.y-curve+.3,.05)*bell(q.z+fold-.3,.14))*bell(q.x,.9);
  dust=gas*.07;
 }else if(uShape<13.5){ // Cassiopeia A: ruptured, clumpy ejecta shell
  gas=bell(length(q/vec3(.76,.79,.66))-.91,.13)*smoothstep(.34,.65,f)*2.6;
  gas*=.65+.35*sin(a*7.+q.z*5.);dust=gas*.3;
 }else if(uShape<14.5){ // Rosette: a hollow wind-carved ellipsoid surrounding NGC 2244.
  float wall=length(q/vec3(.83,.79,.67));gas=bell(wall-(.94+.05*sin(a*9.+q.z*6.)),.18);
  dust=gas*smoothstep(.42,.69,f)*1.7;
 }else if(uShape<15.5){ // Tarantula: three overlapping wind bubbles, web-like dense bridges.
  gas=bell(length(q-vec3(.2,.12,.12))-.51,.10)+bell(length(q-vec3(-.42,-.12,-.22))-.43,.095)*.65;
  gas+=bell(length(q-vec3(.1,-.5,.36))-.35,.08)*.45;
  gas*=ell(q,vec3(1.25,1.,1.))*(.3+f);dust=ell(q,vec3(1.,.72,.65))*smoothstep(.49,.72,f)*1.5;
 }else if(uShape<16.5){ // Lagoon: open ionised basin, dense ridge and compact Hourglass front.
  gas=bell(q.z+.32-.46*(q.x*q.x+q.y*q.y),.22)*ell(q,vec3(.95,.85,.85));
  gas+=ell(q-vec3(.27,.16,.25),vec3(.19,.3,.24))*.7;
  dust=bell(q.x+.16*sin(q.y*5.+q.z*3.),.13)*ell(q,vec3(.9,.85,.65))*2.2;
 }else if(uShape<17.5){ // Trifid: ionised volume, three branching foreground lanes, rear reflection cloud.
  gas=ell(q-vec3(0.,-.22,.05),vec3(.69,.61,.6))+ell(q-vec3(.12,.65,-.4),vec3(.46,.34,.36))*.45;
  float lanes=pow(max(0.,cos(a*3.+.5+q.z*.65)),18.);dust=lanes*smoothstep(.05,.2,r)*bell(r,.66)*bell(q.z-.18,.3)*3.;
 }else if(uShape<18.5){ // SN1987A: an equatorial ring and two offset polar rings.
  gas=ring(q,.46,.045)+ring(q-vec3(0.,0.,.48),.7,.045)*.32+ring(q+vec3(0.,0.,.48),.7,.045)*.32;dust=gas*.18;
 }else if(uShape<19.5){ // WR104: a dust spiral carried on a shallow colliding-wind cone.
  float spiral=abs(fract((r-.03)/.24-a/6.2831853+.5)-.5)*.24;
  gas=bell(spiral,.025)*bell(q.z-.35*r,.10)*smoothstep(.02,.1,r)*(1.-smoothstep(.78,1.,r));dust=gas*.6;
 }else if(uShape>20.5&&uShape<21.5){ // Eta Carinae: distinct hollow Homunculus lobes and equatorial skirt.
  float lobe=length((q-vec3(0.,sign(q.y)*.43,0.))/vec3(.43,.48,.43));
  gas=bell(lobe-1.,.11)*(.45+f);dust=ell(q,vec3(.55,.09,.5))*3.;
 }else if(uShape>21.5&&uShape<22.5){ // NGC 604: interconnected wind-blown cavities, not a closed sphere.
  gas=ell(q,vec3(.94,.68,.83))*.9;
  vec3 c0=vec3(-.28,.08,.1),c1=vec3(.32,-.12,-.12),c2=vec3(.03,.38,-.2);
  float a0=ell(q-c0,vec3(.32,.34,.45)),a1=ell(q-c1,vec3(.36,.32,.38)),a2=ell(q-c2,vec3(.24,.28,.4));
  gas*=max(.02,1.-max(a0,max(a1,a2))*1.45);
  gas+=bell(q.y+.25+.17*sin(q.x*7.+q.z*3.),.075)*ell(q,vec3(.85,.9,.7))*.7;
  dust=gas*pow(smoothstep(.42,.72,f),2.)*1.8;
 }else if(uShape>22.5&&uShape<23.5){ // Unresolved SINGS H II regions: explicitly illustrative 3D gas.
  vec3 offset=vec3(sin(uSeed*19.),cos(uSeed*23.),sin(uSeed*31.))*.2;
  gas=(ell(q-offset,vec3(.85,.55,.7))+.4*ell(q+offset+vec3(.4,-.3,.15),vec3(.4,.4,.45)));
  gas*=1.-.95*ell(q-vec3(0.,.05,.1),vec3(.33,.28,.4));
  dust=gas*smoothstep(.35,.65,f)*1.2;
 }else if(uShape>23.5&&uShape<24.5){ // NGC 346: asymmetric curved star-forming ridge and open stellar clearing.
  float arc=.28*sin(q.y*3.6)+.14*sin(q.z*4.);
  gas=bell(q.x-arc,.16)*ell(q-vec3(.1,.12,-.2),vec3(.95,.9,.8));
  gas+=ell(q+vec3(.42,.35,.14),vec3(.4,.34,.5))*.6;
  gas*=1.-.93*ell(q-vec3(0.,.05,.1),vec3(.32,.3,.4));
  dust=gas*smoothstep(.36,.72,f)*1.35;
 }else if(uShape>24.5&&uShape<25.5){ // NGC 602: wind-swept ridges around the central association.
  float wall=.23+.34*q.x*q.x+.2*q.z*q.z;
  gas=bell(q.y-wall,.12)*ell(q,vec3(.95,.9,.85));
  gas+=ell(q-vec3(-.48,-.23,-.1),vec3(.32,.38,.5))*.6;
  dust=gas*.8+bell(q.x+.5+.12*sin(q.y*8.),.055)*ell(q,vec3(.9,.8,.6));
 }else{gas=ell(q,vec3(.85,.43,.65))*smoothstep(.35,.68,f);dust=gas*.4;}
 return vec2(gas,dust);
}
vec2 nebulaMedium(vec3 p){
 float edge=1.-smoothstep(1.12,1.48,max(abs(p.x),max(abs(p.y),abs(p.z))));
 float f=fbm(p*7.);vec2 m=structure(p,f);
 float filaments=.45+.75*smoothstep(.26,.76,f)+n(p*71.+11.)*.2;
 float clumps=pow(smoothstep(.48,.74,fbm(p*27.+vec3(11.,3.,7.))),2.);
 float cloudDust=(uShape<7.||uShape>13.5&&uShape<17.5)?m.x*clumps*.65:0.;
 return vec2(m.x*filaments*.5,m.y*(.4+f)+cloudDust)*edge;
}
`;
