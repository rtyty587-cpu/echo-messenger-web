import {doc,runTransaction,serverTimestamp} from './firebase-firestore.js?v=1.12.0';
export const SEASONS=Object.freeze([
 {id:'halloween',name:'Хэллоуин',badge:'HALLOWEEN',symbol:'✦',nft:'nft_lantern',price:6000,supply:350,color:'#ff913c'},
 {id:'newyear',name:'Новый год',badge:'NEW YEAR',symbol:'❄',nft:'nft_snowglobe',price:5500,supply:500,color:'#82eaff'},
 {id:'maslenitsa',name:'Масленица',badge:'МАСЛЕНИЦА',symbol:'☀',nft:'nft_sunwheel',price:5000,supply:450,color:'#ffc760'}
]);
// Ten calendar days, Moscow time; calendar explicitly maintained through 2030.
export const SEASON_WINDOWS=Object.freeze([
 ...[2026,2027,2028,2029,2030].flatMap(y=>[
  {key:'halloween-'+y,event:'halloween',start:Date.parse(y+'-10-22T00:00:00+03:00'),end:Date.parse(y+'-11-01T00:00:00+03:00')},
  {key:'newyear-'+y,event:'newyear',start:Date.parse(y+'-12-23T00:00:00+03:00'),end:Date.parse((y+1)+'-01-02T00:00:00+03:00')}
 ]),
 ...[['2026-02-23',2026],['2027-03-15',2027],['2028-02-28',2028],['2029-02-19',2029],['2030-03-11',2030]].map(([date,y])=>({key:'maslenitsa-'+y,event:'maslenitsa',end:Date.parse(date+'T00:00:00+03:00'),start:Date.parse(date+'T00:00:00+03:00')-864000000}))
]);
export function activeSeason(now=Date.now()){const w=SEASON_WINDOWS.find(w=>now>=w.start&&now<w.end);return w?{...SEASONS.find(e=>e.id===w.event),...w}:null}
export function seasonSale(id,now=Date.now()){const e=SEASONS.find(e=>e.nft===id);return !e||activeSeason(now)?.id===e.id}
export function seasonProfile(value,now=Date.now()){const e=activeSeason(now);return e&&value===e.id?e:null}
export function applySeasonTheme(preference,now=Date.now()){const e=activeSeason(now);return preference==='auto'?(e?.id||'dark'):SEASONS.some(s=>s.id===preference)?(e?.id===preference?preference:'dark'):['dark','light','midnight','aurora','cosmos'].includes(preference)?preference:'dark'}
export function decorateSeasonName(el,data){const e=seasonProfile(data.seasonBadge);if(!e)return;const badge=document.createElement('span');badge.className='seasonBadge season-'+e.id;badge.textContent=e.symbol+' '+e.badge;el.append(document.createTextNode(' '),badge)}
export function decorateSeasonAvatar(el,data){for(const cls of [...el.classList])if(cls.startsWith('aura-'))el.classList.remove(cls);const e=seasonProfile(data.seasonAura);if(e)el.classList.add('aura-'+e.id)}
export function refreshSeasonDecorations(){for(const el of document.querySelectorAll('.seasonBadge'))if(!seasonProfile(el.className.match(/season-(halloween|newyear|maslenitsa)/)?.[1]))el.remove();for(const el of document.querySelectorAll('[class*="aura-"]'))for(const cls of [...el.classList])if(cls.startsWith('aura-')&&!seasonProfile(cls.slice(5)))el.classList.remove(cls)}
export async function claimSeasonReward(db,uid){const e=activeSeason();if(!e)return false;let claimed=false;await runTransaction(db,async tx=>{claimed=false;const receipt=doc(db,'echo_season_rewards',uid,'events',e.key),wallet=doc(db,'echo_wallets',uid),r=await tx.get(receipt),w=await tx.get(wallet);if(r.exists()||!w.exists())return;tx.update(wallet,{balance:w.data().balance+100,seasonReward:e.key,updatedAt:serverTimestamp()});tx.set(receipt,{event:e.key,amount:100,at:serverTimestamp()});claimed=true});return claimed}
