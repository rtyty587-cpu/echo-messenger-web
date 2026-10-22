import {doc,onSnapshot} from './firebase-firestore.js?v=1.10.2';
const PREMIUM_ADMIN='1tt6F3wcz2cWcEKpWSGEPJuO5nb2';
let premiumDb=null,premiumGeneration=0;const premiumStates=new Map(),premiumListeners=new Set(),premiumViewOwners=new WeakMap();
export function premiumEnds(data){return (data?.startedAt?.toMillis?.()??data?.startedAt?.toDate?.().getTime()??0)+(data?.days||0)*86400000}
export function premiumActive(uid){if(uid===PREMIUM_ADMIN)return true;const s=premiumStates.get(uid);return !!s?.data&&premiumEnds(s.data)>Date.now()&&(s.data.source==='coin'||(s.key?.revoked===false&&s.key.usedBy===uid))}
export function premiumData(uid){return premiumStates.get(uid)?.data||null}
export function onPremiumChange(fn){premiumListeners.add(fn);return()=>premiumListeners.delete(fn)}
function premiumNotify(uid){const s=premiumStates.get(uid);if(!s)return;clearTimeout(s.timer);const remaining=premiumEnds(s.data)-Date.now();if(remaining>0)s.timer=setTimeout(()=>premiumNotify(uid),Math.min(remaining+20,2147483647));for(const [el,fn] of s.views){if(el.isConnected&&premiumViewOwners.get(el)===uid)fn();else s.views.delete(el)}for(const fn of premiumListeners)fn(uid)}
export function watchPremium(uid,el,render){if(!uid||!premiumDb)return;let s=premiumStates.get(uid);if(!s){s={data:null,key:null,views:new Map(),stop:null,keyStop:null,timer:null};premiumStates.set(uid,s);const gen=premiumGeneration;s.stop=onSnapshot(doc(premiumDb,'echo_premium',uid),snap=>{if(gen!==premiumGeneration)return;s.data=snap.data()||null;s.keyStop?.();s.keyStop=null;s.key=null;if(s.data?.source==='key'&&s.data.key){s.keyStop=onSnapshot(doc(premiumDb,'echo_premium_keys',s.data.key),k=>{if(gen!==premiumGeneration)return;s.key=k.data()||null;premiumNotify(uid)},()=>{s.key=null;premiumNotify(uid)})}premiumNotify(uid)},()=>{s.data=null;premiumNotify(uid)})}if(el&&render){premiumViewOwners.set(el,uid);s.views.set(el,render)}}
export function configurePremium(db){resetPremium();premiumDb=db}
export function resetPremium(){premiumGeneration++;for(const s of premiumStates.values()){s.stop?.();s.keyStop?.();clearTimeout(s.timer)}premiumStates.clear();premiumDb=null}
