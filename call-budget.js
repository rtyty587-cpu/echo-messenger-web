import {doc,getDocFromServer,runTransaction,serverTimestamp} from './firebase-firestore.js?v=1.15.4';

// Admission budget, deliberately conservative. This is NOT the provider's billable meter.
export const CALL_BUDGET={limit:2000000000,block:10000000,leaseMs:60000,maxCallMs:3600000};
export function createCallBudget(db,uid){
 let profile=null,expires=0,started=0,spent=0,closed=false;
 async function reserve(preferred,excluded=[]){
  const settings=await getDocFromServer(doc(db,'echo_call_settings','main'));
  const pools=settings.exists()?settings.data():null;
  if(pools?.enabled!==true||!Array.isArray(pools.profiles)||!pools.profiles.length||pools.profiles.length>20)throw Error('Звонки временно отключены: настройки лимитов недоступны.');
  const order=(preferred?[preferred]:pools.profiles).filter(name=>!excluded.includes(name));
  if(!order.length)throw Error("Доступные серверы уже проверены. Попробуйте позвонить позже.");
  for(const name of order){
   if(!pools.profiles.includes(name)||! /^(primary|reserve|relay[0-9]{2})$/.test(name))throw Error('Неизвестный сервер звонков.');
   const ref=doc(db,'echo_call_budgets','global'),access=doc(db,'echo_call_access',uid),now=new Date();
   const year=now.getUTCFullYear(),month=now.getUTCMonth()+1,nonce=crypto.randomUUID();
   const ok=await runTransaction(db,async tx=>{
    const snap=await tx.get(ref),data=snap.exists()?snap.data():null;
    const used=data?.year===year&&data?.month===month?data.used:0;
    if(!Number.isSafeInteger(used)||used<0)throw Error('Счётчик звонков повреждён. Звонки остановлены.');
    if(used+CALL_BUDGET.block>CALL_BUDGET.limit)return false;
    tx.set(ref,{year,month,used:used+CALL_BUDGET.block,lastUid:uid,profile:name,nonce,at:serverTimestamp()});
    tx.set(access,{profile:name,year,month,nonce,at:serverTimestamp()});return true;
   });
   if(ok){profile=name;expires=performance.now()+CALL_BUDGET.leaseMs;spent+=CALL_BUDGET.block;if(!started)started=performance.now();return name;}
  }
  throw Error('Общий лимит серверных звонков исчерпан до следующего месяца. Прямые звонки остаются доступны.');
 }
 return {
  async open(preferred,excluded=[]){
   await reserve(preferred,excluded);
   const snap=await getDocFromServer(doc(db,'echo_call_relays',profile));
   if(!snap.exists())throw Error('Сервер звонков ещё не настроен.');
   const d=snap.data();
   if(d.enabled!==true||typeof d.username!=='string'||typeof d.credential!=='string'||!Array.isArray(d.urls)||!d.urls.length||!d.urls.every(u=>/^turn:free\.expressturn\.com:3478\?transport=(udp|tcp)$/.test(u)))throw Error('Сервер звонков отключён или настроен неверно.');
   return {profile,config:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:d.urls,username:d.username,credential:d.credential}],iceTransportPolicy:'all',iceCandidatePoolSize:0}};
  },
  async renew(){if(closed)throw Error('Звонок завершён.');return reserve(profile);},
  check(bytes){
   if(closed||performance.now()>=expires)throw Error('Не удалось продлить разрешение на звонок. Соединение закрыто.');
   if(performance.now()-started>=CALL_BUDGET.maxCallMs)throw Error('Часовой сеанс завершён. Можно начать новый звонок, если остался лимит.');
   if(bytes*2>spent-500000)throw Error('Защитный лимит трафика звонка достигнут. Соединение закрыто.');
  },
  get expires(){return expires;},
  close(){closed=true;expires=0;}
 };
}
