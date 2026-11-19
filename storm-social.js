'use strict';
((root,factory)=>{const api=factory(typeof module==='object'&&module.exports?require('./storm-online.js'):root.StarOnline,typeof module==='object'&&module.exports?require('./storm-duel.js'):root.StarDuel);if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSocial=api;})(globalThis,(O,D)=>{
 const name=value=>typeof value==='string'?value.trim().slice(0,18):'',validId=value=>typeof value==='string'&&value.length>0&&value.length<=100;
 const draft=value=>value&&Array.isArray(value.warriors)&&value.warriors.length<=4&&new Set(value.warriors).size===value.warriors.length&&value.warriors.every(i=>Number.isInteger(i)&&i>=0&&i<10)&&Array.isArray(value.heroes)&&value.heroes.length===1&&Number.isInteger(value.heroes[0])&&value.heroes[0]>=0&&value.heroes[0]<5;
 const clone=value=>({warriors:[...value.warriors],heroes:[...value.heroes]});
 const same=(a,b)=>draft(a)&&draft(b)&&a.heroes[0]===b.heroes[0]&&a.warriors.length===b.warriors.length&&a.warriors.every(i=>b.warriors.includes(i));
 class Directory{
  constructor(config,{id=globalThis.crypto.randomUUID(),playerName,ChannelClass=O.Channel,clock=()=>Date.now()}={}){Object.assign(this,{id,name:name(playerName),clock,peers:new Map(),decisions:new Map(),active:true,available:true,connected:false,closed:false,outgoing:null,incoming:null,pair:null,lastSend:-Infinity});this.onchange=()=>{};this.oninvite=()=>{};this.onpair=()=>{};this.oncancel=()=>{};this.channel=new ChannelClass(config,'PLAYERS');this.channel.onmessage=m=>this.receive(m);this.channel.onstatus=s=>{this.connected=s==='connected';if(this.connected){this.send('query');this.announce();}else{this.peers.clear();this.cancelInvite();if(this.incoming)this.finishIncoming('decline');}this.onchange(this);};}
  start(){this.channel.connect();this.timer=setInterval(()=>this.tick(),250);return this;}
  send(type,data={}){return this.channel.send({social:1,type,from:this.id,...data});}
  announce(){if(!this.active)return;this.send('online',{name:this.name,available:this.available&&!this.outgoing&&!this.incoming&&!this.pair});this.lastSend=this.clock();}
  setActive(value){this.active=!!value;if(!this.active){this.cancelInvite();if(this.incoming)this.finishIncoming('decline');this.send('offline');}else{this.send('query');this.announce();}this.onchange(this);}
  setAvailable(value){this.available=!!value;this.announce();this.onchange(this);}
  invite(peerId){const peer=this.peers.get(peerId);if(!this.active||!this.connected||!this.available||this.outgoing||this.incoming||this.pair||!peer?.available)return false;this.outgoing={id:globalThis.crypto.randomUUID(),peer:peerId,name:peer.name,code:O.roomCode(),deadline:this.clock()+10000};this.sendInvite();this.announce();this.onchange(this);return true;}
  sendInvite(){const i=this.outgoing;if(i){this.send('invite',{to:i.peer,invite:i.id,code:i.code,name:this.name});i.lastSend=this.clock();}}
  respond(accept){const i=this.incoming;if(!i||!this.connected||!this.active)return false;if(this.clock()>=i.deadline){this.finishIncoming('expired');return false;}const reply={to:i.peer,invite:i.id,code:i.code};this.decisions.set(i.id,{...reply,type:accept?'accept':'decline',time:this.clock()});this.incoming=null;if(accept)this.pair={id:i.id,peer:i.peer};this.send(accept?'accept':'decline',reply);if(accept&&this.pair?.id===i.id){this.onpair({host:false,id:this.id,peer:i.peer,peerName:i.name,code:i.code});}this.announce();this.onchange(this);return true;}
  finishIncoming(reason){const i=this.incoming;if(!i)return;this.send(reason==='expired'?'expired':'decline',{to:i.peer,invite:i.id});this.decisions.set(i.id,{to:i.peer,invite:i.id,type:'decline',time:this.clock()});this.incoming=null;this.oninvite(null);this.announce();this.onchange(this);}
  cancelInvite(){const i=this.outgoing;if(i)this.send('cancel',{to:i.peer,invite:i.id});this.outgoing=null;this.announce();this.onchange(this);}
  release(){this.pair=null;this.outgoing=null;if(this.incoming)this.finishIncoming('decline');this.announce();this.onchange(this);}
  receive(m){if(this.closed||m?.social!==1||!validId(m.from)||m.from===this.id||m.to&&m.to!==this.id)return;const now=this.clock();
   if(m.type==='online'&&name(m.name)){this.peers.set(m.from,{id:m.from,name:name(m.name),available:m.available===true,seen:now});this.onchange(this);return;}
   if(m.type==='query'){if(now-this.lastQuery>500||this.lastQuery===undefined){this.lastQuery=now;this.announce();}return;}
   if(m.type==='offline'){this.peers.delete(m.from);this.onchange(this);return;}
   if(!validId(m.invite))return;
   if(m.type==='invite'&&/^[A-HJ-NP-Z2-9]{8}$/.test(m.code)&&name(m.name)){
    const decided=this.decisions.get(m.invite);if(decided&&decided.to===m.from){this.send(decided.type,decided);return;}
    if(this.incoming?.id===m.invite)return;
    if(!this.active||!this.available||this.incoming||this.outgoing||this.pair){this.send('decline',{to:m.from,invite:m.invite});return;}
    this.incoming={id:m.invite,peer:m.from,name:name(m.name),code:m.code,deadline:now+10000};this.oninvite(this.incoming);this.announce();this.onchange(this);return;
   }
   const i=this.outgoing;
   if(i&&m.from===i.peer&&m.invite===i.id){
    if(m.type==='accept'){if(now>=i.deadline){this.cancelInvite();return;}this.outgoing=null;this.pair={id:i.id,peer:i.peer};this.onpair({host:true,id:this.id,peer:i.peer,peerName:i.name,code:i.code});this.announce();this.onchange(this);}
    else if(['decline','expired'].includes(m.type)){this.outgoing=null;this.notice=m.type==='decline'?'Einladung abgelehnt.':'Einladung abgelaufen. Du kannst erneut einladen.';this.announce();this.onchange(this);}
   }
   if(m.type==='cancel'&&this.pair?.id===m.invite&&this.pair.peer===m.from){this.pair=null;this.oncancel('Die Einladung ist abgelaufen. Bitte erneut einladen.');this.announce();this.onchange(this);}
   if(m.type==='cancel')this.decisions.set(m.invite,{to:m.from,invite:m.invite,type:'decline',time:now});
   if(m.type==='cancel'&&this.incoming?.id===m.invite&&this.incoming.peer===m.from){this.incoming=null;this.oninvite(null);this.announce();this.onchange(this);}
  }
  tick(){if(this.closed||!this.active)return;const now=this.clock();let changed=false;for(const [id,p]of this.peers)if(now-p.seen>7000){this.peers.delete(id);changed=true;}for(const [id,d]of this.decisions)if(now-d.time>60000)this.decisions.delete(id);if(now-this.lastSend>=2000)this.announce();if(this.incoming&&now>=this.incoming.deadline)this.finishIncoming('expired');if(this.outgoing){if(now>=this.outgoing.deadline){this.notice='Einladung abgelaufen. Du kannst erneut einladen.';this.cancelInvite();}else if(now-this.outgoing.lastSend>=1000)this.sendInvite();}if(changed)this.onchange(this);}
  close(){if(this.closed)return;this.cancelInvite();if(this.incoming)this.finishIncoming('decline');this.send('offline');this.closed=true;clearInterval(this.timer);this.channel.close();}
 }
 class Lobby{
  constructor(config,{host,id,peer,code,equipment=globalThis.StarArmoryUI?.equipment?.()||{},ChannelClass=O.Channel,clock=()=>Date.now()}={}){Object.assign(this,{host,id,peer,code,clock,ownEquipment:D.normalizeEquipment(equipment),otherEquipment:D.normalizeEquipment({}),own:{warriors:[],heroes:[0]},other:null,ready:false,peerReady:false,seq:0,peerSeq:-1,connected:false,closed:false,launched:false,lastPeer:clock(),lastSend:-Infinity});this.onchange=()=>{};this.onlaunch=()=>{};this.onleave=()=>{};this.channel=new ChannelClass(config,code+'-TEAM');this.channel.onstatus=s=>{this.connected=s==='connected';if(!this.connected){this.ready=false;this.peerReady=false;}else this.publish();this.onchange(this);};this.channel.onmessage=m=>this.receive(m);}
  start(){this.channel.connect();this.timer=setInterval(()=>this.tick(),250);return this;}
  send(type,data={}){return this.channel.send({lobby:1,type,from:this.id,to:this.peer,...data});}
  publish(){this.send('team',{team:clone(this.own),equipment:D.normalizeEquipment(this.ownEquipment),ready:this.ready,seq:this.seq});this.lastSend=this.clock();}
  select(team){if(this.closed||this.launched||this.ready||!draft(team))return false;this.own=clone(team);this.seq++;this.publish();this.onchange(this);return true;}
  setReady(value){if(!this.connected||this.launched||!D.validLoadout(this.own))return false;this.ready=!!value;this.seq++;this.publish();this.onchange(this);this.maybeLaunch();return true;}
  maybeLaunch(){if(!this.host||this.launched||!this.ready||!this.peerReady||!D.validLoadout(this.other))return;this.send('launch',{hostTeam:this.own,guestTeam:this.other,hostSeq:this.seq,guestSeq:this.peerSeq});}
  launch(){if(this.launched)return;this.launched=true;this.onlaunch({host:this.host,id:this.id,expectedPeer:this.peer,code:this.code,loadout:clone(this.own),equipment:D.normalizeEquipment(this.ownEquipment)});}
  receive(m){if(this.closed||m?.lobby!==1||m.from!==this.peer||m.to!==this.id)return;this.lastPeer=this.clock();
   if(m.type==='leave'&&!this.launched){this.ready=false;this.peerReady=false;this.onleave('Dein Mitspieler hat das Startmenü verlassen.');return;}
   if(m.type==='team'&&draft(m.team)&&D.validEquipment(m.equipment||{})&&Number.isInteger(m.seq)&&m.seq>=this.peerSeq){this.peerSeq=m.seq;this.other=clone(m.team);this.otherEquipment=D.normalizeEquipment(m.equipment||{});this.peerReady=m.ready===true&&D.validLoadout(this.other);this.onchange(this);this.maybeLaunch();}
   if(m.type==='launch'&&!this.host&&this.ready&&this.peerReady&&m.guestSeq===this.seq&&m.hostSeq===this.peerSeq&&same(m.guestTeam,this.own)&&same(m.hostTeam,this.other)){this.send('launch-ack',{hostSeq:m.hostSeq,guestSeq:m.guestSeq});this.launch();}
   if(m.type==='launch-ack'&&this.host&&this.ready&&this.peerReady&&m.hostSeq===this.seq&&m.guestSeq===this.peerSeq)this.launch();
  }
  tick(){if(this.closed)return;if(this.clock()-this.lastSend>=700){this.publish();this.maybeLaunch();}if(!this.launched&&this.clock()-this.lastPeer>15000){this.ready=false;this.peerReady=false;this.onleave('Die Verbindung zum Mitspieler wurde unterbrochen.');}}
  close(){if(this.closed)return;this.send('leave');this.closed=true;clearInterval(this.timer);this.channel.close();}
 }
 return {Directory,Lobby,validDraft:draft,sameTeam:same};
});
