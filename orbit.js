'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarOrbit=api;})(globalThis,()=>{
 class Round{
 constructor(random=Math.random){this.random=random;this.elapsed=0;this.score=0;this.lives=3;this.angle=-Math.PI/2;this.lane=1;this.radius=.36;this.obstacles=[];this.nextSpawn=500;this.id=0;this.grace=0;this.ended=false;this.reason=null;}
 get level(){return 1+Math.floor(this.elapsed/15000);}get speed(){return 1.3+this.elapsed/90000;}
 switch(){if(!this.ended)this.lane=1-this.lane;}
 tick(ms){const events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return events;let left=ms;
 while(left>0&&!this.ended){const dt=Math.min(8,left);left-=dt;this.elapsed+=dt;this.score=Math.floor(this.elapsed/100);this.grace=Math.max(0,this.grace-dt);this.angle+=this.speed*dt/1000;const target=this.lane?.36:.23;this.radius+=(target-this.radius)*Math.min(1,dt/65);
 this.nextSpawn-=dt;if(this.nextSpawn<=0){const ahead=1.7+this.random()*.8;this.obstacles.push({id:++this.id,angle:this.angle+ahead,lane:this.random()<.5?0:1,age:0,passed:false});this.nextSpawn= Math.max(420,1200/(1+this.elapsed/90000))*(.9+this.random()*.2);}
 for(const obstacle of this.obstacles){obstacle.age+=dt;if(obstacle.age<650)continue;const distance=Math.atan2(Math.sin(obstacle.angle-this.angle),Math.cos(obstacle.angle-this.angle));const radius=obstacle.lane?.36:.23;
 if(this.grace===0&&Math.abs(distance)<.17&&Math.abs(radius-this.radius)<.048){this.lives--;this.grace=1400;obstacle.passed=true;events.push({kind:'hit'});if(!this.lives){this.ended=true;this.reason='lives';break;}}
 if(this.angle>obstacle.angle+.25)obstacle.passed=true;
 }
 this.obstacles=this.obstacles.filter(o=>!o.passed&&o.age<10000);
 }return events;}
 }
 return {create:random=>new Round(random),Round};
});
