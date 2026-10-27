import {doc,getDoc,setDoc,serverTimestamp} from './firebase-firestore.js?v=1.15.1';
import {EmailAuthProvider,reauthenticateWithCredential,updatePassword} from './firebase-auth.js?v=1.15.1';
import {echoExportBackup,echoImportBackup,echoCanonical} from './crypto-core.js?v=1.15.1';

// Domain separation preserves support for existing six-character account passwords.
const phrase=password=>'ECHO-account-v1|'+password;
export function createAccountVault({db,getMe,getStored,section,toast}){
 const form=document.createElement('form');form.className='accountPasswordForm';
 form.innerHTML='<h3>Пароль аккаунта</h3><label>Текущий пароль<input name="current" type="password" autocomplete="current-password" required></label><label>Новый пароль<input name="next" type="password" autocomplete="new-password" minlength="12" required></label><label>Подтвердите новый пароль<input name="confirm" type="password" autocomplete="new-password" minlength="12" required></label><button class="primary">Изменить пароль аккаунта</button><p class="caption">Переписки открываются автоматически после входа. Старые сообщения сохранятся.</p>';
 section.prepend(form);
 const save=(uid,payload,previousPayload='')=>setDoc(doc(db,'echo_account_vault',uid),{v:1,payload,previousPayload,updatedAt:serverTimestamp()});
 async function open(uid,box,password){for(const payload of [box.payload,box.previousPayload].filter(Boolean)){try{return await echoImportBackup(uid,payload,phrase(password));}catch{}}throw Error('Не удалось открыть переписки этим паролем. Используйте устройство, где история уже доступна.');}
 form.onsubmit=async e=>{e.preventDefault();const user=getMe(),data=getStored(),current=form.elements.current.value,next=form.elements.next.value,confirm=form.elements.confirm.value;form.reset();if(!user||!data){toast('Сначала откройте переписки на этом устройстве.');return;}if(next!==confirm){toast('Новые пароли не совпадают.');return;}if(next.length<12){toast('Новый пароль — не менее 12 символов.');return;}const button=form.querySelector('button');button.disabled=true;try{await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,current));const oldPayload=await echoExportBackup(user.uid,data,phrase(current)),payload=await echoExportBackup(user.uid,data,phrase(next));if(getMe()?.uid!==user.uid)return;
 // Stage both wrappers before changing Auth. Either password can recover after a network interruption.
 await save(user.uid,payload,oldPayload);await updatePassword(user,next);
 try{await save(user.uid,payload);}catch{/* The next successful login cleans up the previous wrapper. */}
 toast('Пароль аккаунта изменён. Переписки сохранены.');
 }catch(e){toast(e.code==='auth/invalid-credential'?'Текущий пароль не подошёл.':e.code==='auth/too-many-requests'?'Слишком много попыток. Попробуйте позже.':'Не удалось завершить смену пароля. Проверьте соединение и повторите вход.');}finally{button.disabled=false;}};
 return {async box(uid,data,password){return {v:1,payload:await echoExportBackup(uid,data,phrase(password)),previousPayload:'',updatedAt:serverTimestamp()};},async load(uid,data,password){if(!password)return data;const snap=await getDoc(doc(db,'echo_account_vault',uid));if(snap.exists()){const recovered=await open(uid,snap.data(),password);if(data&&echoCanonical(data.public)!==echoCanonical(recovered.public)){const all=[...(recovered.legacy||[]),{v:data.v,enc:data.enc,sign:data.sign,public:data.public},...(data.legacy||[])];recovered.legacy=all.filter((k,i)=>all.findIndex(x=>echoCanonical(x.public)===echoCanonical(k.public))===i);if(recovered.legacy.length>8)throw Error('Слишком много прежних устройств. Старые данные сохранены.');}data=recovered;}if(data)await save(uid,await echoExportBackup(uid,data,phrase(password)));return data;},async enroll(uid,data,password){if(password)await save(uid,await echoExportBackup(uid,data,phrase(password)));},stop(){form.reset();}};
}
