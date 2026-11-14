'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarCatch=api;})(globalThis,()=>{
  const START_MS=20000,GOLD_MS=4000,CATCH_Y=.84,RUSH_MS=4600,COMBO=6;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  class Round {
    constructor(random=Math.random){
      this.random=random;this.score=0;this.lives=3;this.remaining=START_MS;this.elapsed=0;
      this.player=.5;this.tilt=0;this.stars=[];this.nextWave=100;this.nextGold=0;this.waves=0;this.id=0;
      this.combo=0;this.rush=0;this.grace=0;this.lastPattern=-1;this.ended=false;this.reason=null;
    }
    get level(){return 1+Math.floor(this.score/24)+Math.floor(this.elapsed/30000);}
    get interval(){return 700+800*Math.pow(.95,this.level-1);}
    get duration(){return 1100+1450*Math.pow(.93,this.level-1);}
    get speed(){return .93/(this.duration/1000);}
    range(a,b){return a+(b-a)*this.random();}
    move(x){if(!this.ended&&Number.isFinite(x)){const next=clamp(x,.1,.9);this.tilt=clamp((next-this.player)*190,-18,18);this.player=next;}}
    end(reason){this.ended=true;this.reason=reason;this.stars=[];}
    add(kind,end,delay=0,duration=this.duration,curve){
      if(kind!=='bad'){
        // A later shower must also respect hazards that are already on screen.
        for(let attempt=0;attempt<4&&this.stars.some(s=>s.kind==='bad'&&!s.passed&&Math.abs(s.duration-s.age-delay-duration)<330&&Math.abs(s.end-end)<.26);attempt++)delay+=660;
      }
      const eta=delay+duration;
      // Keep a time/space gap around a reward; never hide a red star inside it.
      if(kind==='bad'&&this.stars.some(s=>!s.done&&s.kind!=='bad'&&Math.abs(s.duration-s.age-eta)<330&&Math.abs(s.end-end)<.26))return;
      if(kind==='bad'&&this.stars.filter(s=>s.kind==='bad'&&Math.abs(s.duration-s.age-eta)<400).length>=2)return;
      const start=clamp(end+this.range(-.38,.38),.08,.92);
      this.stars.push({id:++this.id,kind,start,end,control:clamp(curve??this.range(.08,.92),.06,.94),
        age:-delay,duration,x:start,y:-.09,rotation:this.range(-20,20),spin:this.range(-65,65),size:this.range(.115,.15),done:false,passed:false});
    }
    spawn(){
      let pattern=Math.floor(this.random()*4);if(pattern===this.lastPattern)pattern=(pattern+1+Math.floor(this.random()*3))%4;
      if(!this.waves)pattern=0;this.lastPattern=pattern;
      const gold=this.elapsed>=this.nextGold;if(gold)this.nextGold=this.elapsed+this.range(2600,3500);
      const duration=this.duration*this.range(.88,1.1),direction=this.random()<.5?1:-1;
      const count=pattern===0?4:pattern===1?3:pattern===2?2:3;
      const center=this.range(.3,.7),span=this.range(.26,.48);
      for(let i=0;i<count;i++){
        let end,delay;
        if(pattern===0){end=.5+direction*(i/(count-1)-.5)*span;delay=i*this.range(170,230);}
        else if(pattern===1){end=clamp(center+Math.sin(i*1.9)*direction*.26,.12,.88);delay=i*this.range(240,360);}
        else if(pattern===2){end=i===0?this.range(.12,.32):this.range(.68,.88);delay=i*430;}
        else{end=clamp(center+direction*i*.1,.12,.88);delay=i*190;}
        this.add(gold&&i===count-1?'gold':'good',end,delay,duration*(pattern===1?this.range(.85,1.12):1),pattern===3?1-center:undefined);
      }
      if(this.elapsed>2800&&this.random()<Math.min(.9,.5+this.level*.035)){
        this.add('bad',this.range(.12,.88),this.range(100,500),duration*this.range(.82,1.15));
        if(this.level>=4&&this.random()<.5)this.add('bad',this.range(.12,.88),this.range(650,950),duration*this.range(.9,1.12));
      }
      this.waves++;
    }
    collect(star,events){
      star.done=true;
      if(star.kind==='bad'){
        if(this.grace>0)return;
        this.lives--;this.combo=0;this.rush=0;this.grace=1100;
        events.push({kind:'bad',x:star.x,points:0,time:0});
        if(!this.lives)this.end('lives');return;
      }
      const boosted=this.rush>0,points=(star.kind==='gold'?3:1)*(boosted?2:1),time=star.kind==='gold'?GOLD_MS:0;
      this.score+=points;this.remaining+=time;
      if(!boosted)this.combo++;
      events.push({kind:star.kind,x:star.x,points,time,combo:this.combo,boosted});
      if(!boosted&&this.combo>=COMBO){this.combo=0;this.rush=RUSH_MS;events.push({kind:'rush',x:this.player,points:0,time:0});}
    }
    tick(ms){
      const events=[];if(this.ended||!Number.isFinite(ms)||ms<=0)return events;
      let left=ms;
      while(left>0&&!this.ended){
        const dt=Math.min(16,left,this.remaining);left-=dt;this.elapsed+=dt;this.remaining=Math.max(0,this.remaining-dt);
        if(!this.remaining){this.end('time');break;}
        this.rush=Math.max(0,this.rush-dt);this.grace=Math.max(0,this.grace-dt);this.tilt*=Math.exp(-dt/90);
        this.nextWave-=dt;if(this.nextWave<=0){this.spawn();this.nextWave+=this.interval*this.range(.75,1.3);}
        for(const star of this.stars){
          if(star.done)continue;const before=star.y;star.age+=dt;if(star.age<0)continue;
          const t=star.age/star.duration;
          star.y=-.09+.93*Math.pow(t,1.26);
          star.x=clamp((1-t)*(1-t)*star.start+2*(1-t)*t*star.control+t*t*star.end,.065,.935);
          if(this.rush>0&&star.kind!=='bad'&&star.y>.5&&Math.abs(star.x-this.player)<.25){
            star.x+=(this.player-star.x)*clamp((star.y-.5)/.3,0,1);
          }
          if(!star.passed&&before<CATCH_Y&&star.y>=CATCH_Y){
            star.passed=true;const distance=Math.abs(star.x-this.player),radius=.09+star.size*(star.kind==='bad'?.2:.35);
            if(distance<=radius){this.collect(star,events);if(this.ended)break;}
            else if(star.kind==='bad'&&distance<radius+.09&&this.grace===0){this.score+=2;events.push({kind:'dodge',x:star.x,points:2,time:0});}
            else if(star.kind!=='bad'&&this.rush===0){this.combo=0;events.push({kind:'miss',x:star.x,points:0,time:0});}
          }
        }
        this.stars=this.stars.filter(s=>!s.done&&s.y<1.15);
      }
      return events;
    }
  }
  return {create:random=>new Round(random),START_MS,GOLD_MS,CATCH_Y,RUSH_MS,COMBO};
});
