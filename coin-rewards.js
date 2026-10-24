import {doc,getDoc,onSnapshot} from './firebase-firestore.js?v=1.14.0';
export function createCoinRewards({db,getMe}){
 const box=document.createElement('div');box.id='coinRewardOverlay';box.className='overlay coinRewardOverlay';box.hidden=true;box.innerHTML='<section class="settingsPanel coinRewardPanel" role="dialog" aria-modal="true" aria-labelledby="coinRewardTitle"><div class="coinRewardIcon" aria-hidden="true">E</div><div class="eyebrow">ECHO COIN</div><h2 id="coinRewardTitle">Монеты получены!</h2><p id="coinRewardAmount"></p><p id="coinRewardReason"></p><button id="coinRewardOkay" class="primary" type="button">Окей</button></section>';document.body.append(box);
 const $=id=>document.getElementById(id);let stopWatch=null,epoch=0,previous=null,queue=[],returnFocus=null;
 function show(){if(!queue.length){box.hidden=true;returnFocus?.isConnected&&returnFocus.focus();returnFocus=null;return}if(box.hidden)returnFocus=document.activeElement;const r=queue[0];$('coinRewardAmount').textContent='+'+r.amount.toLocaleString('ru-RU')+' EC';$('coinRewardReason').textContent=r.reason;box.hidden=false;$('coinRewardOkay').focus()}
 function acknowledge(){queue.shift();show()}
 $('coinRewardOkay').onclick=acknowledge;
 box.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();$('coinRewardOkay').focus()}if(e.key==='Escape'){e.preventDefault();e.stopPropagation();acknowledge()}});
 function stop(){epoch++;stopWatch?.();stopWatch=null;previous=null;queue=[];box.hidden=true;returnFocus=null}
 async function start(){stop();const uid=getMe()?.uid,run=epoch;if(!uid)return;const key='echo-coin-balance:'+uid;let saved=null;try{const n=JSON.parse(localStorage.getItem(key)||'null');if(Number.isSafeInteger(n)&&n>=0)saved=n}catch{}
 function accept(snap,initial=false){if(run!==epoch||getMe()?.uid!==uid||snap.metadata?.hasPendingWrites||snap.metadata?.fromCache)return;const w=snap.exists()?snap.data():null;if(!w){previous={balance:0};return}const before=previous?.balance??saved??w.balance,amount=w.balance-before;if(amount>0){let reason=initial?'Баланс вырос, пока вас не было.': 'Пополнение баланса';if(previous){if(w.seasonReward&&w.seasonReward!==previous.seasonReward)reason='Подарок к празднику';else if(w.rewardId&&w.rewardId!==previous.rewardId)reason='Ваш приз в розыгрыше';else if(previous.lastGrantMillis&&w.lastGrant?.toMillis?.()>previous.lastGrantMillis)reason='Еженедельная награда';else reason='Подарок от администратора'}queue.push({amount,reason});show()}previous={...w,lastGrantMillis:w.lastGrant?.toMillis?.()};saved=w.balance;try{localStorage.setItem(key,JSON.stringify(w.balance))}catch{}}
 try{const snap=await getDoc(doc(db,'echo_wallets',uid));if(run!==epoch)return;accept(snap,true);stopWatch=onSnapshot(doc(db,'echo_wallets',uid),{includeMetadataChanges:true},s=>accept(s),()=>{})}catch{}
 }
 return{start,stop,back:()=>{if(box.hidden)return false;acknowledge();return true}};
}

