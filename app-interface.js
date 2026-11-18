'use strict';
/* Presentation only: fixed SVG currency glyphs and German, accessible numeric labels. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarInterface=api;})(globalThis,()=>{
 const names={coins:'Bronze',silver:'Silber',gold:'Gold',stars:'Sterne',diamonds:'Diamanten'};
 const paths={coin:'<circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor"/>',stars:'<path d="m12 1 2.6 7.7L23 12l-8.4 3.3L12 23l-2.6-7.7L1 12l8.4-3.3Z" fill="currentColor"/>',diamonds:'<path d="m5 3-4 6 11 13L23 9l-4-6Z" fill="currentColor" fill-opacity=".3" stroke="currentColor" stroke-linejoin="round"/><path d="m1 9 22 0M5 3l7 19 7-19M5 3h14" fill="none" stroke="currentColor"/>'};
 function currency(key,value){if(!Object.hasOwn(names,key))throw new TypeError('Unknown currency');const number=Math.max(0,Number(value)||0).toLocaleString('de-DE');return '<span class="su-money" data-currency="'+key+'" role="img" aria-label="'+number+' '+names[key]+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[key]||paths.coin)+'</svg><span aria-hidden="true">'+number+'</span></span>';}
 return {currency};
});
