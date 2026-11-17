'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarStorm=api;})(globalThis,()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 class Round{
 constructor(random=Math.random){this.random=random;this.elapsed=0;this.score=0;this.lives=3;this.player={x:.5,y:.9};this.target=.5;this.wave=1;this.rank=1;this.xp=0;this.needed=20000;this.cooldown=0;this.grace=0;this.ended=false;this.reason=null;this.enemies=[];this.shots=[];this.fx=[];this.gates=[];this.spawnClock=0;this.fireClock=0;this.gateClock=1800;this.nextBoss=15000;this.id=0;this.events=[];}
 get level(){return this.wave;}move(x){this.target=clamp(x,.08,.92);}
 nova(){if(this.cooldown||this.ended)return false;this.cooldown=8000;for(let i=-6;i<=6;i++)this.shots.push({x:clamp(this.player.x+i*.035,.03,.97),z:.91,power:4,gate:0});this.fx.push({x:this.player.x,z:.88,life:600,max:600,r:.22});return true;}
 tick(ms){this.events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return this.events;let left=Math.min(ms,160);while(left>0&&!this.ended){const dt=Math.min(16,left);left-=dt;this.step(dt);}return this.events;}
 step(dt){const s=dt/1000;this.elapsed+=dt;this.wave=1+Math.floor(this.elapsed/20000);this.rank=1+Math.floor(this.elapsed/30000);this.xp=this.elapsed%20000;this.cooldown=Math.max(0,this.cooldown-dt);this.grace=Math.max(0,this.grace-dt);this.player.x+=(this.target-this.player.x)*Math.min(1,s*15);
 this.fireClock-=dt;if(this.fireClock<=0){this.fireClock=Math.max(85,190-this.rank*6);this.shots.push({x:this.player.x,z:.9,power:1+Math.floor(this.rank/3),gate:0});}
 this.gateClock-=dt;if(this.gateClock<=0){this.gateClock=6500;const left=this.random()<.5;this.gates.push({id:++this.id,z:.12,left:left?2:3,right:left?3:2,life:15000});}
 this.spawnClock-=dt;if(this.spawnClock<=0){this.spawnClock=Math.max(650,2400-this.wave*120);const count=5+this.wave*3+Math.floor(this.random()*5);this.enemies.push({x:.18+this.random()*.64,z:.02,hp:count,max:count,boss:false});}
 if(this.elapsed>=this.nextBoss){this.nextBoss+=20000;const hp=30+this.wave*18;this.enemies.push({x:.5,z:0,hp,max:hp,boss:true});this.events.push({kind:'boss'});}
 for(const gate of this.gates){gate.z+=s*.025;gate.life-=dt;}
 for(const e of this.enemies){e.z+=s*(e.boss?.033:.045+Math.min(.035,this.wave*.002));if(e.boss)e.x=.5+Math.sin(this.elapsed/1100)*.17;}
 const extras=[];for(const shot of this.shots){const old=shot.z;shot.z-=s*1.05;for(const gate of this.gates){if(shot.gate===gate.id||old<gate.z||shot.z>gate.z)continue;shot.gate=gate.id;const mult=shot.x<.5?gate.left:gate.right;for(let i=1;i<mult;i++)extras.push({...shot,x:clamp(shot.x+(i-(mult-1)/2)*.035,.03,.97)});}
 for(const e of this.enemies){if(e.hp<=0||shot.z>e.z+.055||old<e.z-.055||Math.abs(shot.x-e.x)>(e.boss?.22:.14))continue;const damage=shot.power;e.hp-=damage;shot.z=-1;this.fx.push({x:shot.x,z:e.z,life:260,max:260,r:.035});if(e.hp<=0){this.score+=e.max*(e.boss?3:1);this.fx.push({x:e.x,z:e.z,life:850,max:850,r:e.boss?.3:.15});this.events.push({kind:'explode',boss:e.boss});}break;}}
 this.shots.push(...extras);this.shots=this.shots.filter(b=>b.z>0).slice(-180);
 for(const e of this.enemies)if(e.hp>0&&e.z>.88){e.hp=0;if(!this.grace){this.lives--;this.grace=1400;this.events.push({kind:'hurt'});this.fx.push({x:e.x,z:.9,life:650,max:650,r:.22});if(!this.lives){this.ended=true;this.reason='lives';}}}
 this.enemies=this.enemies.filter(e=>e.hp>0);this.gates=this.gates.filter(g=>g.life>0&&g.z<.78).slice(-3);this.fx=this.fx.filter(f=>(f.life-=dt)>0).slice(-55);
 }
 }
 class Renderer{
 constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');}
 draw(run){const c=this.c,w=this.canvas.clientWidth,h=this.canvas.clientHeight;if(!w||!h)return;const d=Math.min(2,globalThis.devicePixelRatio||1);if(this.canvas.width!==Math.round(w*d)||this.canvas.height!==Math.round(h*d)){this.canvas.width=Math.round(w*d);this.canvas.height=Math.round(h*d);}c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 const project=(x,z)=>{const depth=.12+.88*z,width=w*(.16+.79*z),center=w*.5+Math.sin(z*7-run.elapsed/6500)*w*.15*Math.sin(z*Math.PI);return {x:center+(x-.5)*width,y:h*(.06+.9*z),scale:depth,width};};
 const star=(x,y,r,color,angle=0)=>{c.save();c.translate(x,y);c.rotate(angle);c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,t=i%2?r*.45:r;i?c.lineTo(Math.cos(a)*t,Math.sin(a)*t):c.moveTo(Math.cos(a)*t,Math.sin(a)*t);}c.closePath();c.fillStyle=color;c.fill();c.restore();};
 // Elevated winding road, with perspective walls and flowing lane markings.
 const edge=(side,offset=0)=>{c.beginPath();for(let i=0;i<=60;i++){const p=project(side,i/60);i?c.lineTo(p.x,p.y+offset):c.moveTo(p.x,p.y+offset);}};
 c.beginPath();for(let i=0;i<=60;i++){const p=project(0,i/60);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}for(let i=60;i>=0;i--){const p=project(1,i/60);c.lineTo(p.x,p.y);}c.closePath();c.fillStyle='#263147';c.fill();for(const side of [0,1]){edge(side,10);c.strokeStyle='#111a2c';c.lineWidth=10;c.stroke();edge(side);c.strokeStyle='#7292b1';c.lineWidth=3;c.stroke();}
 for(let i=0;i<18;i++){const z=((i/18+run.elapsed/16000)%1),p=project(.5,z);c.fillStyle='#8db3d32a';c.fillRect(p.x-1,p.y,2,7*p.scale);}
 for(const g of run.gates){const p=project(.5,g.z),height=26*p.scale+12;for(let i=0;i<2;i++){const x=p.x+(i?0:-p.width*.47),width=p.width*.47;c.fillStyle=i?'#8156bce0':'#126da4e0';c.fillRect(x,p.y-height,width,height);c.strokeStyle=i?'#d0a5ff':'#8fe7ff';c.lineWidth=2;c.strokeRect(x,p.y-height,width,height);c.fillStyle='#fff';c.font=`700 ${Math.max(12,23*p.scale)}px -apple-system,sans-serif`;c.textAlign='center';c.fillText('×'+(i?g.right:g.left),x+width/2,p.y-7);}}
 for(const e of run.enemies){const p=project(e.x,e.z);if(e.boss){c.shadowColor='#ff526f';c.shadowBlur=15;star(p.x,p.y,30*p.scale+8,'#ff527b',run.elapsed/1900);c.shadowBlur=0;}else{const n=Math.min(55,Math.ceil(e.hp));for(let i=0;i<n;i++){const a=i*2.39996,r=Math.sqrt(i)*3.7*p.scale;star(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,4.5*p.scale+1.5,'#ff648d',a);}}c.textAlign='center';c.font=`750 ${Math.max(12,20*p.scale)}px -apple-system,sans-serif`;c.fillStyle='#fff';c.fillText(Math.ceil(e.hp),p.x,p.y-(e.boss?40:23)*p.scale-4);}
 c.save();c.globalCompositeOperation='lighter';for(const b of run.shots){const p=project(b.x,b.z);star(p.x,p.y,3+5*p.scale,b.power>1?'#ffdc70':'#8dedff',run.elapsed/400);}
 for(const f of run.fx){const p=project(f.x,f.z),t=1-f.life/f.max,r=f.r*w*p.scale;c.strokeStyle=`rgba(255,211,110,${1-t})`;c.lineWidth=3*(1-t);c.beginPath();c.arc(p.x,p.y,Math.max(1,r*t),0,Math.PI*2);c.stroke();for(let i=0;i<16;i++){const a=i*Math.PI/8;star(p.x+Math.cos(a)*r*t,p.y+Math.sin(a)*r*t,(1-t)*3,'#ffde8a',a);}}c.restore();
 const p=project(run.player.x,.93);c.fillStyle='#376486';c.beginPath();c.roundRect(p.x-21,p.y-14,42,27,10);c.fill();c.fillStyle='#8bcff3';for(let i=-1;i<=1;i++){c.beginPath();c.roundRect(p.x+i*12-4,p.y-35,8,30,4);c.fill();}star(p.x,p.y+2,14,'#ffce4a');
 }
 }
 return {Round,create:r=>new Round(r),Renderer};
});
