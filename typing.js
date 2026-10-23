import {doc,collection,onSnapshot,setDoc,serverTimestamp} from './firebase-firestore.js?v=1.13.0';

// Presence contains no draft text. Expiry also handles a closed or disconnected sender.
export function createTyping({db,getMe,now=()=>Date.now(),idleMs=12000,gameAfterMs=20000}){
 let current=null;
 const panel=document.createElement('aside');panel.id='waitingGame';panel.className='waitingGame';panel.hidden=true;
 panel.setAttribute('aria-label','Змейка в ожидании ответа');
 panel.innerHTML='<button type="button" class="snakeClose subtle" aria-label="Закрыть змейку">×</button><span class="eyebrow">ПОКА ЖДЁТЕ ОТВЕТ</span><strong>Партия в змейку?</strong><p class="muted">Новое сообщение — и мы вернём вас в разговор.</p><button type="button" class="primary snakeStart">Начать игру</button><div class="snakePlay" hidden><output class="snakeScore" aria-live="polite"></output><svg class="snakeBoard" viewBox="0 0 16 16" role="img" aria-label="Игровое поле змейки"></svg><div class="snakeControls"><button type="button" data-dir="up" aria-label="Вверх">↑</button><button type="button" data-dir="left" aria-label="Влево">←</button><button type="button" data-dir="down" aria-label="Вниз">↓</button><button type="button" data-dir="right" aria-label="Вправо">→</button></div></div>';
 document.body.append(panel);panel.tabIndex=-1;
 const startButton=panel.querySelector('.snakeStart'),play=panel.querySelector('.snakePlay'),board=panel.querySelector('.snakeBoard'),score=panel.querySelector('.snakeScore');
 let snake=[],food,dir,nextDir,gameTimer,points=0,playing=false,turned=false;
 const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 function hideGame(){clearInterval(gameTimer);gameTimer=null;playing=false;const focused=panel.contains(document.activeElement);panel.hidden=true;play.hidden=true;startButton.hidden=false;if(focused)current?.input.focus()}
 function dismiss(){if(current)current.dismissed=true;hideGame()}
 panel.querySelector('.snakeClose').onclick=dismiss;
 function placeFood(){const free=[];for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(!snake.some(p=>p[0]===x&&p[1]===y))free.push([x,y]);food=free[Math.floor(Math.random()*free.length)];return !!food}
 function draw(){board.innerHTML=snake.map((p,i)=>`<rect x="${p[0]+.08}" y="${p[1]+.08}" width=".84" height=".84" rx=".2" fill="${i?'#ff8c24':'#ffe0a3'}"/>`).join('')+(food?`<circle cx="${food[0]+.5}" cy="${food[1]+.5}" r=".32" fill="#72efbd"/>`:'');score.textContent='Счёт: '+points}
 function finish(won=false){clearInterval(gameTimer);playing=false;score.textContent=(won?'Победа! ':'Игра окончена. ')+'Счёт: '+points;startButton.hidden=false;startButton.textContent='Ещё раз'}
 function turn(value){if(!playing||turned)return;const d=directions[value];if(d&&(d[0]!==-dir[0]||d[1]!==-dir[1])){nextDir=d;turned=true}}
 for(const b of panel.querySelectorAll('[data-dir]'))b.onclick=()=>turn(b.dataset.dir);
 panel.addEventListener('keydown',e=>{const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};if(e.key==='Escape'){e.preventDefault();dismiss()}else if(keys[e.key]){e.preventDefault();turn(keys[e.key])}});
 startButton.onclick=()=>{clearInterval(gameTimer);snake=[[7,8],[6,8],[5,8]];dir=[1,0];nextDir=dir;turned=false;points=0;playing=true;placeFood();draw();play.hidden=false;startButton.hidden=true;panel.focus();gameTimer=setInterval(()=>{if(document.hidden)return;dir=nextDir;turned=false;const p=[snake[0][0]+dir[0],snake[0][1]+dir[1]],eating=p[0]===food[0]&&p[1]===food[1];if(p.some(v=>v<0||v>=16)||snake.slice(0,eating?snake.length:-1).some(v=>v[0]===p[0]&&v[1]===p[1])){finish();return}snake.unshift(p);if(eating){points++;if(!placeFood()){draw();finish(true);return}}else snake.pop();draw()},150)};
 function write(s,typing){if(!navigator.onLine||getMe()?.uid!==s.uid)return;const ref=doc(db,...s.path.split('/'),'typing',s.uid);s.sent=typing;s.lastWrite=now();setDoc(ref,{typing,updatedAt:serverTimestamp()}).catch(()=>{if(current===s){s.sent=false;s.disabled=true}})}
 function quiet(s){clearTimeout(s.idleTimer);if(s.sent)write(s,false)}
 function render(s){if(current!==s)return;const time=now();for(const [uid,p] of s.peers)if(time-p.updated>idleMs||time-p.updated< -idleMs)s.peers.delete(uid);
  s.row.hidden=!s.peers.size;
  s.label.textContent=s.peers.size>1?'Участники печатают…':s.path.startsWith('echo_channels/')?'Автор печатает…':'Собеседник печатает…';
  s.box.append(s.row);
  if(!s.peers.size){s.waitSince=null;s.dismissed=false;hideGame();return}
  if(s.waitSince===null)s.waitSince=time;
  if(!s.dismissed&&time-s.waitSince>=gameAfterMs&&!document.hidden&&panel.hidden){panel.hidden=false;startButton.textContent='Начать игру'}
 }
 function stop(path){const s=current;if(!s||(path&&s.path!==path))return;quiet(s);s.unsubscribe?.();clearInterval(s.timer);s.input.removeEventListener('input',s.onInput);s.row.remove();hideGame();current=null}
 function open(path,box,input,canWrite=()=>true){stop();const uid=getMe()?.uid;if(!uid)return;
  const row=document.createElement('div');row.className='typingRow';row.hidden=true;row.setAttribute('role','status');const dots=document.createElement('span');dots.className='typingDots';dots.setAttribute('aria-hidden','true');dots.innerHTML='<i></i><i></i><i></i>';const label=document.createElement('span');row.append(dots,label);
  const s={path,box,input,uid,row,label,peers:new Map(),seen:null,waitSince:null,dismissed:false,sent:false,lastWrite:-Infinity,disabled:false};current=s;
  s.onInput=()=>{if(current!==s||s.disabled)return;if(!input.value.trim()||!canWrite()||document.hidden){quiet(s);return}if(!s.sent||now()-s.lastWrite>=4000)write(s,true);clearTimeout(s.idleTimer);s.idleTimer=setTimeout(()=>quiet(s),idleMs)};
  input.addEventListener('input',s.onInput);
  s.unsubscribe=onSnapshot(collection(db,...path.split('/'),'typing'),snap=>{if(current!==s)return;const peers=new Map();for(const d of snap.docs){const p=d.data(),updated=p.updatedAt?.toMillis?.();if(d.id!==uid&&p.typing&&Number.isFinite(updated)&&now()-updated<=idleMs&&now()-updated>=-idleMs)peers.set(d.id,{updated})}s.peers=peers;render(s)},()=>{if(current===s){s.peers.clear();render(s);s.disabled=true}});
  s.timer=setInterval(()=>render(s),1000);render(s);
 }
 function messages(path,docs){const s=current;if(!s||s.path!==path)return;const incoming=new Set(docs.filter(d=>d.data().sender!==s.uid).map(d=>d.id));if(s.seen&&[...incoming].some(id=>!s.seen.has(id))){s.dismissed=true;hideGame()}s.seen=incoming;render(s)}
 function sent(path){if(current?.path===path)quiet(current)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&current)quiet(current)});
 return{open,stop,messages,sent};
}
