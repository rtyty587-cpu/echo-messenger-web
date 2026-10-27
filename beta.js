import {doc,updateDoc} from './firebase-firestore.js?v=1.15.2';
import {sendEmailVerification,reload} from './firebase-auth.js?v=1.15.2';
const testers=['misha59381@yandex.ru','bobjudenko@gmail.com','ngolomaga@gmail.com'];
export function betaEligible(user){return testers.includes((user?.email||'').toLowerCase())}
export function createBeta({db,getMe,getProfile,toast}){
 const section=document.createElement('section');section.className='settingsSection';section.hidden=true;section.innerHTML='<h3>Бета-тестер ECHO</h3><p class="caption">Подтвердите указанную почту, чтобы получить компактную плашку «Бета».</p><button type="button" id="betaEmail" class="subtle">Подтвердить почту</button><button type="button" id="betaCheck" class="primary">Проверить и получить плашку</button>';
 document.querySelector('#settingsOverlay .settingsBody').append(section);
 async function claim(){const user=getMe();if(!user||!betaEligible(user)||!user.emailVerified||getProfile()?.betaTester)return false;await updateDoc(doc(db,'echo_users',user.uid),{betaTester:true,nameBadge:'beta'});return true}
 function refresh(){section.hidden=!betaEligible(getMe())||!!getProfile()?.betaTester}
 document.getElementById('openSettings').addEventListener('click',refresh);
 section.querySelector('#betaEmail').onclick=async()=>{try{const u=getMe();if(!betaEligible(u))return;await sendEmailVerification(u);toast('Письмо отправлено. Перейдите по ссылке и нажмите «Проверить».')}catch{toast('Не удалось отправить письмо. Попробуйте позже.')}};
 section.querySelector('#betaCheck').onclick=async()=>{const b=section.querySelector('#betaCheck');b.disabled=true;try{const u=getMe();await reload(u);await u.getIdToken(true);if(getMe()?.uid!==u.uid)return;if(!u.emailVerified)throw Error('Почта ещё не подтверждена.');await claim();refresh();toast('Плашка «Бета» доступна. Откройте настройки заново.')}catch(e){toast(e.code==='permission-denied'?'Нужно обновить правила Firebase.':e.message)}finally{b.disabled=false}};
 return{start:()=>{refresh();claim().catch(()=>{});},stop:()=>{section.hidden=true}};
}
