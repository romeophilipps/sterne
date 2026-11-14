'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSnake=api;})(globalThis,()=>{
 const SIZE=13;
 class Round{
 constructor(random=Math.random){this.random=random;this.elapsed=0;this.score=0;this.lives=3;this.ended=false;this.reason=null;this.snake=[{x:6,y:8},{x:6,y:9},{x:6,y:10}];this.direction={x:0,y:-1};this.queued=null;this.previous=this.snake.map(p=>({...p}));this.clock=0;this.eaten=0;this.hazards=[];this.food=this.free();this.gold=false;this.grace=0;}
 get positions(){const alpha=Math.min(1,this.clock/this.interval),previous=this.previous||this.snake;return this.snake.map((p,i)=>{const a=previous[Math.min(i,previous.length-1)]||p;let dx=p.x-a.x,dy=p.y-a.y;if(dx>SIZE/2)dx-=SIZE;if(dx<-SIZE/2)dx+=SIZE;if(dy>SIZE/2)dy-=SIZE;if(dy<-SIZE/2)dy+=SIZE;return {x:((a.x+dx*alpha+.5+SIZE)%SIZE)-.5,y:((a.y+dy*alpha+.5+SIZE)%SIZE)-.5};});}
 get level(){return 1+Math.floor(this.eaten/4);}get interval(){return 95+185*Math.pow(.94,this.eaten);}
 free(){const cells=[];for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(!this.snake.some(p=>p.x===x&&p.y===y)&&!this.hazards.some(p=>p.x===x&&p.y===y))cells.push({x,y});return cells[Math.min(cells.length-1,Math.floor(this.random()*cells.length))]||null;}
 turn(x,y){if(this.ended||this.queued||Math.abs(x)+Math.abs(y)!==1||x===-this.direction.x&&y===-this.direction.y)return;this.queued={x,y};}
 tick(ms){const events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return events;this.elapsed+=ms;this.clock+=ms;this.grace=Math.max(0,this.grace-ms);
 while(this.clock>=this.interval&&!this.ended){this.clock-=this.interval;if(this.queued){this.direction=this.queued;this.queued=null;}const head=this.snake[0],next={x:(head.x+this.direction.x+SIZE)%SIZE,y:(head.y+this.direction.y+SIZE)%SIZE};const eat=this.food&&next.x===this.food.x&&next.y===this.food.y;const body=eat?this.snake:this.snake.slice(0,-1);
 if(body.some(p=>p.x===next.x&&p.y===next.y)||this.hazards.some(p=>p.x===next.x&&p.y===next.y)){
 this.lives--;events.push({kind:'bad'});if(!this.lives){this.ended=true;this.reason='lives';break;}
 this.snake=[{x:6,y:8},{x:6,y:9},{x:6,y:10}];this.direction={x:0,y:-1};this.queued=null;this.hazards=[];this.food=this.free();this.previous=this.snake.map(p=>({...p}));this.clock=0;break;}
 this.previous=this.snake.map(p=>({...p}));this.snake.unshift(next);if(!eat)this.snake.pop();else{this.score+=this.gold?3:1;this.eaten++;events.push({kind:'hit'});this.gold=this.eaten%4===3;
 if(this.eaten%4===0&&this.hazards.length<14){const h=this.free();if(h&&Math.abs(h.x-next.x)+Math.abs(h.y-next.y)>3)this.hazards.push(h);}
 this.food=this.free();if(!this.food){this.score+=25;this.snake=this.snake.slice(0,3);this.hazards=[];this.food=this.free();}}
 }return events;}
 }
 return {create:random=>new Round(random),Round,SIZE};
});
