'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarDodge=api;})(globalThis,()=>{
  const TYPES=[{name:'Gleiter',at:0},{name:'Wellensterne',at:15000},{name:'Jäger',at:30000},{name:'Sprinter',at:45000},{name:'Teiler',at:60000}];
  const PLAYER_RADIUS=.026,PLAYER_SPEED=2.6,MAX_ENEMIES=38;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  function swept(ax,ay,bx,by,r){const dx=bx-ax,dy=by-ay,t=clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(ax+t*dx,ay+t*dy)<=r;}
  class Round {
    constructor(random=Math.random){
      this.random=random;this.elapsed=0;this.lives=3;this.height=1.6;this.player={x:.5,y:1.05};this.target={...this.player};
      this.enemies=[];this.nextSpawn=300;this.id=0;this.available=1;this.bag=[];this.grace=0;this.ended=false;this.reason=null;
    }
    get score(){return Math.floor(this.elapsed);}
    get level(){return 1+Math.floor(this.elapsed/15000);}
    get speedFactor(){return 1+this.elapsed/150000;}
    get motionFactor(){return 1+this.elapsed/240000;}
    get interval(){return 1100/(1+this.elapsed/110000);}
    range(a,b){return a+(b-a)*this.random();}
    resize(width,height){if(!(width>0&&height>0))return;const next=clamp(height/width,.65,2.5),scale=next/this.height;this.player.y*=scale;this.target.y*=scale;for(const e of this.enemies)e.y*=scale;this.height=next;this.move(this.target.x,this.target.y);}
    move(x,y){if(this.ended||!Number.isFinite(x)||!Number.isFinite(y))return;this.target={x:clamp(x,.06,.94),y:clamp(y,.06,this.height-.06)};}
    end(reason){this.ended=true;this.reason=reason;}
    nextType(){
      if(!this.bag.length){this.bag=Array.from({length:this.available},(_,i)=>i);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}}
      return this.bag.shift();
    }
    spawn(type=this.nextType()){
      if(this.enemies.length>=MAX_ENEMIES)return;
      let x,y;
      // Enemies enter from outside, with a visible warning and space to react at the edge.
      for(let attempt=0;attempt<8;attempt++){
        const side=Math.floor(this.random()*4);
        x=side===1?1.1:side===3?-.1:this.range(.08,.92);
        y=side===0?-.1:side===2?this.height+.1:this.range(.08,this.height-.08);
        if(Math.hypot(x-this.player.x,y-this.player.y)>.48)break;
      }
      if(Math.hypot(x-this.player.x,y-this.player.y)<.48){x=this.player.x<.5?1.1:-.1;y=this.height/2;}
      const aimX=clamp(this.player.x+this.range(-.16,.16),.07,.93),aimY=clamp(this.player.y+this.range(-.2,.2),.07,this.height-.07);
      const angle=Math.atan2(aimY-y,aimX-x);
      this.enemies.push({id:++this.id,type,x,y,angle,baseAngle:angle,radius:type===4?.045:.038,age:0,warning:700,
        phase:this.range(0,Math.PI*2),rotation:this.range(-20,20),shard:false,locked:false,done:false});
    }
    split(enemy,events){
      enemy.done=true;events.push({kind:'split',x:enemy.x,y:enemy.y});
      const aim=Math.atan2(this.player.y-enemy.y,this.player.x-enemy.x);
      for(const offset of [-.65,0,.65]){
        if(this.enemies.length>=MAX_ENEMIES+3)break;
        this.enemies.push({id:++this.id,type:4,x:enemy.x,y:enemy.y,angle:aim+offset,baseAngle:aim+offset,radius:.025,age:0,warning:320,
          phase:0,rotation:0,shard:true,locked:true,done:false});
      }
    }
    tick(ms){
      const events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return events;
      let left=ms;
      while(left>0&&!this.ended){
        const dt=Math.min(8,left),seconds=dt/1000;left-=dt;this.elapsed+=dt;this.grace=Math.max(0,this.grace-dt);
        if(this.available<5&&this.elapsed>=TYPES[this.available].at){const type=this.available++;this.bag.unshift(type);events.push({kind:'unlock',type});}
        this.nextSpawn-=dt;if(this.nextSpawn<=0){this.spawn();this.nextSpawn+=this.interval*this.range(.88,1.12);}
        const previous={...this.player},dx=this.target.x-this.player.x,dy=this.target.y-this.player.y,dist=Math.hypot(dx,dy),step=Math.min(1,PLAYER_SPEED*seconds/(dist||1));
        this.player.x+=dx*step;this.player.y+=dy*step;
        for(const e of [...this.enemies]){
          if(e.done)continue;
          if(e.warning>0){e.warning-=dt;continue;}
          e.age+=dt;const ox=e.x,oy=e.y;let angle=e.angle,speed=.17;
          if(e.type===1){angle=e.baseAngle+Math.sin(e.age/1000*(2+this.elapsed/240000)+e.phase)*Math.min(1.05,.65*this.motionFactor);speed=.18;}
          if(e.type===2){const aim=Math.atan2(this.player.y-e.y,this.player.x-e.x);e.angle+=clamp(angleDiff(aim,e.angle),-.85*this.motionFactor*seconds,.85*this.motionFactor*seconds);angle=e.angle;speed=.135;}
          if(e.type===3){
            if(e.age<650)e.angle=Math.atan2(this.player.y-e.y,this.player.x-e.x);
            e.locked=e.age>=650;angle=e.angle;speed=e.age<1200?0:.56;
          }
          if(e.type===4){speed=e.shard?.23:.14;if(!e.shard&&e.age>=1900){this.split(e,events);continue;}}
          e.x+=Math.cos(angle)*speed*this.speedFactor*seconds;e.y+=Math.sin(angle)*speed*this.speedFactor*seconds;
          e.rotation+=(e.type===1?40:e.type===4?90:18)*seconds*this.motionFactor;
          if(this.grace===0&&swept(ox-previous.x,oy-previous.y,e.x-this.player.x,e.y-this.player.y,PLAYER_RADIUS+e.radius)){
            e.done=true;this.lives--;this.grace=1400;events.push({kind:'hit',x:this.player.x,y:this.player.y});if(!this.lives){this.end('lives');break;}
          }
          if(e.x<-.24||e.x>1.24||e.y<-.24||e.y>this.height+.24||e.age>(e.type===2?11000:12500))e.done=true;
        }
        this.enemies=this.enemies.filter(e=>!e.done);
      }
      return events;
    }
  }
  return {create:random=>new Round(random),Round,TYPES,PLAYER_RADIUS,MAX_ENEMIES};
});
