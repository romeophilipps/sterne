'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarEnergyUI=api;})(globalThis,()=>{
 const hosts=new WeakMap(),SIZE=[643,85];
 const state=value=>Math.max(0,Math.min(100,Math.floor(Number(value)||0)));
 function rect(value){const n=state(value),i=n%72;return {page:Math.floor(n/72),x:i%3*643,y:Math.floor(i/3)*85,w:643,h:85};}
 // Previous artwork is removed while replacement files are being supplied.
 function render(host,army){if(!host||typeof document==='undefined')return;let e=hosts.get(host);if(!e){const box=document.createElement('div'),amount=document.createElement('span');box.className='storm-energy storm-energy-pending';box.setAttribute('role','progressbar');box.setAttribute('aria-label','Truppenenergie');box.setAttribute('aria-valuemin','0');box.setAttribute('aria-valuemax','100');amount.className='storm-energy-amount';amount.setAttribute('aria-hidden','true');box.append(amount);host.append(box);e={box,amount};hosts.set(host,e);}const value=Math.max(0,Math.min(100,Number(army.energy)||0));e.box.setAttribute('aria-valuenow',String(value));e.box.setAttribute('aria-valuetext',value.toLocaleString('de-DE',{maximumFractionDigits:2})+' von 100 Energie · +1 alle 2 Sekunden');e.amount.textContent='Energie '+value.toLocaleString('de-DE',{maximumFractionDigits:2})+' / 100';}
 return {SIZE,state,rect,render};
});
