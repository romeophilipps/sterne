'use strict';
(()=>{
 const $=id=>document.getElementById(id),dialog=$('profile-dialog'),input=$('profile-name'),form=$('profile-form'),status=$('profile-status');
 const normalize=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,18);
 let name='',id='';try{name=normalize(localStorage.getItem('stars-player-name'));id=localStorage.getItem('stars-player-id')||'';}catch{}
 const validId=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
 function store(value){const player=validId(id)?id:crypto.randomUUID();localStorage.setItem('stars-player-id',player);localStorage.setItem('stars-player-name',value);if(localStorage.getItem('stars-player-name')!==value)throw Error('Speichern fehlgeschlagen');id=player;name=value;}
 function ensure(){if(name&&validId(id))return true;if(!dialog.open)dialog.showModal();input.focus();return false;}
 window.StarPlayer={get ready(){return !!name&&validId(id);},get name(){return name;},get id(){return id;},ensure};
 dialog.addEventListener('cancel',e=>e.preventDefault());
 dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();}});
 dialog.addEventListener('close',()=>{if(!window.StarPlayer.ready)ensure();});
 document.addEventListener('click',e=>{if(!window.StarPlayer.ready&&!dialog.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();ensure();}},true);
 form.addEventListener('submit',e=>{e.preventDefault();const value=normalize(input.value);if(!value){status.textContent='Gib dir zuerst einen Namen.';input.focus();return;}try{store(value);dialog.close();document.dispatchEvent(new CustomEvent('stars-profile-ready'));}catch{status.textContent='Dein Name konnte nicht gespeichert werden. Erlaube dieser App das Speichern auf deinem Gerät und versuche es erneut.';}});
 if(name){try{store(name);}catch{name='';}}ensure();
})();
