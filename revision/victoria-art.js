/** Original vector interpretation of La Victoria's valley and historic centre.
 * Not a geographic reconstruction or a tracing of photographs. No external assets.
 */
const noise=n=>{n=Math.imul(n^0x9e3779b9,0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return((n^(n>>>16))>>>0)/4294967296;};
const mod=(n,m)=>(n%m+m)%m;
export const VICTORIA_LANDMARKS=Object.freeze(['valle de Aragua','Iglesia de Guadalupe · interpretación','Cuartel Mariano Montilla · interpretación','plaza y fachadas victorianas']);
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
export function drawVictoriaBackdrop(c,state,g,p,beat,reduced){
 const {width:w,height:h,ground,unit}=g,distance=g.hero.x;
 const sky=c.createLinearGradient(0,0,0,ground);sky.addColorStop(0,p.top);sky.addColorStop(.57,p.mid);sky.addColorStop(1,p.bottom);c.fillStyle=sky;c.fillRect(0,0,w,h);
 // Sunset disk and atmospheric haze are behind the playable street.
 const sunX=w*.76,sunY=h*.245,sunR=Math.min(w*.12,h*.075);
 const halo=c.createRadialGradient(sunX,sunY,sunR*.4,sunX,sunY,sunR*3);halo.addColorStop(0,'#FFD7AA35');halo.addColorStop(1,'#FFD7AA00');c.fillStyle=halo;c.fillRect(0,0,w,ground);
 c.fillStyle='#FFCF9E';c.globalAlpha=.6;c.beginPath();c.arc(sunX,sunY,sunR,0,Math.PI*2);c.fill();c.globalAlpha=1;
 for(let i=0;i<4;i++){
  const cx=mod(noise(i*13+2)*w-distance*unit*.009,w),cy=h*(.22+noise(i*5+11)*.15);
  c.fillStyle='#FFD8BB';c.globalAlpha=.08;c.beginPath();c.ellipse(cx,cy,w*(.13+noise(i)*.1),Math.max(2,h*.009),-.06,0,Math.PI*2);c.fill();c.globalAlpha=1;
 }
 hill(c,w,ground,h,distance*unit*.018,0,p);hill(c,w,ground,h,distance*unit*.035,1,p);
 const baseline=ground-unit*1.85,scale=Math.min(h*.0025,w*.0031),span=Math.max(w*1.9,650),travel=distance*unit*.062;
 // Architectural skyline scrolls more slowly than the street, leaving a readable corridor.
 c.save();c.globalAlpha=.83;
 for(let i=-1;i<3;i++){
  const x=i*span-mod(travel,span);
  church(c,x+span*.14,baseline,scale*.98);barracks(c,x+span*.57,baseline,scale*.78);
 }
 c.restore();
 const houseWidth=Math.max(53,w*.13),houses=distance*unit*.115,first=Math.floor(houses/houseWidth);
 c.save();c.globalAlpha=.80;
 for(let i=-1;i<Math.ceil(w/houseWidth)+2;i++){
  const id=((first+i)%1000+1000)%1000,x=i*houseWidth-mod(houses,houseWidth),bh=unit*(1.35+noise(id*17)*1.25);
  house(c,x,ground-unit*.85,houseWidth-2,bh,id,id%3===0);
 }
 c.restore();
 // A lower-contrast plaza border: no background shape looks like a collectible or hazard.
 const plazaBase=ground-unit*.25,plazaTravel=distance*unit*.21,gap=Math.max(140,unit*6.5),offset=mod(plazaTravel,gap),ts=Math.min(1.35,unit*.023);
 for(let x=-offset-gap;x<w+gap;x+=gap){tree(c,x+gap*.14,plazaBase,ts,p.near);lamp(c,x+gap*.65,plazaBase,ts,beat);}
 c.fillStyle=p.near;c.fillRect(0,ground-unit*.24,w,unit*.24);
 c.strokeStyle='#718084';c.globalAlpha=.45;c.lineWidth=1;c.beginPath();c.moveTo(0,ground-unit*.24);c.lineTo(w,ground-unit*.24);c.stroke();c.globalAlpha=1;
 // A flat authoritative floor. Pavers replace the generic neon infinity grid.
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
