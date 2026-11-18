'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarEquipmentArt=api;})(globalThis,()=>{
 const ORDER=Object.freeze([0,1,2,3,4,5,6,7,9]);
 const ROLES=Object.freeze(['Allrounder · Flexibel','Verteidigung · Schutz','Fernkampf · Präzision','Schwer · Durchschlag','Fernkampf · Energie','Nahkampf · Schnell','Nahkampf · Robust','Unterstützung · Heilung','','Magie · Kontrolle']);
 const ICONS=Object.freeze({
 0:'M5 14l7-7 7 7M5 20l7-7 7 7',
 1:'M12 3l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6zM12 5v14',
 2:'M12 2v5m0 10v5M2 12h5m10 0h5M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M12 10v4m-2-2h4',
 3:'M7 17l10-10m-9 4-3 1-3 5 6-1m5 0-1 3-5 3 1-6m3-8 4-4 6-2-2 6-4 4z',
 4:'M13 2L5 13h7l-1 9 8-13h-7z',
 5:'M5 21l5-5m-3-3 4 4M9 12l9-9 3 0 0 3-9 9z',
 6:'M7 11V6a2 2 0 0 1 4 0v4-6a2 2 0 0 1 4 0v6-4a2 2 0 0 1 4 0v5-2a2 2 0 0 1 3 1v7l-4 5H9l-6-7a2 2 0 0 1 3-3l3 3',
 7:'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z',
 9:'M20 8a9 9 0 1 0 1 9M18 11a6 6 0 1 1-6-5 4 4 0 1 1-4 4',
 skins:'M8 3l4 2 4-2 6 5-3 4-3-2v11H8V10l-3 2-3-4zM8 3q4 6 8 0',
 modules:'M6 6h12v12H6zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4',
 armor:'M12 3l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6z',
 upgrades:'M12 21V5m-7 7 7-7 7 7M5 22h14'
 });
 function icon(type,doc=document){const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','armory-role-svg');const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',ICONS[type]||ICONS[0]);path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.8');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);return svg;}
 const DEFAULTS=Object.freeze(['Blaues Energieschwert','Sternenschild','Präzisionsgewehr','Panzerjäger-Werfer','Fusionsgewehr','Zwei gerade Energiedolche','Sternenhammer','Heilungsstab','','Magischer Dimensionskern']);
 function preview(type,active){if(!ORDER.includes(type))return null;const special=type===0&&[1,2].includes(active?.id);return {src:special?'equipment-weapon-'+active.id+'.webp':'equipment-'+type+'.webp',framed:!special,name:active?.name||DEFAULTS[type],rarity:1,width:special?180:276,height:special?175:90};}
 return {ORDER,ROLES,ICONS,DEFAULTS,preview,icon};
});
