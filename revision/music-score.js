import {BPM} from './engine.js';

/** Original arrangement: five salsa bars (exactly 8 s at 150 BPM), then Latin tech.
 * No recordings, samples, lyrics or melodies from the reference artists/tracks.
 * Browser and PCM exports consume this same deterministic score and voice map.
 */
export const INTRO_SECONDS=8;
export const STEP_SECONDS=60/BPM/4;
export const INTRO_STEPS=80;
export const LOOP_STEPS=128;
const midi=n=>440*2**((n-69)/12);
const CHORDS=[[57,60,64,67],[55,59,62,65],[53,57,60,64],[52,56,59,62]];
const ROOTS=[33,31,29,28];
const MONTUNO=[0,2,1,3,2,1,0,2];
export function sectionAtStep(step){return step<INTRO_STEPS?'salsa-intro':'latin-tech';}
export function arrangementAtStep(step){
 if(!Number.isSafeInteger(step)||step<0)throw Error('Invalid music step');
 const intro=step<INTRO_STEPS,n=intro?step:(step-INTRO_STEPS)%LOOP_STEPS;
 const q=n%16,bar=Math.floor(n/16),chord=CHORDS[bar%4],events=[];
 const add=(instrument,volume,frequency,duration,extra={})=>events.push({instrument,volume,...(frequency?{frequency}:{}),...(duration?{duration}:{}),...extra});
 // Two-bar 3–2 clave, a rhythmic convention, synthesised rather than sampled.
 if([0,6,12,20,26].includes(n%32))add('clave',intro?.055:.026);
 if(intro){
  if([0,3,6,10,12,14].includes(q)){
   const slot=MONTUNO[(Math.floor(n/2)+bar)%MONTUNO.length];
   add('piano',.075,midi(chord[slot]),.19);
   if(q===0||q===10)add('piano',.035,midi(chord[(slot+2)%4]+12),.16);
  }
  if([0,6,10,14].includes(q))add('bass',.115,midi(ROOTS[bar%4]),q===14?.14:.19);
  if([4,6,11,14].includes(q))add('conga',q===14?.07:.055,q===6?190:165);
  if([2,7,10,15].includes(q))add('bongo',.04,q===7?290:350);
  if(q%4===0)add('bell',.023);
  if(bar===4){
   if(q===0||q===8)for(const note of chord.slice(0,3))add('brass',.025,midi(note),.23);
   if(q>=12)add('timbale',.05,510+(q-12)*90);
  }
 }else{
  if(q%4===0)add('kick',.265);
  if([2,6,10,14].includes(q))add('bass',.155,midi(ROOTS[bar%4]),.18);
  if(q===4||q===12)add('clap',.055);
  if(q%2===0)add('hat',q%4===2?.024:.014);
  if([3,6,11,14].includes(q))add('conga',q===11?.055:.042,q===6?190:165);
  if([0,6,8,14].includes(q))add('bell',q===8?.023:.015);
  if([3,7,10,14].includes(q)){
   const slot=MONTUNO[(bar+Math.floor(q/2))%MONTUNO.length];
   add('piano',.044,midi(chord[slot]),.15);
  }
  // Warm syncopated chord stabs, rather than a continuous high-pitched lead.
  if((bar%4<2&&q===6)||(bar%4===2&&q===14)||(bar%4===3&&q===2)){
   for(const note of chord.slice(0,3))add('brass',.024,midi(note),.20);
  }
  if(bar%4===3&&q>=12)add('timbale',.033+(q-12)*.005,430+(q-12)*110);
  if(bar===7&&q===15)add('sweep',.027);
 }
 return events;
}

/** Low-level voice map shared with offline rendering; volumes precede master gain.
 * cutoff on tones is a low-pass; cutoff on noise is a high-pass.
 */
export function voicesForEvent(event){
 const f=event.frequency||220,v=event.volume??.05,d=event.duration;
 const tone=(from,to,duration,volume,waveform='sine',attack=.004,cutoff)=>({type:'tone',from,to,duration,volume,waveform,attack,...(cutoff?{cutoff}:{})});
 const noise=(duration,volume,cutoff)=>({type:'noise',duration,volume,cutoff,attack:.001});
 switch(event.instrument){
  case 'kick':return[tone(138,43,.17,v,'sine',.002)];
  case 'bass':return[tone(f,f,d||.18,v,'triangle',.006,460),tone(f/2,f/2,d||.18,v*.28,'sine',.006)];
  case 'piano':return[tone(f,f,d||.19,v,'triangle',.003,2400),tone(f*2.006,f*2.006,(d||.19)*.66,v*.22,'sine',.002)];
  case 'brass':return[tone(f*.995,f,d||.20,v,'sawtooth',.022,1250),tone(f*1.005,f,d||.20,v*.42,'triangle',.024,1600)];
  case 'conga':return[tone(f*1.65,f,.17,v,'sine',.001),noise(.018,v*.18,1800)];
  case 'bongo':return[tone(f*1.35,f,.10,v,'sine',.001),noise(.013,v*.14,2400)];
  case 'clave':return[tone(1950,1680,.028,v,'sine',.001),tone(2880,2540,.018,v*.16,'sine',.001)];
  case 'bell':return[tone(565,565,.07,v,'square',.001,3400),tone(845,845,.055,v*.42,'square',.001,3400)];
  case 'hat':return[noise(.025,v,6500)];
  case 'clap':return[noise(.073,v,1450),noise(.019,v*.28,2100)];
  case 'timbale':return[tone(f*1.8,f,.11,v,'sine',.001),noise(.035,v*.34,1900)];
  case 'sweep':return[noise(.15,v,3500)];
  default:return[];
 }
}
