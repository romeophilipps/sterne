'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm-duel.js'):root.StarDuel);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarOnline=api;})(globalThis,D=>{
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 function roomCode(crypto=globalThis.crypto){return Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>alphabet[n%32]).join('');}
 function normalize(code){return String(code||'').toUpperCase().replace(/[\s-]/g,'');}
 class Channel{
  constructor(config,code,options={}){this.config=config;this.code=normalize(code);this.WebSocket=options.WebSocket||globalThis.WebSocket;this.onmessage=()=>{};this.onstatus=()=>{};this.ref=0;this.closed=false;this.joined=false;this.generation=0;this.attempt=0;this.pending=new Map();}
  connect(){if(this.closed)return;this.generation++;const generation=this.generation;this.joined=false;this.onstatus('connecting');const url=this.config.url.replace(/^http/,'ws')+'/realtime/v1/websocket?apikey='+encodeURIComponent(this.config.key)+'&vsn=1.0.0';const socket=this.socket=new this.WebSocket(url);const timer=setTimeout(()=>{if(!this.joined&&generation===this.generation)socket.close();},12000);
   socket.onopen=()=>{if(this.closed||generation!==this.generation)return socket.close();this.joinRef=String(++this.ref);this.push('phx_join',{config:{broadcast:{ack:false,self:false},presence:{enabled:false},private:false}},this.joinRef);};
   socket.onmessage=event=>{if(this.closed||generation!==this.generation||typeof event.data!=='string'||event.data.length>500000)return;let m;try{m=JSON.parse(event.data);}catch{return;}if(m.topic!=='realtime:storm-duel-v'+D.VERSION+'-'+this.code&&m.topic!=='phoenix')return;if(m.event==='phx_reply'&&m.ref===this.joinRef){if(m.payload?.status!=='ok'){this.onstatus('error');return socket.close();}clearTimeout(timer);this.joined=true;this.attempt=0;this.onstatus('connected');this.heartbeat=setInterval(()=>{if(socket.readyState===1)socket.send(JSON.stringify({topic:'phoenix',event:'heartbeat',payload:{},ref:String(++this.ref)}));},20000);}else if(m.event==='broadcast'&&m.payload?.event==='duel'&&m.payload?.payload)this.onmessage(m.payload.payload);else if(m.event==='phx_error'||m.event==='phx_close')socket.close();};
   socket.onerror=()=>socket.close();socket.onclose=()=>{clearTimeout(timer);clearInterval(this.heartbeat);if(this.closed||generation!==this.generation)return;this.joined=false;this.onstatus('disconnected');this.reconnect=setTimeout(()=>this.connect(),Math.min(5000,500*2**this.attempt++));};
  }
  push(event,payload,ref=String(++this.ref)){if(this.socket?.readyState!==1)return false;this.socket.send(JSON.stringify({topic:'realtime:storm-duel-v'+D.VERSION+'-'+this.code,event,payload,ref,join_ref:this.joinRef}));return true;}
  send(payload){if(!this.joined||this.socket.bufferedAmount>250000)return false;return this.push('broadcast',{type:'broadcast',event:'duel',payload});}
  close(){this.closed=true;this.joined=false;clearTimeout(this.reconnect);clearInterval(this.heartbeat);this.socket?.close();}
 }
 class Session{
  constructor(config,{host=false,code=roomCode(),id=globalThis.crypto.randomUUID(),ChannelClass=Channel,clock=()=>Date.now()}={}){
   this.host=host;this.code=normalize(code);if(!/^[A-HJ-NP-Z2-9]{8}$/.test(this.code))throw Error('Bitte den achtstelligen Raumcode eingeben.');
   Object.assign(this,{id,clock,startedAt:clock(),lastPeer:0,lastHello:0,lastSend:0,lastPulse:0,seq:0,round:0,pending:[],votes:[false,false],voteRequested:false,peerLeft:false,peer:null,hostId:null,snapshot:null,match:null,state:'lobby',connected:false,closed:false});
   this.onchange=()=>{};this.channel=new ChannelClass(config,this.code);this.channel.onstatus=s=>{this.connected=s==='connected';this.change();if(this.connected)this.hello();};this.channel.onmessage=m=>this.receive(m);
  }
  start(){this.channel.connect();this.timer=setInterval(()=>this.update(),50);return this;}
  change(){this.onchange(this);}
  send(type,data={}){return this.channel.send({v:D.VERSION,type,from:this.id,to:this.peer||undefined,round:this.round,...data});}
  hello(){this.send(this.host?'offer':'hello',{to:undefined});this.lastHello=this.clock();}
  sendState(){this.snapshot=this.match.snapshot();this.send('snapshot',{state:this.snapshot,votes:[...this.votes],peerLeft:this.peerLeft});}
  startMatch(){this.round++;this.match=new D.Match((this.clock()^this.round*2654435761)>>>0);this.seq=0;this.pending=[];this.votes=[false,false];this.voteRequested=false;this.peerLeft=false;this.state='playing';this.lastTick=this.clock();this.lastSend=this.clock();this.sendState();this.change();}
  maybeRestart(){if(this.match&&this.match.winner!==null&&this.votes.every(Boolean)&&!this.peerLeft)this.startMatch();}
  requestRematch(){if(this.closed||!this.connected||this.peerLeft||this.state!=='playing'||this.snapshot?.winner==null)return false;const seat=this.host?0:1;if(this.votes[seat])return false;this.votes[seat]=true;this.voteRequested=true;if(this.host){this.sendState();this.change();this.maybeRestart();}else{this.send('rematch');this.lastVoteSend=this.clock();this.change();}return true;}
  receive(m){
   if(this.closed||!m||m.v!==D.VERSION||m.from===this.id||typeof m.from!=='string'||m.from.length>100||m.to&&m.to!==this.id)return;
   if(this.host){
    if(m.type==='hello'){if(this.peer&&m.from!==this.peer){this.send('full',{to:m.from});return;}this.peer=m.from;this.lastPeer=this.clock();this.send('welcome');return;}
    if(m.from!==this.peer)return;this.lastPeer=this.clock();
    if(m.type==='ready'){if(!this.match)this.startMatch();else{this.sendState();this.change();}return;}
    if(m.round!==this.round)return;
    if(m.type==='command'&&this.match){this.match.command(1,m.command);this.sendState();this.change();}
    else if(m.type==='rematch'&&this.match?.winner!==null&&!this.peerLeft){this.votes[1]=true;this.sendState();this.change();this.maybeRestart();}
    else if(m.type==='leave'&&this.match){this.peerLeft=true;this.match.surrender(1);this.sendState();this.change();}
   }else{
    if(m.type==='offer'&&!this.hostId){this.hello();return;}
    if(m.type==='full'&&!this.hostId){this.state='full';this.change();return;}
    if(m.type==='welcome'){if(this.hostId&&this.hostId!==m.from)return;this.hostId=this.peer=m.from;this.lastPeer=this.clock();this.send('ready');return;}
    if(m.from!==this.hostId)return;this.lastPeer=this.clock();
    if(m.type==='snapshot'&&D.validSnapshot(m.state)&&Number.isInteger(m.round)&&m.round>=1&&m.round>=this.round){
     if(m.round>this.round){this.round=m.round;this.seq=0;this.pending=[];this.snapshot=null;this.votes=[false,false];this.voteRequested=false;}
     if(this.snapshot&&m.state.seq<this.snapshot.seq)return;
     this.snapshot=m.state;this.state='playing';this.peerLeft=!!m.peerLeft;this.votes=Array.isArray(m.votes)&&m.votes.length===2?m.votes.map(Boolean):[false,false];if(this.voteRequested)this.votes[1]=true;
     this.pending=this.pending.filter(c=>c.seq>(this.snapshot.ack[1]||0));this.change();
    }else if(m.type==='leave'&&m.round===this.round){this.peerLeft=true;if(this.snapshot?.winner==null)this.state='ended';this.change();}
   }
  }
  get paused(){return this.state==='playing'&&this.snapshot?.winner===null&&(!this.connected||this.clock()-this.lastPeer>2500);}
  command(action,kind,index){if(this.state!=='playing'||this.paused||this.snapshot?.winner!==null||this.pending.length>=12)return false;const command={seq:++this.seq,action,kind,index};if(this.host){this.match.command(0,command);this.snapshot=this.match.snapshot();this.change();}else{this.pending.push(command);this.send('command',{command});}return true;}
  update(){
   if(this.closed)return;const now=this.clock();
   if(now-this.lastPulse>=700&&this.peer&&!this.peerLeft){this.send('pulse');this.lastPulse=now;}
   if(this.state==='lobby'&&now-this.lastHello>=1000)this.hello();
   if(!this.host&&this.hostId&&!this.snapshot&&now-this.lastHello>=1000){this.send('ready');this.lastHello=now;}
   if(!this.host&&this.voteRequested&&this.snapshot?.winner!==null&&!this.peerLeft&&now-(this.lastVoteSend||0)>=800){this.send('rematch');this.lastVoteSend=now;}
   if(this.host&&this.match){const dt=now-(this.lastTick||now);this.lastTick=now;if(!this.paused&&this.match.winner===null)this.match.tick(dt);if(now-this.lastSend>=200){this.sendState();this.lastSend=now;this.change();}}
   else if(this.pending.length&&now-this.lastSend>=800){this.send('command',{command:this.pending[0]});this.lastSend=now;}
   if(this.state==='lobby'&&now-this.startedAt>15000&&!this.host&&!this.hostId){this.state='missing';this.change();}
   if(this.state==='playing'&&this.snapshot?.winner===null&&now-this.lastPeer>20000){this.state='ended';if(this.match)this.match.winner='draw';this.change();}
   if(this.paused)this.change();
  }
  close(){if(this.closed)return;if(this.host&&this.match){this.match.surrender(0);this.sendState();}this.send('leave');this.closed=true;clearInterval(this.timer);this.channel.close();}
 }

 return {Channel,Session,roomCode,normalize};
});
