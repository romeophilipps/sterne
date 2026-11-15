'use strict';
// One continuous comet, rendered at bounded resolution with a bounded particle pool.
window.StarTrail=class StarTrail {
 constructor(field){this.canvas=document.createElement('canvas');this.canvas.id='snake-trail';this.canvas.setAttribute('aria-hidden','true');field.prepend(this.canvas);this.ctx=this.canvas.getContext('2d');this.particles=[];this.lastTime=0;this.lastLength=0;this.budget=0;this.width=0;this.height=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;}
 render(positions,time,length,rush){
  const canvas=this.canvas,ctx=this.ctx,w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h||!ctx)return;
  const scale=Math.min(2,devicePixelRatio||1);if(w!==this.width||h!==this.height){this.width=w;this.height=h;canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);}ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.clearRect(0,0,w,h);
  if(time<this.lastTime||this.lastLength===0){this.particles=[];this.budget=0;}const dt=Math.max(0,Math.min(.064,(time-this.lastTime)/1000));this.lastTime=time;
  const power=Math.min(1,Math.max(0,(length-6)/30)+(rush>0?.18:0)),cell=w/13,points=[];
  positions.forEach((p,i)=>{if(!i){points.push({x:p.x+.5,y:p.y+.5});return;}const prev=positions[i-1],a=points[i-1];let dx=p.x-prev.x,dy=p.y-prev.y;if(dx>6.5)dx-=13;if(dx<-6.5)dx+=13;if(dy>6.5)dy-=13;if(dy<-6.5)dy+=13;points.push({x:a.x+dx,y:a.y+dy});});
  if(points.length<2)return;
  const smooth=[points[0]];let start=points[0];for(let i=1;i<points.length-1;i++){const p=points[i],next=points[i+1],end={x:(p.x+next.x)/2,y:(p.y+next.y)/2};for(let j=1;j<=4;j++){const t=j/4,u=1-t;smooth.push({x:u*u*start.x+2*u*t*p.x+t*t*end.x,y:u*u*start.y+2*u*t*p.y+t*t*end.y});}start=end;}smooth.push(points.at(-1));
  const path=smooth.length>180?Array.from({length:180},(_,i)=>smooth[Math.round(i*(smooth.length-1)/179)]):smooth;
  const xs=path.map(p=>p.x),ys=path.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const hue=42-power*24,baseWidth=cell*(.22+power*.16),phase=time/1000;
  ctx.lineCap='round';ctx.lineJoin='round';
  for(const ox of [-13,0,13])for(const oy of [-13,0,13]){if(maxX+ox<-.8||minX+ox>13.8||maxY+oy<-.8||minY+oy>13.8)continue;ctx.save();ctx.translate(ox*cell,oy*h/13);
   const shape=()=>{ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x*cell,p.y*h/13):ctx.moveTo(p.x*cell,p.y*h/13));};
   // The aura uses one shadow pass; the tapered body has no per-segment blur.
   shape();ctx.strokeStyle=`hsla(${hue},100%,58%,${.18+power*.15})`;ctx.lineWidth=baseWidth*2;ctx.filter='blur(3px)';ctx.shadowColor=power>.5?'#ff4d91':'#ffad32';ctx.shadowBlur=8+power*17;ctx.stroke();ctx.shadowBlur=0;ctx.filter='none';
   for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],t=i/(path.length-1),fade=Math.pow(1-t,.55),wave=this.reduced?0:Math.sin(t*18-phase*5)*power;ctx.beginPath();ctx.moveTo(a.x*cell,a.y*h/13);ctx.lineTo(b.x*cell,b.y*h/13);ctx.lineWidth=Math.max(.3,baseWidth*fade);ctx.strokeStyle=`hsla(${hue-t*(20+power*150)+wave*12},100%,${65-t*16}%,${.95*fade})`;ctx.stroke();ctx.lineWidth=Math.max(.15,cell*(.055+power*.03)*fade);ctx.strokeStyle=`rgba(255,248,210,${(.7+power*.2)*fade})`;ctx.stroke();}
   // Fast light filaments travel through a longer, stronger comet.
   if(!this.reduced){ctx.globalCompositeOperation='lighter';for(let k=0;k<2+Math.floor(power*4);k++){const t=((phase*(.55+power*.4)+k/.618)%1),i=Math.min(path.length-2,Math.floor(t*(path.length-1))),a=path[i],b=path[i+1];ctx.beginPath();ctx.moveTo(a.x*cell,a.y*h/13);ctx.lineTo(b.x*cell,b.y*h/13);ctx.lineWidth=cell*.11*(1-t);ctx.strokeStyle=`rgba(255,255,235,${.8*(1-t)})`;ctx.stroke();}}ctx.restore();
  }
  if(!this.reduced){this.budget+=dt*(16+power*84);if(length>this.lastLength&&this.lastLength)this.budget+=14+power*12;let count=Math.min(30,Math.floor(this.budget));this.budget-=count;while(count--&&this.particles.length<200){const t=Math.pow(Math.random(),.8),i=Math.min(path.length-2,Math.floor(t*(path.length-1))),p=path[i],a=Math.random()*Math.PI*2,speed=cell*(.15+Math.random()*(.6+power));this.particles.push({x:p.x*cell,y:p.y*h/13,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.55+Math.random()*.8,max:1.35,size:.9+Math.random()*(1.6+power*2.2),hue:hue-t*(20+power*150)});}
   ctx.save();ctx.globalCompositeOperation='lighter';this.particles=this.particles.filter(p=>p.life>0);for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const x=(p.x%w+w)%w,y=(p.y%h+h)%h,fade=Math.max(0,p.life/p.max);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-p.vx*.1,y-p.vy*.1);ctx.lineWidth=p.size*fade;ctx.strokeStyle=`hsla(${p.hue},100%,78%,${fade})`;ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(x,y,p.size*fade*.45,0,Math.PI*2);ctx.fill();}ctx.restore();
  }
  this.lastLength=length;
 }
};
