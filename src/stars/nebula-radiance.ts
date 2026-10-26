/** Static scattering colour, baked with the density; camera exposure stays live. */
export const NEBULA_RADIANCE = /* glsl */ `
uniform sampler2D uReference;uniform vec3 uPrimary,uSecondary,uLight;uniform float uHasReference,uAspect,uDark;
vec3 nebulaSource(vec3 p,vec2 media){
  float f=fbm(p*7.);
  vec3 palette=mix(uPrimary,uSecondary,smoothstep(.25,.75,f+p.y*.18));
  // The observation constrains colour only. No image sheet, surface, or
  // luminous photo column participates in the geometry or star positions.
  vec2 uv=p.xy*(.39+.05*sin(p.z*2.))+vec2(.5)+vec2(sin(p.z*3.),cos(p.z*2.)-1.)*.06;
  uv.x=.5+(uv.x-.5)/max(1.,uAspect);uv.y=.5+(uv.y-.5)*min(1.,uAspect);
  vec3 observed=textureLod(uReference,clamp(uv,.002,.998),5.).rgb;
  vec3 photoColor=observed/(max(max(observed.r,observed.g),observed.b)+.004);
  float confidence=smoothstep(.004,.08,max(max(observed.r,observed.g),observed.b));
  vec3 color=mix(palette,photoColor,uHasReference*confidence*.8);
  float illumination=media.x/(media.x+media.y*2.+.0001);
  vec3 finePhoto=textureLod(uReference,clamp(uv,.002,.998),.5).rgb;
  float fineLum=dot(finePhoto,vec3(.2126,.7152,.0722)),broadLum=dot(observed,vec3(.2126,.7152,.0722));
  float rejectStar=1.-smoothstep(.10,.32,max(max(finePhoto.r,finePhoto.g),finePhoto.b)-max(max(observed.r,observed.g),observed.b));
  float detail=mix(1.,clamp((fineLum+.025)/(broadLum+.025),.6,1.7),uHasReference*confidence*rejectStar*.65);
  vec3 source=color*(54.+smoothstep(.35,.75,n(p*93.))*18.)*illumination*detail+vec3(.012,.009,.006)*(1.-illumination);
  source*=mix(1.,.38,uDark);
  // Soft illumination around the stellar cavity and forward-scattered dust.
  float stellarLight=1./(1.+dot(p-uLight,p-uLight)*3.);
  source*=mix(.8,1.3,stellarLight);
  if(uShape>19.5&&uShape<20.5)source*=.2;
 return source;
}
`;
