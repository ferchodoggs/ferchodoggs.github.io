/** Original vector interpretation of La Victoria's valley and historic centre.
 * Not a geographic reconstruction or a tracing of photographs. No external assets.
 */
const noise=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return((n^(n>>>16))>>>0)/4294967296;};
const mod=(n,m)=>(n%m+m)%m;
export const VICTORIA_LANDMARKS=Object.freeze(['valle de Aragua','Terminal de La Victoria · interpretación','El Soco · interpretación','Plaza José Félix Ribas · interpretación','Cuartel Mariano Montilla · interpretación','Plaza de las Madres · interpretación']);
export const VICTORIA_PALETTES=Object.freeze([
 {top:'#172A4A',mid:'#8B6A89',bottom:'#EDA46C',line:'#FFD5A0',accent:'#FF7A1A',far:'#7D718C',hill:'#4F6470',near:'#253C49'},
 {top:'#102542',mid:'#555782',bottom:'#D68A75',line:'#FFE0B3',accent:'#FF9D48',far:'#4B4D71',hill:'#354C62',near:'#243B4B'},
 {top:'#101B37',mid:'#394A74',bottom:'#927A92',line:'#9BE5E4',accent:'#FF7A1A',far:'#3D496B',hill:'#30445C',near:'#203548'},
 {top:'#15182F',mid:'#51456D',bottom:'#AD727C',line:'#FFCFA1',accent:'#FF9D48',far:'#47435E',hill:'#2E3C53',near:'#203146'},
 {top:'#0B1D31',mid:'#25506A',bottom:'#737F9C',line:'#9BE5E4',accent:'#FF7A1A',far:'#354C65',hill:'#274357',near:'#1B3042'},
 {top:'#17172E',mid:'#504371',bottom:'#A06C85',line:'#FFD0A5',accent:'#FF9D48',far:'#484161',hill:'#303B53',near:'#243046'},
]);
function polygon(c,points,fill){c.fillStyle=fill;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function arch(c,x,y,w,h,fill){
 c.fillStyle=fill;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w*.5);c.quadraticCurveTo(x,y,x+w*.5,y);c.quadraticCurveTo(x+w,y,x+w,y+w*.5);c.lineTo(x+w,y+h);c.closePath();c.fill();
}
function hill(c,w,ground,h,travel,layer,p){
 const span=Math.max(100,w*.3),offset=mod(travel,span),start=Math.floor(travel/span),base=ground-h*(layer?.34:.44);
 const ridge=i=>base-noise(start+i+layer*91)*h*.065;
 c.fillStyle=layer?p.hill:p.far;c.globalAlpha=layer?.78:.56;c.beginPath();c.moveTo(0,ground);
 for(let i=-2;i<Math.ceil(w/span)+3;i++){
  const x=i*span-offset,y=ridge(i),next=ridge(i+1);
  if(i===-2)c.lineTo(x,y);
  c.quadraticCurveTo(x+span*.5,Math.min(y,next)-h*.028,x+span,next);
 }
 c.lineTo(w,ground);c.closePath();c.fill();c.globalAlpha=1;
}
function church(c,x,base,s){
 // Guadalupe: pale curved pediment and ONE tall bell/clock tower on the right.
 c.save();c.translate(x,base);c.scale(s,s);
 c.fillStyle='#DCCEB7';c.fillRect(0,-91,150,91);
 c.fillStyle='#EFE0C6';c.beginPath();c.moveTo(0,-91);c.quadraticCurveTo(26,-93,31,-109);c.quadraticCurveTo(43,-134,57,-111);c.quadraticCurveTo(71,-96,91,-91);c.lineTo(150,-91);c.lineTo(150,0);c.lineTo(0,0);c.closePath();c.fill();
 c.strokeStyle='#FAEAD0';c.lineWidth=3;c.beginPath();c.moveTo(0,-91);c.quadraticCurveTo(26,-93,31,-109);c.quadraticCurveTo(43,-134,57,-111);c.quadraticCurveTo(71,-96,91,-91);c.lineTo(150,-91);c.stroke();
 c.fillStyle='#E9DCC4';c.fillRect(116,-176,36,176);
 c.fillStyle='#B79D82';c.fillRect(119,-175,4,175);c.fillRect(145,-175,4,175);
 c.fillStyle='#F4E7CE';c.fillRect(113,-179,42,6);c.fillRect(113,-136,42,5);c.fillRect(113,-104,42,5);
 c.fillStyle='#C99B52';c.beginPath();c.ellipse(134,-181,18,20,0,Math.PI,Math.PI*2);c.fill();
 c.fillStyle='#E5BE70';c.fillRect(131,-209,6,9);
 arch(c,127,-169,14,24,'#455264');
 c.fillStyle='#394958';c.beginPath();c.arc(134,-121,9,0,Math.PI*2);c.fill();c.fillStyle='#E9DFCB';c.beginPath();c.arc(134,-121,7,0,Math.PI*2);c.fill();
 c.strokeStyle='#465264';c.lineWidth=1;c.beginPath();c.moveTo(134,-126);c.lineTo(134,-121);c.lineTo(138,-119);c.stroke();
 for(const dx of[9,48,87]){c.fillStyle='#FAEBD1';c.fillRect(dx,-85,6,85);c.fillRect(dx-2,-88,10,4);}
 arch(c,22,-45,20,45,'#3C4954');arch(c,62,-45,20,45,'#3C4954');arch(c,125,-89,18,38,'#344453');
 c.fillStyle='#F4E2C6';c.fillRect(-3,-4,158,4);c.restore();
}
function barracks(c,x,base,s){
 // Montilla: cylindrical stone towers, salmon trims and pale crenellations.
 c.save();c.translate(x,base);c.scale(s,s);
 c.fillStyle='#A9987C';c.fillRect(0,-78,216,78);c.fillStyle='#BF8B81';c.fillRect(0,-83,216,18);c.fillStyle='#E1D6BC';c.fillRect(0,-87,216,5);c.fillRect(0,-66,216,4);
 for(let i=0;i<16;i++){c.fillStyle='#BF8B81';c.fillRect(i*14,-94,8,12);c.fillStyle='#E6DAC3';c.fillRect(i*14-1,-95,10,3);}
 for(let i=0;i<8;i++){const dx=8+i*26;c.fillStyle='#BD8980';c.fillRect(dx-2,-44,20,44);arch(c,dx,-42,16,42,'#35434D');c.fillStyle='#E4D7BD';c.fillRect(dx-4,-48,24,4);}
 for(const tx of[40,148]){
  const wall=c.createLinearGradient(tx-19,0,tx+19,0);wall.addColorStop(0,'#95836B');wall.addColorStop(.45,'#C0AB83');wall.addColorStop(1,'#8C7B67');c.fillStyle=wall;c.fillRect(tx-20,-122,40,122);
  c.fillStyle='#BC8B80';c.fillRect(tx-22,-128,44,18);c.fillStyle='#E3D8BE';c.fillRect(tx-23,-113,46,4);c.fillRect(tx-23,-128,46,4);
  for(let i=0;i<5;i++){c.fillStyle='#C39387';c.fillRect(tx-22+i*10,-140,7,16);c.fillStyle='#E4D9C0';c.fillRect(tx-23+i*10,-141,9,3);}
  c.fillStyle='#C38F83';c.fillRect(tx-8,-93,16,32);arch(c,tx-4,-91,8,28,'#39464E');
  arch(c,tx-8,-43,16,43,'#2E404B');c.fillStyle='#E7D9BE';c.fillRect(tx-24,-4,48,4);
 }
 c.restore();
}
function house(c,x,base,w,h,id,lit){
 const walls=['#BD9280','#D9B89A','#B8B3AB','#BB9DA5'];
 c.fillStyle=walls[id%4];c.fillRect(x,base-h,w,h);
 polygon(c,[[x-3,base-h],[x+w*.48,base-h-10],[x+w+3,base-h],[x+w,base-h+5],[x,base-h+5]],id%2?'#81504F':'#955C51');
 c.fillStyle='#D9C7AD';c.fillRect(x,base-h+6,w,3);c.fillRect(x,base-3,w,3);
 const slots=Math.max(1,Math.floor(w/25));
 for(let i=0;i<slots;i++){
  const wx=x+8+i*(w-14)/slots,wy=base-h+19,ww=Math.min(13,w/slots-8),wh=Math.min(27,h-25);
  if(ww<=0||wh<=0)continue;
  arch(c,wx-2,wy-2,ww+4,wh+3,'#D7C8B2');arch(c,wx,wy,ww,wh,lit?'#B4916F':'#45535E');
  c.strokeStyle='#5C5960';c.lineWidth=.8;c.beginPath();c.moveTo(wx+ww*.5,wy+2);c.lineTo(wx+ww*.5,wy+wh);c.stroke();
 }
}
function tree(c,x,base,s,color){
 c.fillStyle='#403E40';c.fillRect(x-1.2*s,base-35*s,2.4*s,35*s);
 c.fillStyle=color;c.beginPath();c.ellipse(x,base-42*s,14*s,21*s,0,0,Math.PI*2);c.fill();
 c.fillStyle='#78876E';c.globalAlpha=.22;c.beginPath();c.ellipse(x-4*s,base-45*s,8*s,14*s,-.2,0,Math.PI*2);c.fill();c.globalAlpha=1;
}
function lamp(c,x,base,s,beat){
 c.strokeStyle='#233442';c.lineWidth=2*s;c.beginPath();c.moveTo(x,base);c.lineTo(x,base-57*s);c.stroke();
 c.fillStyle='#21303C';c.fillRect(x-5*s,base-67*s,10*s,14*s);
 c.fillStyle='#FFD39A';c.fillRect(x-3*s,base-64*s,6*s,8*s);
 c.fillStyle='#F5D19D';polygon(c,[[x-7*s,base-67*s],[x,base-73*s],[x+7*s,base-67*s]],'#243642');
 const halo=c.createRadialGradient(x,base-60*s,0,x,base-60*s,22*s);halo.addColorStop(0,`rgba(255,193,112,${.14+beat*.025})`);halo.addColorStop(1,'rgba(255,193,112,0)');c.fillStyle=halo;c.fillRect(x-22*s,base-82*s,44*s,44*s);
 c.fillStyle='#223642';c.fillRect(x-3*s,base-4*s,6*s,4*s);
}

/* ===== Ruta 3.2: de la terminal a la Plaza de las Madres (orden aproximado; reinterpretación propia, no un mapa). ===== */
export const VICTORIA_ROUTE=Object.freeze(['TERMINAL DE LA VICTORIA','EL SOCO','CENTRO · LA VICTORIA','PLAZA JOSÉ FÉLIX RIBAS','CUARTEL MARIANO MONTILLA','PLAZA DE LAS MADRES']);
const lerp=(a,b,t)=>a+(b-a)*t;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return`rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],t))).join(',')})`;};
// Ciclo de 60 s de juego: día → atardecer → noche → amanecer.
const SKY=[
 {at:0,top:'#3F86C8',mid:'#7FB6DE',bottom:'#F3D7A6',night:0},
 {at:.30,top:'#3F86C8',mid:'#86B9DC',bottom:'#F6D9A8',night:0},
 {at:.42,top:'#26407A',mid:'#B0688A',bottom:'#F59A5E',night:.25},
 {at:.52,top:'#0E1430',mid:'#2A2F5E',bottom:'#5B3F6E',night:.85},
 {at:.82,top:'#0A0F26',mid:'#1D2550',bottom:'#3F3768',night:1},
 {at:.93,top:'#3C4E8C',mid:'#B58AA6',bottom:'#F7B985',night:.35},
 {at:1,top:'#3F86C8',mid:'#7FB6DE',bottom:'#F3D7A6',night:0}];
export function dayPhase(tick){const t=((tick||0)/240)%60/60;let k=0;while(k<SKY.length-2&&SKY[k+1].at<=t)k++;const a=SKY[k],b=SKY[k+1],f=(t-a.at)/Math.max(1e-6,b.at-a.at);return{t,top:mix(a.top,b.top,f),mid:mix(a.mid,b.mid,f),bottom:mix(a.bottom,b.bottom,f),night:lerp(a.night,b.night,f)};}
function label(c,text,x,y,size){
 c.save();c.font=`900 ${size}px "Arial Black",Arial,sans-serif`;c.textAlign='center';c.textBaseline='middle';
 const w=c.measureText(text).width+size*1.3,h=size*1.75;
 c.fillStyle='rgba(12,8,22,.82)';c.beginPath();const r=h*.3;c.moveTo(x-w/2+r,y-h/2);c.arcTo(x+w/2,y-h/2,x+w/2,y+h/2,r);c.arcTo(x+w/2,y+h/2,x-w/2,y+h/2,r);c.arcTo(x-w/2,y+h/2,x-w/2,y-h/2,r);c.arcTo(x-w/2,y-h/2,x+w/2,y-h/2,r);c.closePath();c.fill();
 c.fillStyle='#FF8528';c.fillRect(x-w/2+r,y+h/2-size*.2,w-2*r,size*.2);
 c.fillStyle='#FFF4E0';c.fillText(text,x,y-size*.05);c.restore();
}
function terminal(c,x,base,s,night){
 c.save();c.translate(x,base);c.scale(s,s);
 c.fillStyle='#E9EEF2';c.fillRect(-10,-118,330,12);c.fillStyle='#C9D2DA';c.fillRect(-10,-106,330,5);
 for(const px of[10,95,180,265])c.fillRect(px,-106,7,106);
 c.fillStyle='#DADFE4';c.fillRect(230,-62,44,62);c.fillStyle=night?'#FFD58C':'#7FA3B8';c.fillRect(238,-54,28,22);
 // Buseta: blanca con franjas rojas/naranja (dibujo propio).
 const bx=20,by=-70;c.fillStyle='#F4F1EC';c.beginPath();c.moveTo(bx,by+64);c.lineTo(bx,by+8);c.quadraticCurveTo(bx,by,bx+12,by);c.lineTo(bx+170,by);c.lineTo(bx+178,by+12);c.lineTo(bx+178,by+64);c.closePath();c.fill();
 c.fillStyle='#D9361E';c.fillRect(bx,by+36,178,8);c.fillStyle='#F07B24';c.fillRect(bx,by+46,178,5);
 c.fillStyle=night?'#FFE2A6':'#3F5566';for(let i=0;i<7;i++)c.fillRect(bx+10+i*23,by+8,18,22);
 c.fillStyle='#24262C';for(const wx of[bx+34,bx+142]){c.beginPath();c.arc(wx,by+64,11,0,Math.PI*2);c.fill();}
 c.restore();
}
function soco(c,x,base,s,night){
 c.save();c.translate(x,base);c.scale(s,s);
 const cols=['#E7A35A','#7BB6A6','#E57C74','#B79BD8','#F0D06A'];
 for(let i=0;i<5;i++){const bx=i*58,h=70+(i%2)*22;c.fillStyle=cols[i];c.fillRect(bx,-h,54,h);
  c.fillStyle='#FFF4E0';c.fillRect(bx,-h,54,5);
  for(let k=0;k<5;k++){c.fillStyle=k%2?'#FFF4E0':cols[(i+2)%5];c.fillRect(bx+k*10.8,-38,10.8,9);}
  c.fillStyle=night?'#FFD58C':'#3B4A57';c.fillRect(bx+12,-26,30,26);}
 c.restore();
}
function centroArch(c,x,base,s){
 c.save();c.translate(x,base);c.scale(s,s);c.strokeStyle='#D7DCE2';c.lineWidth=4;
 for(let k=0;k<3;k++){const o=k*70;c.beginPath();c.moveTo(o,0);c.lineTo(o,-110);c.moveTo(o+180,0);c.lineTo(o+180,-110);c.moveTo(o,-110);c.quadraticCurveTo(o+90,-150,o+180,-110);c.stroke();}
 c.fillStyle='#2F5E3A';c.fillRect(40,-170,170,40);c.fillStyle='#FFFFFF';c.font='bold 15px Arial';c.textAlign='center';c.fillText('← CENTRO LA VICTORIA',125,-145);
 c.fillStyle='#5D6770';c.fillRect(70,-130,6,30);c.fillRect(175,-130,6,30);
 c.restore();
}
function plazaRibas(c,x,base,s){
 c.save();c.translate(x,base);c.scale(s,s);
 // Torre blanca con cúpula (iglesia matriz) detrás de la plaza.
 c.fillStyle='#EEF0F2';c.fillRect(20,-210,56,210);c.fillStyle='#DDE1E5';c.fillRect(14,-150,68,8);c.fillRect(14,-210,68,8);
 c.fillStyle='#45525E';arch(c,36,-195,24,40,'#45525E');c.beginPath();c.arc(48,-130,9,0,Math.PI*2);c.fill();
 c.fillStyle='#F4F5F6';c.beginPath();c.ellipse(48,-214,26,24,0,Math.PI,0);c.fill();c.fillRect(44,-256,8,22);c.beginPath();c.moveTo(48,-270);c.lineTo(52,-256);c.lineTo(44,-256);c.closePath();c.fill();
 // Árboles de la plaza.
 c.fillStyle='#2F6B3A';for(const[tx,r]of[[110,40],[150,34],[-20,32]]){c.beginPath();c.arc(tx,-70,r,0,Math.PI*2);c.fill();c.fillStyle='#3E2D22';c.fillRect(tx-3,-40,6,40);c.fillStyle='#2F6B3A';}
 // Estatua sobre pedestal: figura con el brazo en alto (silueta propia, bronce).
 const px=200;c.fillStyle='#B7A890';c.fillRect(px-34,-18,68,18);c.fillStyle='#A69779';c.fillRect(px-26,-80,52,62);c.fillStyle='#C8BBA2';c.fillRect(px-30,-84,60,6);
 c.fillStyle='#3B2F27';c.beginPath();c.ellipse(px,-110,9,24,0,0,Math.PI*2);c.fill();c.beginPath();c.arc(px+1,-140,7,0,Math.PI*2);c.fill();
 c.lineWidth=6;c.strokeStyle='#3B2F27';c.lineCap='round';c.beginPath();c.moveTo(px+4,-124);c.lineTo(px+22,-150);c.lineTo(px+30,-172);c.stroke();
 c.lineWidth=2.5;c.beginPath();c.moveTo(px+30,-172);c.lineTo(px+38,-192);c.stroke();
 c.lineWidth=6;c.beginPath();c.moveTo(px-5,-122);c.lineTo(px-18,-100);c.stroke();
 c.beginPath();c.ellipse(px-16,-96,10,14,.5,0,Math.PI*2);c.fill();
 c.restore();
}
function cuartel(c,x,base,s){
 barracks(c,x,base,s);
 c.save();c.translate(x,base);c.scale(s,s);
 c.strokeStyle='#D0D4D8';c.lineWidth=2;c.beginPath();c.moveTo(94,-94);c.lineTo(94,-170);c.stroke();
 c.fillStyle='#F7D117';c.fillRect(95,-170,30,7);c.fillStyle='#1E4FA8';c.fillRect(95,-163,30,7);c.fillStyle='#D3222A';c.fillRect(95,-156,30,7);
 c.restore();
}
function plazaMadres(c,x,base,s){
 c.save();c.translate(x,base);c.scale(s,s);
 c.fillStyle='#CDBFA6';c.fillRect(-10,-14,260,14);c.fillStyle='#E4D8C2';c.fillRect(-10,-18,260,4);
 c.fillStyle='#2F6B3A';for(const[tx,r]of[[20,36],[70,30],[180,34],[230,30]]){c.fillStyle='#3E2D22';c.fillRect(tx-3,-50,6,36);c.fillStyle='#2F6B3A';c.beginPath();c.arc(tx,-78,r,0,Math.PI*2);c.fill();}
 c.fillStyle='#B9AC94';c.fillRect(112,-60,26,46);c.fillStyle='#DCCFB8';c.fillRect(106,-64,38,6);
 c.fillStyle='#F7C6D4';for(const fx of[0,40,200,240]){c.beginPath();c.arc(fx,-22,5,0,Math.PI*2);c.fill();}
 c.restore();
}
const ROUTE_DRAW=[terminal,soco,(c,x,b,s)=>centroArch(c,x,b,s),(c,x,b,s)=>plazaRibas(c,x,b,s),(c,x,b,s)=>cuartel(c,x,b,s*1.15),(c,x,b,s)=>plazaMadres(c,x,b,s)];
const ROUTE_W=[320,290,320,240,250,260];
export function drawVictoriaBackdrop(c,state,g,p,beat,reduced){
 const {width:w,height:h,ground,unit}=g,distance=g.hero.x,day=dayPhase(state.tick||0),night=day.night;
 const sky=c.createLinearGradient(0,0,0,ground);sky.addColorStop(0,day.top);sky.addColorStop(.57,day.mid);sky.addColorStop(1,day.bottom);c.fillStyle=sky;c.fillRect(0,0,w,h);
 if(night>.15){c.fillStyle='#FFFFFF';for(let i=0;i<46;i++){const sx=noise(i*7+3)*w,sy=noise(i*11+5)*ground*.62,tw=reduced?1:.6+.4*Math.sin((state.tick||0)/60+i);c.globalAlpha=(night-.15)*.9*tw;c.fillRect(sx,sy,i%5?1.2:2,i%5?1.2:2);}c.globalAlpha=1;}
 const orbX=w*.78,orbY=h*.17,orbR=Math.min(w*.07,h*.05);
 if(night<.6){const a=1-night/.6;const halo=c.createRadialGradient(orbX,orbY,orbR*.4,orbX,orbY,orbR*3.2);halo.addColorStop(0,`rgba(255,226,170,${.35*a})`);halo.addColorStop(1,'rgba(255,226,170,0)');c.fillStyle=halo;c.fillRect(0,0,w,ground);c.fillStyle='#FFE7B0';c.globalAlpha=.9*a;c.beginPath();c.arc(orbX,orbY,orbR,0,Math.PI*2);c.fill();c.globalAlpha=1;}
 if(night>.4){const a=(night-.4)/.6;c.fillStyle='#F4F1E6';c.globalAlpha=a;c.beginPath();c.arc(w*.2,h*.14,orbR*.8,0,Math.PI*2);c.fill();c.fillStyle=day.top;c.beginPath();c.arc(w*.2+orbR*.35,h*.14-orbR*.15,orbR*.7,0,Math.PI*2);c.fill();c.globalAlpha=1;}
 for(let i=0;i<4;i++){
  const cx=mod(noise(i*13+2)*w-distance*unit*.009,w),cy=h*(.22+noise(i*5+11)*.15);
  c.fillStyle='#FFFFFF';c.globalAlpha=.16*(1-night*.7);c.beginPath();c.ellipse(cx,cy,w*(.13+noise(i)*.1),Math.max(2,h*.012),-.06,0,Math.PI*2);c.fill();c.globalAlpha=1;
 }
 hill(c,w,ground,h,distance*unit*.018,0,p);hill(c,w,ground,h,distance*unit*.035,1,p);
 const houseWidth=Math.max(53,w*.13),houses=distance*unit*.115,hFirst=Math.floor(houses/houseWidth);
 c.save();c.globalAlpha=.80;
 for(let i=-1;i<Math.ceil(w/houseWidth)+2;i++){
  const id=((hFirst+i)%1000+1000)%1000,x=i*houseWidth-mod(houses,houseWidth),bh=unit*(.9+noise(id*17)*.8);
  house(c,x,ground-unit*.85,houseWidth-2,bh,id,night>.5?id%3!==2:id%3===0);
 }
 c.restore();
 // Ruta: un hito por tramo, en orden, con su nombre bien visible.
 const travel=distance*unit*.30,spacing=Math.max(w*1.6,560),first=Math.floor(travel/spacing),baseline=ground-unit*.85,labels=[];
 const HEIGHTS=[118,92,170,270,161,114];
 for(let i=-1;i<Math.ceil(w/spacing)+2;i++){
  const id=first+i,k=mod(id,ROUTE_DRAW.length),x=id*spacing-travel+spacing*.08;
  const s=Math.min(ground*.46/HEIGHTS[k], spacing*.7/ROUTE_W[k]);
  if(x>w||x+ROUTE_W[k]*s<0)continue;
  ROUTE_DRAW[k](c,x,baseline,s,night>.5);
  labels.push([VICTORIA_ROUTE[k],x+ROUTE_W[k]*s/2,baseline-HEIGHTS[k]*s-Math.max(18,unit*.55)]);
 }
 const plazaBase=ground-unit*.25,plazaTravel=distance*unit*.21,gap=Math.max(140,unit*6.5),offset=mod(plazaTravel,gap),ts=Math.min(1.35,unit*.023);
 for(let x=-offset-gap;x<w+gap;x+=gap)tree(c,x+gap*.14,plazaBase,ts,p.near);
 if(night>0){c.fillStyle=`rgba(8,10,32,${night*.42})`;c.fillRect(0,0,w,ground);}
 for(let x=-offset-gap;x<w+gap;x+=gap)lamp(c,x+gap*.65,plazaBase,ts,beat+night*3);
 const fs=Math.max(11,Math.min(19,unit*.42,w*.042));
 c.font=`900 ${fs}px "Arial Black",Arial,sans-serif`;for(const[text,lx,ly]of labels){const half=(c.measureText(text).width+fs*1.3)/2+6;label(c,text,Math.max(half,Math.min(w-half,lx)),Math.max(fs*1.4,ly),fs);}
 c.fillStyle=p.near;c.fillRect(0,ground-unit*.24,w,unit*.24);
 c.strokeStyle='#718084';c.globalAlpha=.45;c.lineWidth=1;c.beginPath();c.moveTo(0,ground-unit*.24);c.lineTo(w,ground-unit*.24);c.stroke();c.globalAlpha=1;
 c.fillStyle='#17242F';c.fillRect(0,ground,w,h-ground);
 c.fillStyle='#E9BE88';c.fillRect(0,ground,w,Math.max(2,unit*.085));
 c.fillStyle='#3B3D45';c.fillRect(0,ground+Math.max(2,unit*.085),w,Math.max(5,unit*.25));
 const tile=Math.max(26,unit*.95),rowH=Math.max(14,unit*.52),floorScroll=mod(distance*unit,tile),rows=Math.min(12,Math.ceil((h-ground)/rowH));
 for(let row=0;row<rows;row++){
  const y=ground+row*rowH+unit*.36,shift=row%2?tile*.5:0;
  c.strokeStyle=row<2?'#6C6263':'#46505B';c.globalAlpha=.45-row/rows*.22;c.lineWidth=.75;
  for(let x=-tile-floorScroll+shift;x<w+tile;x+=tile)c.strokeRect(x+1,y,tile-2,rowH-2);
 }
 c.globalAlpha=1;
 const edge=c.createLinearGradient(0,ground+unit*.4,0,h);edge.addColorStop(0,'#0D182600');edge.addColorStop(1,'#0D1527C9');c.fillStyle=edge;c.fillRect(0,ground,w,h-ground);
 if(!reduced&&beat){c.fillStyle='#FFD4A0';c.globalAlpha=beat*.025;c.fillRect(0,ground,w,2);c.globalAlpha=1;}
}
