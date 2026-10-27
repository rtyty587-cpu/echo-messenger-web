export function createNavigation(){
 const $=id=>document.getElementById(id),settings=$('settingsOverlay'),body=settings.querySelector('.settingsBody');
 const nav=document.createElement('nav');nav.className='settingsTabs';nav.setAttribute('aria-label','Разделы настроек');body.before(nav);
 const pages={};for(const [id,label,nodes]of [
 ['profile','Профиль',[$('profileForm'),$('betaEmail')?.closest('section'),$('logout').parentElement]],
 ['appearance','Оформление',[$('fontChoice').closest('section')]],
 ['calls','Звонки',[$('testMic').closest('section')]],
 ['security','Защита',[$('encryptionStatus')?.closest('section')]]
 ]){const page=document.createElement('div');page.id='settingsPage-'+id;page.className='settingsPage';for(const node of nodes)if(node)page.append(node);body.append(page);pages[id]=page;const button=document.createElement('button');button.type='button';button.className='subtle';button.textContent=label;button.id='settingsTab-'+id;button.onclick=()=>selectSettings(id);nav.append(button)}
 function selectSettings(id){for(const [key,page]of Object.entries(pages)){page.hidden=key!==id;$('settingsTab-'+key).classList.toggle('active',key===id);$('settingsTab-'+key).setAttribute('aria-pressed',String(key===id))}body.scrollTop=0}
 $('openSettings').addEventListener('click',()=>selectSettings('profile'));selectSettings('profile');
 const launcher=document.createElement('button');launcher.id='openMyEcho';launcher.type='button';launcher.className='subtle myEchoShortcut';launcher.textContent='✦ Моё ECHO';document.querySelector('.callHistoryNav').append(launcher);
 const overlay=document.createElement('div');overlay.id='personalOverlay';overlay.className='overlay';overlay.hidden=true;overlay.innerHTML='<section class="settingsPanel personalPanel" role="dialog" aria-modal="true" aria-labelledby="personalTitle"><header><button id="personalBack" type="button" class="subtle" aria-label="Назад к разделам">←</button><div><div class="eyebrow">ВАШЕ ПРОСТРАНСТВО</div><h2 id="personalTitle">Моё ECHO</h2></div><button id="personalClose" type="button" class="subtle" aria-label="Закрыть Моё ECHO">×</button></header><div class="settingsBody"><div id="personalMenu" class="personalGrid"></div><div id="personalContent"></div></div></section>';document.body.append(overlay);
 const sections={},labels={},menu=$('personalMenu'),content=$('personalContent');let selected=null;
 for(const [id,title,hint,icon,node]of [
 ['Auras','Ауры','Выберите сияние аватара','◉',$('equippedFrame').closest('section')],
 ['Badges','Плашка рядом с ником','Одна отметка на ваш выбор','✧',$('nameBadgeChoice').closest('section')],
 ['Collection','Моя коллекция','NFT и предметы в профиле','◇',$('nftCornerChoice').closest('section')],
 ['Gifts','Подарить NFT','Выберите друга и подарок','↗',$('nftGiftFindForm').closest('section')],
 ['Premium','ECHO Premium','Подписка, срок и активация','✦',$('premiumKeyForm').closest('section')]
 ]){node.hidden=true;content.append(node);sections[id]=node;labels[id]=title;const button=document.createElement('button');button.type='button';button.id='openPersonal'+id;button.className='personalTile';const symbol=document.createElement('span'),heading=document.createElement('strong'),caption=document.createElement('span');symbol.className='personalSymbol';symbol.textContent=icon;heading.textContent=title;caption.className='caption';caption.textContent=hint;button.append(symbol,heading,caption);button.onclick=()=>openPage(id);menu.append(button)}
 const admin=$('openAdmin');admin.classList.add('personalTile');admin.innerHTML='<span class="personalSymbol">♛</span><strong>Админ-панель</strong><span class="caption">Выдача подарков и ключей</span>';menu.append(admin);admin.addEventListener('click',()=>{overlay.hidden=true});
 function close(){overlay.hidden=true;launcher.focus()}
 function display(id=null){selected=id;$('personalTitle').textContent=id?labels[id]:'Моё ECHO';menu.hidden=!!id;$('personalBack').hidden=!id;content.hidden=!id;for(const [key,node]of Object.entries(sections))node.hidden=key!==id;overlay.querySelector('.settingsBody').scrollTop=0}
 function openPage(id){$('openSettings').click();settings.hidden=true;if($('shopOverlay'))$('shopOverlay').hidden=true;overlay.hidden=false;display(id);$('personalBack').focus()}
 launcher.onclick=()=>{settings.hidden=true;overlay.hidden=false;display();$('personalClose').focus()};$('personalClose').onclick=close;$('personalBack').onclick=()=>{const id=selected;display();$('openPersonal'+id)?.focus()};
 $('settingsShop').addEventListener('click',()=>{overlay.hidden=true});
 document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(selected)$('personalBack').click();else close()}if(e.key==='Tab'){const items=[...overlay.querySelectorAll('button,input,select,textarea')].filter(n=>!n.disabled&&!n.closest('[hidden]')&&n.type!=='file');if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0]?.focus()}}},true);
 return{stop(){overlay.hidden=true;display();selectSettings('profile')},back(){if(overlay.hidden)return false;if(selected)$('personalBack').click();else close();return true}};
}
