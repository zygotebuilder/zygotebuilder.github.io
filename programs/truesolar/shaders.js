// Procedural, resolution-independent surfaces (no texture files needed). Log-depth compatible.
export const VERT=`varying vec3 vP,vW,vN;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vP=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;
#include <logdepthbuf_vertex>
}`;
export const FRAG=`varying vec3 vP,vW,vN;
uniform vec3 uSun,uC1,uC2,uC3;uniform float uT,uK,uF,uCr,uBands,uTurb,uSpot,uSeed;uniform vec4 uAtm;
#include <logdepthbuf_pars_fragment>
float h3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*n3(p);p=p*2.03+7.1;a*=.5;}return s;}
vec3 h33(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return fract(sin(p)*43758.5453);}
float crat(vec3 p){vec3 i=floor(p),f=fract(p);float r=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 g=vec3(x,y,z);vec3 o=h33(i+g);float s=.15+.25*o.x;if(o.y<.5)continue;float d=length(g+o-f);r+=-.55*smoothstep(s,s*.3,d)+.45*smoothstep(s*1.25,s,d)*smoothstep(s*.75,s,d);}return r;}
void main(){
#include <logdepthbuf_fragment>
vec3 N=normalize(vN),L=normalize(uSun-vW),V=normalize(cameraPosition-vW),p=normalize(vP);
float lit=max(dot(N,L),0.),mu=max(dot(N,V),0.);vec3 col;float spec=0.,city=0.;
if(uK<.5){float g=fbm(p*7.+vec3(0.,0.,uT*.03)),g2=fbm(p*28.-uT*.05);col=mix(uC3,uC1,g);col=mix(col,uC2,clamp(g2*g2*2.+.1,0.,1.));col*=(.5+.8*pow(mu,.55))*1.7;gl_FragColor=vec4(col,1.);
#include <colorspace_fragment>
return;}
else if(uK<1.5){float h=fbm(p*uF+uSeed),m=fbm(p*uF*.4+uSeed*2.);col=mix(uC1,uC2,smoothstep(.3,.7,h));col=mix(col,uC3,smoothstep(.45,.7,m)*.55);
if(uCr>0.){float c=crat(p*5.)*.5+crat(p*13.)*.4+crat(p*34.)*.3;col*=1.+c*uCr*.7;}col*=.8+.4*fbm(p*60.);}
else if(uK<2.5){float h=fbm(p*2.6+uSeed),co=smoothstep(.5,.52,h),lat=abs(p.y);
vec3 oc=mix(uC1*.3,uC1*1.4,smoothstep(.3,.5,h));vec3 ld=mix(uC2,uC3,smoothstep(.45,.65,fbm(p*4.+9.))*(1.-lat*.6));ld*=.65+.7*fbm(p*22.);
float ice=smoothstep(.78,.86,lat+(fbm(p*6.)-.5)*.2);col=mix(oc,ld,co);col=mix(col,vec3(.93,.96,1.),ice);
float cl=smoothstep(.5,.75,fbm(p*3.4+vec3(uT*.004,0.,0.)+5.));col=mix(col,vec3(1.),cl*.88);
spec=pow(max(dot(reflect(-L,N),V),0.),70.)*(1.-co)*(1.-cl)*.7;city=step(.74,fbm(p*55.))*co*(1.-ice)*(1.-cl);}
else{float t=p.y*uBands+(fbm(p*vec3(2.,6.,2.)+uSeed)-.5)*uTurb*7.;float b=.5+.5*sin(t*3.);
col=mix(uC1,uC2,smoothstep(.15,.85,b));col=mix(col,uC3,smoothstep(.55,.95,.5+.5*sin(t*7.+1.))*.5);col*=.88+.24*fbm(p*vec3(4.,18.,4.));
if(uSpot>0.){float a=atan(p.z,p.x)-1.2;vec2 d=vec2(atan(sin(a),cos(a)),(p.y+.3)*2.4);col=mix(col,vec3(.75,.3,.18),smoothstep(.5,.1,length(d*vec2(1.,1.7)))*.85);}}
float d=length(uSun-vW);float I=clamp(pow(149597.87/d,.35),.7,1.6)*1.15;
col=col*(lit*I+.012)+spec*lit;
col+=vec3(1.,.72,.35)*city*smoothstep(.1,-.2,dot(N,L))*.9;
col+=uAtm.rgb*pow(1.-mu,3.)*uAtm.a*(.12+lit)*.9;
gl_FragColor=vec4(col,1.);
#include <colorspace_fragment>
}`;
// outer atmosphere glow (rendered on a slightly larger back-faced shell)
export const ATM_F=`varying vec3 vP,vW,vN;uniform vec3 uSun,uCol;uniform float uS,uDl;
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
vec3 N=normalize(vN),V=normalize(cameraPosition-vW),L=normalize(uSun-vW);
float i=pow(clamp(-dot(N,V)/uDl,0.,1.),2.2)*smoothstep(-.35,.5,dot(N,L))*uS;gl_FragColor=vec4(uCol*i,1.);
#include <colorspace_fragment>
}`;
export const RING_F=`varying vec3 vP,vW,vN;uniform float uIn,uOut,uA;uniform vec3 uC1,uC2;
#include <logdepthbuf_pars_fragment>
float n(float x){return fract(sin(x*127.1)*43758.5453);}
void main(){
#include <logdepthbuf_fragment>
float t=(length(vP.xy)-uIn)/(uOut-uIn);float x=t*90.;float b=mix(n(floor(x)),n(floor(x)+1.),smoothstep(0.,1.,fract(x)));
float a=(.35+.55*b)*(.6+.4*n(floor(t*420.)));a*=smoothstep(0.,.04,t)*smoothstep(1.,.96,t);
if(uA>.5&&t>.64&&t<.72)a*=.06;if(uA>.5&&t<.12)a*=.3;
gl_FragColor=vec4(mix(uC1,uC2,b)*.95,a*uA);
#include <colorspace_fragment>
}`;
