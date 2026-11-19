/** Original side-view rhythm rules. Shared verbatim by the client and review server.
 * All input transitions apply BEFORE step(state.tick). No wall clock or random globals.
 * Physics positions and velocities use integers; one block = 240000 fixed units.
 */
export const VERSION='ferchodoggs-dash/3.2.0';
export const HZ=240, BPM=150, BEAT_TICKS=96, PATTERN_TICKS=768, MAX_CHUNK_TICKS=600;
export const UNIT=240000, HERO_WIDTH=.8, HERO_HEIGHT=.9, SHIP_CEILING=6;
export const JUMP_APEX_TAP=2.1332875, JUMP_APEX_HOLD=2.233095833333333;
export const GRAVITY=96, JUMP_VELOCITY=20.439;
const GRAVITY_STEP=400,JUMP_IMPULSE=20439,SHIP_ACCEL=80,SHIP_MAX_VY=4000;
const PERIODS=[20*HZ,60*HZ,120*HZ,180*HZ,240*HZ];
const SPEED_RAMP_START=20*HZ,SPEED_STEP_TICKS=8*HZ,SPEED_STEPS=30;
const INITIAL_SPEED_FIXED=8200,SPEED_DELTA_FIXED=160;
const MAX_SPEED_FIXED=INITIAL_SPEED_FIXED+SPEED_DELTA_FIXED*SPEED_STEPS;
const cache=new Map();
const clone=x=>JSON.parse(JSON.stringify(x));
function assertSeed(seed){if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid seed');}
function speedFixedAt(tick){
 const steps=tick<SPEED_RAMP_START?0:Math.min(SPEED_STEPS,Math.floor((tick-SPEED_RAMP_START)/SPEED_STEP_TICKS)+1);
 return INITIAL_SPEED_FIXED+steps*SPEED_DELTA_FIXED;
}
function targetDensityAt(seconds){
 if(seconds<=80)return .42+(.75-.42)*seconds/80;
 if(seconds<=180)return .75+.25*(seconds-80)/100;
 return Math.min(1.15,1+.15*(seconds-180)/80);
}
export function stageAt(tick){
 if(!Number.isSafeInteger(tick)||tick<0)throw Error('Invalid tick');
 let index=0;while(index<PERIODS.length&&tick>=PERIODS[index])index++;
 const baseStart=index?PERIODS[index-1]:0;
 const start=index===5?baseStart+Math.floor((tick-baseStart)/(60*HZ))*60*HZ:baseStart;
 const end=PERIODS[index]??(start+60*HZ);
 return{stage:index+1,speed:speedFixedAt(tick)/1000,targetDensity:targetDensityAt(tick/HZ),progress:Math.min(1,(tick-start)/(end-start)),duration:(end-start)/HZ,startTick:start,endTick:end};
}
export function distanceFixedAt(tick){
 if(!Number.isSafeInteger(tick)||tick<0)throw Error('Invalid tick');
 const initial=Math.min(tick,SPEED_RAMP_START);
 let total=initial*INITIAL_SPEED_FIXED,remaining=tick-initial;
 for(let i=1;i<=SPEED_STEPS&&remaining>0;i++){
  const length=Math.min(remaining,SPEED_STEP_TICKS);
  total+=length*(INITIAL_SPEED_FIXED+i*SPEED_DELTA_FIXED);remaining-=length;
 }
 return total+remaining*MAX_SPEED_FIXED;
}
export function distanceAt(tick){return distanceFixedAt(tick)/UNIT;}
export function jumpHeight(state){return state.hero?.y??state.yFixed/UNIT;}
function random(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function bare(seed,tick=0){return{seed,tick,xFixed:distanceFixedAt(tick),yFixed:0,vyFixed:0,held:false,alive:true,mode:'run',grounded:true,jumpAge:1000,score:Math.floor(distanceAt(tick)),coins:0,distance:distanceAt(tick),nextChunk:Math.floor(tick/PATTERN_TICKS),entities:[],events:[],hero:{x:distanceAt(tick),y:0,vy:0,width:HERO_WIDTH,height:HERO_HEIGHT,grounded:true,mode:'run'}};}
function refresh(s){s.distance=s.xFixed/UNIT;s.hero={x:s.distance,y:s.yFixed/UNIT,vy:s.vyFixed/1000,width:HERO_WIDTH,height:HERO_HEIGHT,grounded:s.grounded,mode:s.mode};s.score=Math.floor(s.distance)+s.coins*25;}
function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
/** Separating-axis test: triangle geometry matches the spike drawn by the renderer. */
export function spikeCollision(rect,spike){
 const triangle=[[spike.x,spike.y],[spike.x+spike.w,spike.y],[spike.x+spike.w/2,spike.y+spike.h]];
 const box=[[rect.x,rect.y],[rect.x+rect.w,rect.y],[rect.x+rect.w,rect.y+rect.h],[rect.x,rect.y+rect.h]];
 const axes=[[1,0],[0,1]];
 for(let i=0;i<3;i++){const p=triangle[i],q=triangle[(i+1)%3];axes.push([-(q[1]-p[1]),q[0]-p[0]]);}
 for(const axis of axes){const a=triangle.map(p=>p[0]*axis[0]+p[1]*axis[1]),b=box.map(p=>p[0]*axis[0]+p[1]*axis[1]);if(Math.max(...a)<=Math.min(...b)||Math.max(...b)<=Math.min(...a))return false;}
 return true;
}
function kernel(s,held){
 if(!s.alive)return s;
 if(typeof held!=='boolean')throw Error('Input must be boolean');
 s.events=[];const oldGround=s.grounded,oldY=s.yFixed/UNIT,oldX=s.xFixed/UNIT;
 s.held=held;
 if(s.mode==='run'&&s.grounded&&held){s.vyFixed=JUMP_IMPULSE;s.grounded=false;s.jumpAge=0;s.events.push({type:'jump'});}
 s.xFixed+=speedFixedAt(s.tick);
 const x=s.xFixed/UNIT;
 // Pads are automatic; orbs are a held interaction while airborne, once per orb.
 for(const e of s.entities){
  if(e.used||x+HERO_WIDTH<=e.x||x>=e.x+e.w)continue;
  if(e.type==='pad'&&s.mode==='run'&&s.yFixed/UNIT<=e.y+.22&&s.vyFixed<=0){s.vyFixed=Math.round(JUMP_IMPULSE*1.24);s.grounded=false;s.jumpAge=20;e.used=true;s.events.push({type:'pad',id:e.id});}
  if(e.type==='orb'&&s.mode==='run'&&!s.grounded&&held&&overlaps({x,y:s.yFixed/UNIT,w:HERO_WIDTH,h:HERO_HEIGHT},e)){s.vyFixed=Math.round(JUMP_IMPULSE*.72);s.jumpAge=20;e.used=true;s.events.push({type:'orb',id:e.id});}
 }
 if(s.mode==='run'){
  // Holding adds ~0.10 blocks to the apex, after a brief initial tap window.
  let bonus=0;if(held&&s.jumpAge>=2&&s.jumpAge<14)bonus=s.jumpAge<8?46:45;
  s.vyFixed-=GRAVITY_STEP-bonus;s.yFixed+=s.vyFixed;s.jumpAge++;
  s.grounded=false;
  if(s.yFixed<=0){s.yFixed=0;s.vyFixed=0;s.grounded=true;}
 }else{
  s.vyFixed=Math.max(-SHIP_MAX_VY,Math.min(SHIP_MAX_VY,s.vyFixed+(held?SHIP_ACCEL:-SHIP_ACCEL)));
  s.yFixed+=s.vyFixed;s.grounded=false;
  if(s.yFixed<0||s.yFixed/UNIT+HERO_HEIGHT>SHIP_CEILING)s.alive=false;
 }
 let body={x,y:s.yFixed/UNIT,w:HERO_WIDTH,h:HERO_HEIGHT};
 for(const e of s.entities){
  if(e.used)continue;
  if(e.type==='portal'&&oldX+HERO_WIDTH<e.x+e.w&&x+HERO_WIDTH>=e.x&&x<e.x+e.w){
   if(e.target==='ship'&&s.mode!=='ship'){s.mode='ship';s.grounded=false;s.vyFixed=Math.max(-SHIP_MAX_VY,Math.min(SHIP_MAX_VY,s.vyFixed));s.events.push({type:'portal',target:'ship',id:e.id});e.used=true;}
   else if(e.target==='run'&&s.mode!=='run'){s.mode='run';s.jumpAge=20;s.events.push({type:'portal',target:'run',id:e.id});e.used=true;}
   else if(e.target==='speed'){s.events.push({type:'portal',target:'speed',id:e.id});e.used=true;}
  }
  if(e.type==='coin'&&overlaps(body,e)){e.used=true;s.coins++;s.events.push({type:'coin',id:e.id});}
  if(e.type==='spike'&&spikeCollision(body,e))s.alive=false;
  if(['block','platform','ceiling'].includes(e.type)&&overlaps(body,e)){
   const top=e.y+e.h;
   if(e.type!=='ceiling'&&s.mode==='run'&&s.vyFixed<=0&&oldY>=top-.025){s.yFixed=Math.round(top*UNIT);s.vyFixed=0;s.grounded=true;body={...body,y:top};}
   else s.alive=false;
  }
 }
 if(!oldGround&&s.grounded)s.events.push({type:'land'});
 s.tick++;
 if(!s.alive)s.events.push({type:'death'});
 refresh(s);return s;
}
const jumpOffsets={0:[],1:[384],2:[192,576],3:[144,384,624],4:[96,288,480,672]};
function densityIntegral(seconds){
 // Integral of the public target curve; one count is one planned action, not a frame.
 // 3.2: obstáculos más seguidos desde el inicio (0,75 → 1,0 → 1,2 → 1,25 acciones/s), techo de 4 por frase.
 const a=Math.min(seconds,80);let total=.75*a+.25*a*a/160;
 const b=Math.min(100,Math.max(0,seconds-80));total+=b+.2*b*b/200;
 const d=Math.min(80,Math.max(0,seconds-180));total+=1.2*d+.05*d*d/160;
 return total+Math.max(0,seconds-260)*1.25;
}
function makePattern(seed,index,safeFallback=false){
 const start=index*PATTERN_TICKS,end=start+PATTERN_TICKS,r=random((seed^Math.imul(index+1,0x9e3779b9))>>>0),stage=stageAt(start).stage;
 let count=index===0?0:Math.max(1,Math.min(4,Math.floor(densityIntegral(end/HZ))-Math.floor(densityIntegral(start/HZ))));
 if(index%13===12)count=Math.max(1,count-1); // Regular lighter phrases, even at the cap.
 const jumpTicks=jumpOffsets[count].map(t=>t+start);
 const entities=[];let n=0;const add=(type,t,y,w,h,extra={})=>entities.push({id:index*100+ ++n,type,x:distanceAt(t)+HERO_WIDTH+.06,y,w,h,...extra});
 if(index===0)add('coin',start+384,.25,.4,.4); // Safe first phrase: learn the control before danger.
 const ship=start>=120*HZ&&index%17===6&&!safeFallback;
 if(ship){
  add('portal',start+80,0,.35,5,{target:'ship'});add('portal',start+620,0,.35,5,{target:'run'});
  for(const at of [200,392,536]){
   const high=at===392;add(high?'ceiling':'block',start+at,high?4.85:0,1.8,high?1.15:.85);
   add('coin',start+at-24,2.35,.42,.42);
  }
  return{seed,index,startTick:start,endTick:end,mode:'ship',jumpTicks:[start+42],entities,plannedJumps:1};
 }
 for(let j=0;j<jumpTicks.length;j++){
  const takeoff=jumpTicks[j],kind=Math.floor(r()*6);
  if(!safeFallback&&kind===2&&stage>=3&&j<jumpTicks.length-1){add('pad',takeoff-10,0,.9,.12);add('block',takeoff+40,0,1.1,1.55,{assist:'pad'});}
  else if(!safeFallback&&kind===3){add('platform',takeoff+40,0,1.0,.65);}
  else add('spike',takeoff+32,0,.75+(r()>.85?.1:0),.8);
  add('coin',takeoff+37,1.65,.40,.40);
  if(!safeFallback&&stage>=4&&kind===4&&j===0&&count<=4)add('orb',takeoff+38,1.8,.7,.7);
 }
 // Speed portals are decorative representations of authoritative stage boundaries.
 for(const tick of PERIODS)if(tick>=start&&tick<end)add('portal',tick,0,.35,5,{target:'speed',speed:stageAt(tick).speed});
 return{seed,index,startTick:start,endTick:end,mode:'run',jumpTicks,entities,plannedJumps:count};
}
/** A constructive input controller used ONLY for certification/tests/offline QA. */
const witnessPatterns=new WeakMap();
export function witnessHeld(state,pattern=null,offset=0){
 let p=pattern;
 if(!p){const index=Math.floor(state.tick/PATTERN_TICKS),cached=witnessPatterns.get(state);if(cached&&cached.index===index&&cached.seed===state.seed)p=cached;else{p=generateChunk(state.seed,index);witnessPatterns.set(state,p);}}
 if(state.mode==='ship')return state.hero.y+state.hero.vy*.16<2.15;
 if(p.mode==='ship')return state.tick>=p.startTick+42+offset&&state.tick<p.startTick+44+offset;
 // An orb is optional: its activation is a real input, never a hidden teleport.
 const orb=state.entities.find(e=>e.type==='orb'&&!e.used&&overlaps({x:state.hero.x,y:state.hero.y,w:HERO_WIDTH,h:HERO_HEIGHT},e));
 if(orb)return true;
 return p.jumpTicks.some(t=>state.tick>=t+offset&&state.tick<t+offset+2);
}
/** Certify the actual transition kernel, not a geometric shortcut.
 * Rejection is conservative: a pattern must have a witness, plus +/-18tick timing
 * margin. startState is carried across seams without resetting y/vy/held/mode.
 */
export function validatePattern(pattern,startState=null,{margin=18}={}){
 if(!pattern||!Array.isArray(pattern.entities)||!Array.isArray(pattern.jumpTicks)||!Number.isInteger(pattern.startTick)||!Number.isInteger(pattern.endTick)||pattern.endTick<=pattern.startTick||pattern.endTick-pattern.startTick>PATTERN_TICKS) return{reachable:false,reason:'Invalid pattern',witness:[]};
 if(pattern.entities.some(e=>!e||!['spike','block','platform','pad','orb','coin','portal','ceiling'].includes(e.type)||![e.x,e.y,e.w,e.h].every(Number.isFinite)||e.w<=0||e.h<=0)||pattern.jumpTicks.some((tick,i)=>!Number.isInteger(tick)||tick<pattern.startTick||tick>=pattern.endTick||i&&tick<=pattern.jumpTicks[i-1]))return{reachable:false,reason:'Invalid geometry or witness timing',witness:[]};
 let witness=[],endState;
 for(const offset of [...new Set([0,-margin,margin])]){
  const s=startState?clone(startState):bare(pattern.seed,pattern.startTick);
  if(s.tick!==pattern.startTick)return{reachable:false,reason:'Checkpoint does not match pattern start',witness:[]};
  // Keep relevant entities from the prior pattern, so seams are tested in context.
  s.entities=[...s.entities.filter(e=>e.x+e.w>=s.hero.x-.5&&e.id<pattern.index*100),...clone(pattern.entities)];
  const events=[];let last=s.held;
  while(s.tick<pattern.endTick&&s.alive){const held=witnessHeld(s,pattern,offset);if(held!==last){events.push({tick:s.tick,held});last=held;}kernel(s,held);}
  if(!s.alive)return{reachable:false,reason:`Witness collision at tick ${s.tick} (offset ${offset})`,witness:[]};
  if(offset===0){witness=events;endState=s;}
 }
 return{reachable:true,witness,endState,marginTicks:margin};
}
export function generateChunk(seed,index){
 assertSeed(seed);if(!Number.isSafeInteger(index)||index<0||index>1000000000)throw Error('Invalid pattern index');
 const key=`${seed}:${index}`;if(cache.has(key))return clone(cache.get(key));
 let p=makePattern(seed,index);let proof=validatePattern(p);
 if(!proof.reachable){p=makePattern(seed,index,true);proof=validatePattern(p);}
 if(!proof.reachable)throw Error(`Pattern certification failed: ${proof.reason}`);
 p.certified=true;p.marginTicks=proof.marginTicks;
 if(cache.size>=128)cache.delete(cache.keys().next().value);cache.set(key,p);return clone(p);
}
function ensureWorld(s){
 const through=Math.floor((s.tick+PATTERN_TICKS)/PATTERN_TICKS);
 while(s.nextChunk<=through){s.entities.push(...generateChunk(s.seed,s.nextChunk).entities);s.nextChunk++;}
 s.entities=s.entities.filter(e=>!e.used&&e.x+e.w>=s.hero.x-2);
}
export function create(seed){assertSeed(seed);const s=bare(seed);ensureWorld(s);return s;}
export function step(state,held=state.held){ensureWorld(state);return kernel(state,held);}
export function applyChunk(state,events,toTick){
 if(!Number.isSafeInteger(toTick)||toTick<=state.tick||toTick-state.tick>MAX_CHUNK_TICKS)throw Error('Invalid chunk range');
 validateEvents(events,state.tick,toTick);let cursor=0,held=state.held;
 while(state.tick<toTick){if(!state.alive)throw Error('Replay extends beyond collision');if(events[cursor]?.tick===state.tick)held=events[cursor++].held;step(state,held);}return state;
}
function validateEvents(events,from,to){
 if(!Array.isArray(events)||events.length>to-from)throw Error('Invalid input log');let last=from-1;
 for(const e of events){if(!e||!Number.isSafeInteger(e.tick)||e.tick<from||e.tick>=to||e.tick<=last||typeof e.held!=='boolean')throw Error('Invalid input event');last=e.tick;}
}
export function replay(seed,events,endTick){
 if(!Number.isSafeInteger(endTick)||endTick<1)throw Error('Invalid end tick');validateEvents(events,0,endTick);let s=create(seed),at=0;
 while(s.tick<endTick){const to=Math.min(endTick,s.tick+MAX_CHUNK_TICKS),chunk=[];while(events[at]&&events[at].tick<to)chunk.push(events[at++]);applyChunk(s,chunk,to);}return s;
}
/** Actual continuous safe simulation for tests/QA, including ship/run seams. */
export function sampleRun(seed,endTick){
 let state=create(seed),held=false;const events=[];
 while(state.tick<endTick&&state.alive){const input=witnessHeld(state);if(input!==held){events.push({tick:state.tick,held:input});held=input;}step(state,input);}
 return{state,events};
}
