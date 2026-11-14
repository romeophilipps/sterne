'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarCatch=api;})(globalThis,()=>{
  const START_MS=20000,GOLD_MS=4000,CATCH_Y=.84,LANES=[.18,.5,.82];
  class Round {
    constructor(random=Math.random){this.random=random;this.score=0;this.lives=3;this.remaining=START_MS;this.elapsed=0;this.player=.5;this.stars=[];this.nextWave=200;this.waves=0;this.id=0;this.untilGold=3;this.ended=false;this.reason=null;}
    get level(){return 1+Math.floor(this.score/10)+Math.floor(this.elapsed/45000);}
    get interval(){return 280+470*Math.pow(.91,this.level-1);}
    get speed(){return .25+.23*(1-Math.pow(.92,this.level-1));}
    get goldEvery(){return 4+Math.floor((this.level-1)/5);}
    move(x){if(!this.ended&&Number.isFinite(x))this.player=Math.max(.12,Math.min(.88,x));}
    end(reason){this.ended=true;this.reason=reason;this.stars=[];}
    spawn(){
      const lane=Math.min(2,Math.floor(this.random()*3)),gold=this.untilGold===0;
      this.untilGold=gold?this.goldEvery-1:this.untilGold-1;
      const add=(index,kind)=>this.stars.push({id:++this.id,x:LANES[index],y:-.09,kind,speed:this.speed});
      add(lane,gold?'gold':'good');
      const others=[0,1,2].filter(i=>i!==lane);
      if(this.random()<Math.min(.86,.34+(this.level-1)*.045)){
        const bad=others.splice(Math.min(1,Math.floor(this.random()*2)),1)[0];add(bad,'bad');
        if(this.level>=6&&this.random()<Math.min(.55,(this.level-5)*.04))add(others[0],'bad');
      }
      this.waves++;
    }
    tick(ms){
      const events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return events;
      // Small fixed steps keep collisions reliable after slow frames; time still advances in full.
      let left=ms;
      while(left>0&&!this.ended){
        const dt=Math.min(16,left,this.remaining);left-=dt;this.elapsed+=dt;this.remaining=Math.max(0,this.remaining-dt);
        if(this.remaining===0){this.end('time');break;}
        this.nextWave-=dt;if(this.nextWave<=0){this.spawn();this.nextWave+=this.interval;}
        for(const star of [...this.stars]){
          const before=star.y;star.y+=star.speed*dt/1000;
          if(before<CATCH_Y&&star.y>=CATCH_Y){
            const caught=Math.abs(star.x-this.player)<=.145;
            if(caught){
              const event={kind:star.kind,x:star.x,points:star.kind==='gold'?3:star.kind==='good'?1:0,time:star.kind==='gold'?GOLD_MS:0};
              this.score+=event.points;this.remaining+=event.time;if(star.kind==='bad')this.lives--;
              events.push(event);star.done=true;
              if(this.lives===0){this.end('lives');break;}
            }else if(star.kind==='good'){
              this.remaining=Math.max(0,this.remaining-1000);events.push({kind:'miss',x:star.x,points:0,time:-1000});
              if(this.remaining===0){this.end('time');break;}
            }
          }
        }
        this.stars=this.stars.filter(star=>!star.done&&star.y<1.12);
      }
      return events;
    }
  }
  return {create:random=>new Round(random),START_MS,GOLD_MS,CATCH_Y};
});
