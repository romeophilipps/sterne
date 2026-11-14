'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSling=api;})(globalThis,()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 class Round{
 constructor(random=Math.random){this.random=random;this.score=0;this.lives=3;this.elapsed=0;this.stage=0;this.ended=false;this.reason=null;this.height=1.6;this.player={x:.5,y:1.3};this.vx=0;this.vy=0;this.moving=false;this.targets=[];this.hazards=[];this.id=0;this.next();}
 get level(){return this.stage;}resize(w,h){if(w>0&&h>0){const old=this.height;this.height=Math.max(.8,Math.min(2.3,h/w));const scale=this.height/old;this.player.y*=scale;for(const t of [...this.targets,...this.hazards])t.y*=scale;}}
 next(){this.stage++;this.shots=Math.max(2,5-Math.floor((this.stage-1)/4));this.moving=false;this.vx=0;this.vy=0;this.player={x:.5,y:this.height-.18};this.targets=[];this.hazards=[];const count=Math.min(6,2+Math.floor(this.stage/2));
 for(let i=0;i<count;i++){this.targets.push({id:++this.id,x:.18+(i%3)*.32,y:.22+Math.floor(i/3)*.34,phase:this.random()*6.28,base:.18+(i%3)*.32});}
 for(let i=0;i<Math.min(3,Math.floor((this.stage-1)/2));i++)this.hazards.push({id:++this.id,x:.25+i*.25,y:this.height*.58,phase:this.random()*6.28});}
 launch(dx,dy){if(this.ended||this.moving||!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.035)return false;const length=Math.hypot(dx,dy),power=Math.min(.38,length);this.vx=dx/length*power*7;this.vy=dy/length*power*7;this.moving=true;this.flight=0;this.shots--;return true;}
 tick(ms){const events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return events;let left=ms;while(left>0&&!this.ended){const dt=Math.min(8,left);left-=dt;this.elapsed+=dt;
 if(this.stage>=4)for(const t of this.targets)t.x=clamp(t.base+Math.sin(this.elapsed/1000*(.65+this.stage*.025)+t.phase)*Math.min(.1,.025+this.stage*.005),.09,.91);
 if(!this.moving)continue;const sec=dt/1000;this.flight+=dt;this.player.x+=this.vx*sec;this.player.y+=this.vy*sec;
 if(this.player.x<.045||this.player.x>.955){this.player.x=clamp(this.player.x,.045,.955);this.vx*=-1;events.push({kind:'bounce'});}if(this.player.y<.045||this.player.y>this.height-.045){this.player.y=clamp(this.player.y,.045,this.height-.045);this.vy*=-1;events.push({kind:'bounce'});}
 this.vx*=Math.exp(-sec*.22);this.vy*=Math.exp(-sec*.22);
 for(const t of [...this.targets])if(Math.hypot(t.x-this.player.x,t.y-this.player.y)<.085){this.targets=this.targets.filter(x=>x!==t);this.score++;events.push({kind:'hit',x:t.x,y:t.y});}
 const bad=this.hazards.find(t=>Math.hypot(t.x-this.player.x,t.y-this.player.y)<.085);
 if(bad){this.moving=false;this.lives--;events.push({kind:'bad'});this.player={x:.5,y:this.height-.18};if(!this.lives){this.ended=true;this.reason='lives';break;}}
 if(!this.targets.length){this.score+=this.shots*2;events.push({kind:'clear'});this.next();continue;}
 if(this.flight>3800||Math.hypot(this.vx,this.vy)<.35)this.moving=false;
 if(!this.moving&&this.shots<=0){this.lives--;events.push({kind:'bad'});if(!this.lives){this.ended=true;this.reason='lives';break;}this.shots=3;this.player={x:.5,y:this.height-.18};}
 }return events;}
 }
 return {create:random=>new Round(random),Round};
});
