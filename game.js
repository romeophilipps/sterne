'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarGame=api;})(globalThis,()=>{
  const START_MS=20000,GOLD_MS=4000;
  class Round {
    constructor(random=Math.random){this.random=random;this.score=0;this.lives=3;this.remaining=START_MS;this.elapsed=0;this.catches=0;this.untilGold=3;this.target=-1;this.targetAge=0;this.badStars=new Set();this.ended=false;this.reason=null;this.spawn();}
    get level(){return 1+Math.floor(this.score/10)+Math.floor(this.elapsed/45000);}
    get goldEvery(){return 4+Math.floor((this.level-1)/4);}
    get exposure(){return Math.round(350+950*Math.pow(.92,this.level-1));}
    get hazards(){return Math.min(6,2+Math.floor((this.level-1)/2));}
    end(reason){this.ended=true;this.reason=reason;this.target=-1;this.badStars.clear();}
    spawn(){
      if(this.ended)return;
      const previous=this.target,available=Array.from({length:9},(_,i)=>i).filter(i=>i!==previous);
      const take=()=>available.splice(Math.min(available.length-1,Math.floor(this.random()*available.length)),1)[0];
      this.target=take();this.targetAge=0;this.windowMs=this.exposure;this.bonus=this.untilGold===0;this.badStars.clear();
      for(let i=0;i<this.hazards;i++)this.badStars.add(take());
    }
    tick(ms){
      if(this.ended||!Number.isFinite(ms)||ms<=0)return;
      const delta=Math.min(ms,this.remaining);this.elapsed+=delta;this.remaining=Math.max(0,this.remaining-ms);this.targetAge+=delta;
      if(this.remaining===0){this.end('time');return;}
      if(this.targetAge>=this.windowMs){if(this.bonus)this.untilGold=this.goldEvery-1;this.spawn();}
    }
    hit(index){
      if(this.ended)return {kind:'none'};
      if(this.badStars.has(index)){this.badStars.delete(index);this.lives--;if(this.lives===0)this.end('lives');return {kind:'bad',points:0,time:0};}
      if(index!==this.target)return {kind:'none'};
      const gold=this.bonus,points=gold?3:1;this.score+=points;this.catches++;
      if(gold){this.remaining+=GOLD_MS;this.untilGold=this.goldEvery-1;}else this.untilGold--;
      this.spawn();return {kind:gold?'gold':'good',points,time:gold?GOLD_MS:0};
    }
  }
  return {create:random=>new Round(random),START_MS,GOLD_MS};
});
