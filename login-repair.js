import {EmailAuthProvider,reauthenticateWithCredential} from './firebase-auth.js?v=1.15.1';

export function createLoginRepair({getMe,lockSession}){
 const panel=document.createElement('div');panel.id='loginRepair';panel.className='overlay';panel.hidden=true;
 panel.innerHTML='<section class="settingsPanel" role="dialog" aria-modal="true" aria-labelledby="repairTitle"><header><h2 id="repairTitle">Откроем ваши переписки</h2></header><div class="settingsBody"><p id="repairHint"></p><form id="repairForm"><label>Пароль аккаунта<input type="password" autocomplete="current-password" required></label><button class="primary">Продолжить</button></form><p id="repairError" role="alert"></p><button id="repairFresh" class="primary" type="button" hidden>Начать новые переписки</button><button id="repairLater" class="subtle" type="button">Открыть ECHO без восстановления</button><button id="repairExit" class="subtle" type="button">Выйти из аккаунта</button></div></section>';document.body.append(panel);
 const $=id=>panel.querySelector('#'+id);let task=null,epoch=0;
 function hide(){panel.hidden=true;document.body.classList.remove('loginRepairLocked');$('repairForm').reset();$('repairError').textContent='';}
 function settle(value){const t=task;task=null;hide();t?.resolve(value);}
 function show(mode){if(task)throw Error('Подтверждение уже открыто.');panel.hidden=false;document.body.classList.add('loginRepairLocked');$('repairForm').hidden=mode!=='password';$('repairFresh').hidden=mode!=='fresh';$('repairHint').textContent=mode==='password'?'Вход в аккаунт сохранился. Введите его обычный пароль, чтобы открыть историю на этом устройстве.':'Для этого аккаунта ещё не сохранён автоматический перенос истории. Можно войти на устройстве, где сообщения читаются, или начать новые переписки здесь. Прежние сообщения не удалятся, но без прежнего устройства их расшифровать не получится. Собеседникам понадобится ECHO 1.15.1.';if(mode==='password')$('repairForm').querySelector('input').focus();return new Promise((resolve,reject)=>{task={resolve,reject,epoch,uid:getMe()?.uid};});}
 $('repairForm').onsubmit=async e=>{e.preventDefault();const t=task,user=getMe(),password=$('repairForm').querySelector('input').value;$('repairForm').reset();const button=$('repairForm').querySelector('button');button.disabled=true;try{if(!user||!t||user.uid!==t.uid)throw Error();await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,password));if(task===t&&epoch===t.epoch&&getMe()?.uid===t.uid)settle(password);}catch{if(task===t)$('repairError').textContent='Не удалось подтвердить пароль. Проверьте его и подключение.';}finally{button.disabled=false;}};
 $('repairFresh').onclick=()=>settle(true);
 $('repairLater').onclick=()=>settle(null);
 $('repairExit').onclick=()=>lockSession();
 return {password:()=>show('password'),fresh:()=>show('fresh'),stop(){epoch++;const t=task;task=null;hide();t?.reject(Error('Вход отменён.'));}};
}
