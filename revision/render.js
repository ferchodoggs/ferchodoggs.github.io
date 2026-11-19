/** Original “Pulso de calle” Canvas art. All mascot draws use unmodified approved frames. */
import {stageAt} from './engine.js';
import {drawVictoriaBackdrop,VICTORIA_PALETTES} from './victoria-art.js';
const HZ=240, BEAT_TICKS=96;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return((n^(n>>>16))>>>0)/4294967296;};
const PALETTES=VICTORIA_PALETTES;
function dimensions(image){return{w:image?.naturalWidth||image?.width||0,h:image?.naturalHeight||image?.height||0};}
function stageInfo(state){
 const t=(state.tick||0)/HZ;
 const stage=stageAt(state.tick||0).stage;
 return{stage:Number(stage)||1,t};
}
function rounded(c,x,y,w,h,r){
 r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();
}
export class SideRenderer {
 constructor(canvas,{frames=[],logo=null}={}){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.frames=frames;this.logo=logo;this.frameBounds={w:Math.max(1,...frames.map(image=>dimensions(image).w)),h:Math.max(1,...frames.map(image=>dimensions(image).h))};this.disposed=false;
  this.last=null;this.trail=[];this.particles=[];this.flashAt=-10000;this.deadAt=-10000;this.lastTrailAt=-10000;this.lastEventTick=-1;
 }
 setAssets({frames=[],logo=null}={}){this.frames=frames;this.logo=logo;this.frameBounds={w:Math.max(1,...frames.map(image=>dimensions(image).w)),h:Math.max(1,...frames.map(image=>dimensions(image).h))};}
 dispose(){this.disposed=true;this.frames=[];this.logo=null;this.trail=[];this.particles=[];}
 /** Geometry is public for recording-canvas tests and exact collider overlays in development. */
 geometry(state,width,height){
  const hero=state.hero||state.player||{x:state.distance||0,y:0,width:.8,height:.9};
  const speed=state.speed||state.stage?.speed||stageAt(state.tick||0).speed;
  const visible=Math.max(13,speed*1.2),unit=Math.min(width/visible,height*.14);
  const ground=height*.77,anchor=width*.24,cameraX=hero.x-anchor/unit;
  return{width,height,hero,speed,unit,ground,anchor,cameraX,
   project:(x,y)=>({x:(x-cameraX)*unit,y:ground-y*unit}),
   box:e=>({x:(e.x-cameraX)*unit,y:ground-(e.y+e.h)*unit,w:e.w*unit,h:e.h*unit})};
 }
 render(state,{alpha=0,now,reducedMotion=false,deadProgress}={}){
  if(this.disposed||!this.ctx||!state)return;
  const c=this.ctx,rect=this.canvas.getBoundingClientRect?.()||{width:this.canvas.width,height:this.canvas.height};
  const w=Math.max(1,rect.width),h=Math.max(1,rect.height),dpr=Math.min(globalThis.devicePixelRatio||1,2);
  if(this.canvas.width!==Math.round(w*dpr)||this.canvas.height!==Math.round(h*dpr)){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);}
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  const time=Number.isFinite(now)?now:(state.tick||0)/HZ*1000;
  const {stage,t}=stageInfo(state),palette=PALETTES[Math.min(5,stage-1)];
  const g=this.geometry(state,w,h),hero=g.hero,alive=state.alive!==false,mode=hero.mode||state.mode||'run';
  const reset=!this.last||(state.tick||0)<this.last.tick||Math.abs(hero.x-this.last.x)>20;
  if(reset){this.trail=[];this.particles=[];this.deadAt=-10000;this.flashAt=-10000;this.lastEventTick=-1;this.lastTrailAt=time;}
  const beat=reducedMotion?0:Math.max(0,Math.cos(((state.tick||0)+clamp(alpha,0,1))/BEAT_TICKS*Math.PI*2))**12;
  if(this.last&&!reset){
   if(stage!==this.last.stage||mode!==this.last.mode)this.flashAt=time;
   if(!alive&&this.last.alive){this.deadAt=time;this.burst(hero.x+hero.width/2,hero.y+hero.height/2,28,'death',time,palette);}
   if((state.coins||0)>this.last.coins)this.burst(hero.x+hero.width*.75,hero.y+hero.height*.6,10,'coin',time,palette);
   if(hero.grounded&&!this.last.grounded&&alive)this.burst(hero.x+hero.width*.5,hero.y,9,'land',time,palette);
  }
  if(state.events&&this.lastEventTick!==state.tick){
   for(const event of state.events){
    if(event.type==='portal')this.flashAt=time;
    if(event.type==='land'&&alive)this.burst(hero.x+hero.width*.5,hero.y,6,'land',time,palette);
    if(event.type==='orb'||event.type==='pad')this.burst(hero.x+hero.width*.5,hero.y+hero.height*.5,8,'orb',time,palette);
   }
   this.lastEventTick=state.tick;
  }
  if(!reducedMotion&&alive&&!hero.grounded&&time-this.lastTrailAt>70){
   this.trail.push({x:hero.x,y:hero.y,mode,at:time,frame:this.frame(state,mode)});this.lastTrailAt=time;
  }
  this.trail=this.trail.filter(p=>time-p.at<240).slice(-4);
  this.particles=this.particles.filter(p=>time-p.at<p.life).slice(-70);
  c.save();
  const deathAge=time-this.deadAt;
  if(!reducedMotion&&deathAge>=0&&deathAge<140){const k=1-deathAge/140;c.translate(Math.sin(deathAge*.13)*1.4*k,Math.cos(deathAge*.1)*1.1*k);}
  this.background(c,state,g,palette,beat,reducedMotion);
  for(const entity of state.entities||[]){
   if(entity.collected||entity.active===false||entity.used&&entity.type==='coin')continue;
   if(entity.x+entity.w<g.cameraX-2||entity.x>g.cameraX+w/g.unit+2)continue;
   this.entity(c,entity,g,palette,beat,t,reducedMotion);
  }
  if(!reducedMotion)for(const trail of this.trail){const age=(time-trail.at)/240;if(age<=.07)continue;c.globalAlpha=(1-age)*.10;this.drawHero(c,{...hero,x:trail.x,y:trail.y},trail.frame,trail.mode,g,0,false);c.globalAlpha=1;}
  const foot=g.project(hero.x+hero.width*.5,hero.y),coreWidth=hero.width*g.unit;
  const lift=Math.max(0,hero.y),shadowScale=1/(1+lift*.18);
  c.fillStyle='#071421';c.globalAlpha=.34*shadowScale;c.beginPath();c.ellipse(foot.x,g.ground+2,coreWidth*.57*shadowScale,Math.max(1.5,g.unit*.085*shadowScale),0,0,Math.PI*2);c.fill();c.globalAlpha=1;
  const stride=Math.sin(hero.x*1.05/5*Math.PI*2);
  const rotation=reducedMotion?0:hero.grounded?stride*.018:clamp(-(hero.vy||0)*.006,-.13,.13);
  if(!reducedMotion&&alive&&hero.grounded&&this.last&&!reset&&Math.floor(hero.x*2.1)!==Math.floor(this.last.x*2.1))this.burst(hero.x+hero.width*.23,hero.y,2,'run',time,palette);
  const progress=Number.isFinite(deadProgress)?clamp(deadProgress,0,1):alive?0:clamp(deathAge/340,0,1);
  c.globalAlpha=alive?1:1-progress;
  this.drawHero(c,hero,this.frame(state,mode),mode,g,rotation,true);c.globalAlpha=1;
  if(!this.frames.length){c.fillStyle='#FFF4E0';c.font='10px Arial';c.textAlign='left';c.fillText('MARCADOR · CARGANDO ARTE ORIGINAL',8,h-9);}
  if(!reducedMotion)this.drawParticles(c,g,time);
  const flash=time-this.flashAt;
  if(!reducedMotion&&flash>=0&&flash<170){c.globalAlpha=.085*(1-flash/170);c.fillStyle='#FFF4E0';c.fillRect(0,0,w,h);c.globalAlpha=1;}
  c.restore();
  this.last={tick:state.tick||0,x:hero.x,y:hero.y,coins:state.coins||0,stage,mode,grounded:!!hero.grounded,alive};
 }
 frame(state,mode){
  if(!this.frames.length)return null;
  const hero=state.hero||state.player||{};
  const index=mode==='ship'?1:!hero.grounded?((hero.vy||0)>0?3:4):Math.floor((hero.x||0)*1.05);
  return this.frames[((index%this.frames.length)+this.frames.length)%this.frames.length];
 }
 background(c,state,g,p,beat,reduced){drawVictoriaBackdrop(c,state,g,p,beat,reduced);}
 entity(c,e,g,p,beat,time,reduced){
  const b=g.box(e),{x,y,w,h}=b;
  if(e.type==='spike'){
   // The authoritative triangle is fully visible: machined street deflector, not a copied icon.
   c.save();const metal=c.createLinearGradient(x,y,x+w,y+h);metal.addColorStop(0,'#7E8F9B');metal.addColorStop(.45,'#354E62');metal.addColorStop(1,'#172C3D');
   c.fillStyle=metal;c.beginPath();c.moveTo(x,y+h);c.lineTo(x+w*.5,y);c.lineTo(x+w,y+h);c.closePath();c.fill();
   c.strokeStyle='#101C2B';c.lineWidth=Math.max(2,g.unit*.09);c.stroke();c.strokeStyle='#FF9A3C';c.lineWidth=Math.max(1.3,g.unit*.045);c.stroke();
   c.clip();c.strokeStyle='#FFB05A';c.lineWidth=Math.max(2,w*.13);c.globalAlpha=.8;
   for(let d=-h;d<w+h;d+=Math.max(7,w*.4)){c.beginPath();c.moveTo(x+d,y+h);c.lineTo(x+d+h*.6,y+h*.48);c.stroke();}c.globalAlpha=1;
   c.restore();c.fillStyle='#FFF1CF';
   for(const dx of[.22,.78]){c.beginPath();c.arc(x+w*dx,y+h*.86,Math.max(.7,w*.038),0,Math.PI*2);c.fill();}
   return;
  }
  if(e.type==='block'||e.type==='platform'||e.type==='ceiling'){
   const safe=e.type==='platform',over=e.type==='ceiling';
   const face=c.createLinearGradient(x,y,x,y+h);face.addColorStop(0,safe?'#AD9B83':'#54616A');face.addColorStop(1,safe?'#635F5A':'#253A4D');c.fillStyle=face;c.fillRect(x,y,w,h);
   c.strokeStyle='#10202F';c.lineWidth=Math.max(2,g.unit*.075);c.strokeRect(x+.7,y+.7,Math.max(0,w-1.4),Math.max(0,h-1.4));
   c.fillStyle=safe?'#EBD0A6':'#FFAB54';c.fillRect(x+1,over?y+h-Math.min(3,h*.3)-1:y+1,Math.max(0,w-2),Math.min(3,h*.3));
   c.save();c.beginPath();c.rect(x+1,y+1,Math.max(0,w-2),Math.max(0,h-2));c.clip();
   if(safe){
    c.strokeStyle='#514D4C';c.lineWidth=.8;const tile=Math.max(9,g.unit*.38);for(let xx=x+tile;xx<x+w;xx+=tile){c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y+h);c.stroke();}
   }else if(w>10&&h>10){
    c.strokeStyle='#97A3AA';c.lineWidth=Math.max(1,g.unit*.045);c.globalAlpha=.55;c.strokeRect(x+4,y+4,Math.max(0,w-8),Math.max(0,h-8));c.beginPath();c.moveTo(x+5,y+h-5);c.lineTo(x+w-5,y+5);c.stroke();c.globalAlpha=1;
    c.fillStyle='#D8D8CD';for(const dx of[.15,.85])for(const dy of[.18,.82]){c.beginPath();c.arc(x+w*dx,y+h*dy,Math.max(.7,g.unit*.03),0,Math.PI*2);c.fill();}
   }
   c.restore();return;
  }
  if(e.type==='coin'){
   const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2,rx=r*(reduced?1:.7+.3*Math.abs(Math.sin(time*5+e.x)));
   c.fillStyle='#E99B34';c.beginPath();c.ellipse(cx+1,cy+1,rx,r,0,0,Math.PI*2);c.fill();c.fillStyle='#FFE2A0';c.strokeStyle='#FFF4E0';c.lineWidth=Math.max(1,r*.13);c.beginPath();c.ellipse(cx,cy,rx*.86,r*.86,0,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#9E4817';c.font=`bold ${r*1.25}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText('F',cx,cy+r*.05);c.textBaseline='alphabetic';return;
  }
  if(e.type==='pad'){
   c.fillStyle='#364556';rounded(c,x,y,w,h,Math.min(2,h/3));c.fill();c.fillStyle='#F2CB65';c.fillRect(x,y,w,Math.max(1,h*.36));c.strokeStyle='#FFF0C5';c.lineWidth=1;c.stroke();
   c.strokeStyle='#A4843F';c.lineWidth=1;c.beginPath();for(let i=0;i<5;i++){const xx=x+w*(.18+i*.16),yy=y+h*(i%2?.78:.47);i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();return;
  }
  if(e.type==='orb'){
   const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2;c.fillStyle='#172C3D';c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();c.strokeStyle='#FFD678';c.lineWidth=Math.max(1.4,g.unit*.045);c.stroke();
   c.strokeStyle='#FFF1C9';c.lineWidth=Math.max(1,r*.15);c.beginPath();c.moveTo(cx-r*.42,cy+r*.15);c.lineTo(cx,cy-r*.3);c.lineTo(cx+r*.42,cy+r*.15);c.moveTo(cx,cy-r*.3);c.lineTo(cx,cy+r*.42);c.stroke();
   if(!reduced){c.fillStyle='#FFDDAA';c.globalAlpha=.18+beat*.15;c.beginPath();c.arc(cx,cy,r*.62,0,Math.PI*2);c.fill();c.globalAlpha=1;}return;
  }
  if(e.type==='portal'){
   const target=e.target||e.mode||e.to,cx=x+w/2,cy=y+h/2,color=target==='ship'?'#68E4EC':target==='run'?'#C7F43A':'#FF87E8';
   c.fillStyle='#172B3A';c.globalAlpha=.35;c.fillRect(x,cy-h*.48,w,h*.96);c.globalAlpha=1;
   // Route markers are narrow architectural thresholds; geometry matches the trigger width.
   c.strokeStyle=color;c.lineWidth=Math.max(1.2,g.unit*.045);c.beginPath();c.moveTo(x,cy+h*.48);c.lineTo(x,cy-h*.38);c.quadraticCurveTo(cx,cy-h*.56,x+w,cy-h*.38);c.lineTo(x+w,cy+h*.48);c.stroke();
   c.strokeStyle='#FFF0D2';c.lineWidth=.8;c.beginPath();c.moveTo(cx,cy-h*.33);c.lineTo(cx,cy+h*.42);c.stroke();
   for(let n=0;n<5;n++){c.fillStyle=color;c.globalAlpha=.45+beat*.25;c.fillRect(x,cy-h*.25+n*h*.15,Math.max(1,w*.24),Math.max(1,h*.018));}c.globalAlpha=1;

  }
 }
 drawHero(c,hero,frame,mode,g,rotation,drawPlaceholder){
  const x=(hero.x-g.cameraX)*g.unit,y=g.ground-(hero.y+hero.height)*g.unit,w=hero.width*g.unit,h=hero.height*g.unit;
  c.save();c.translate(x+w*.5,y+h);c.rotate(rotation);
  let imageBox={x:-w/2,y:-h,w,h};
  if(mode==='ship'){
   // This original craft fits the same physical box; the original mascot is a passenger, unmodified.
   const base=-h*.17;c.fillStyle='#FF7A1A';c.beginPath();c.moveTo(-w*.5,base-h*.05);c.lineTo(w*.48,base-h*.05);c.lineTo(w*.24,0);c.lineTo(-w*.27,0);c.closePath();c.fill();c.strokeStyle='#FFF4E0';c.lineWidth=Math.max(1,g.unit*.04);c.stroke();
   c.fillStyle='#5B21B6';c.fillRect(-w*.22,base-h*.15,w*.45,h*.15);c.fillStyle='#C7F43A';c.fillRect(-w*.12,-h*.10,w*.24,h*.045);
   c.fillStyle='#68E4EC';c.beginPath();c.moveTo(-w*.49,base);c.lineTo(-w*.69,base+h*.05);c.lineTo(-w*.49,base+h*.08);c.closePath();c.fill();
   imageBox={x:-w*.34,y:-h,w:w*.68,h:h*.76};
  }
  const size=dimensions(frame);
  if(frame&&size.w>0&&size.h>0){
   const scale=Math.min(imageBox.w/this.frameBounds.w,imageBox.h/this.frameBounds.h),dw=size.w*scale,dh=size.h*scale;
   c.drawImage(frame,imageBox.x+(imageBox.w-dw)/2,imageBox.y+imageBox.h-dh,dw,dh);
  }else if(drawPlaceholder){c.strokeStyle='#FFF4E0';c.lineWidth=1.5;c.strokeRect(-w/2,-h,w,h);c.fillStyle='#FFF4E0';c.font=`${Math.max(8,h*.32)}px Arial`;c.textAlign='center';c.fillText('F',0,-h*.3);}
  c.restore();
 }
 burst(x,y,count,kind,at,palette){
  for(let i=0;i<count;i++){
   const angle=hash(i*59+Math.round(x*31))*Math.PI*2,speed=kind==='run'?.7:kind==='land'?1.2:kind==='death'?3.7:2.4;
   this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed+(kind==='land'?1:0),at,life:kind==='death'?420:kind==='run'?190:300,size:kind==='death'?.09:.05,color:kind==='land'||kind==='run'?'#E3BC8E':kind==='coin'?'#FFE568':palette.line});
  }
 }
 drawParticles(c,g,time){
  for(const p of this.particles){const age=(time-p.at)/1000,t=clamp((time-p.at)/p.life,0,1),point=g.project(p.x+p.vx*age,p.y+p.vy*age-3*age*age),s=Math.max(1,p.size*g.unit*(1-t));c.globalAlpha=1-t;c.fillStyle=p.color;c.fillRect(point.x-s/2,point.y-s/2,s,s);}c.globalAlpha=1;
 }
}
