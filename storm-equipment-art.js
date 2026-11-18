'use strict';
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarEquipmentArt=api;})(globalThis,()=>{
 const ORDER=Object.freeze([0,1,2,3,4,5,6,7,9]);
 const ROLES=Object.freeze(['Allrounder · Flexibel','Verteidigung · Schutz','Fernkampf · Präzision','Schwer · Durchschlag','Fernkampf · Energie','Nahkampf · Schnell','Nahkampf · Robust','Unterstützung · Heilung','','Magie · Kontrolle']);
 const ICONS=Object.freeze(['⌃','◈','⌖','➶','ϟ','↗','✊','✚','','◎']);
 const DEFAULTS=Object.freeze(['Blaues Energieschwert','Sternenschild','Präzisionsgewehr','Panzerjäger-Werfer','Fusionsgewehr','Zwei gerade Energiedolche','Sternenhammer','Heilungsstab','','Magischer Dimensionskern']);
 function preview(type,active){if(!ORDER.includes(type))return null;const special=type===0&&[1,2].includes(active?.id);return {src:special?'equipment-weapon-'+active.id+'.webp':'equipment-'+type+'.webp',framed:!special,name:active?.name||DEFAULTS[type],rarity:1,width:special?180:276,height:special?175:89};}
 return {ORDER,ROLES,ICONS,DEFAULTS,preview};
});
