/** Static reconstructed emissivity and dust, baked once for the selected galaxy. */
export const GALAXY_MEDIUM = /* glsl */ `
uniform sampler3D uNoise;
uniform vec3 uOld,uYoung;
uniform float uMode,uSeed,uArms,uPitch,uBulge,uBar,uDust,uTime,uRotationRate,uSingleTail,uGroup,uCenA;
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
 if(uCenA>.5){
   float spheroid=exp(-pow(length(p*vec3(1.,1.15,1.1)),.8)*6.2);
   float warped=p.y-.09*sin(p.x*3.4)-.035*sin(p.z*7.);
   float diskDust=exp(-abs(warped)/(.016+.018*r))*exp(-r*2.4);
   dust=diskDust*(.35+coarse*1.4+fine*.8)*9.;
   stars=spheroid*(.7+fine*.25);bulge=0.;young=diskDust*pow(coarse,3.)*.12;
 }
 float support=1.-smoothstep(.88,1.26,length(p*vec3(1.,.85,1.)));
 dust*=support;
 return (uOld*(stars*9.+bulge*8.)+uYoung*young*6.+vec3(1.,.22,.35)*knots*3.)*support;
}
`;
