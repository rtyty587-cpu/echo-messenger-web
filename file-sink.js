import {echoB64} from './crypto-core.js?v=1.15.0';
export async function openFileSink(name,size){
 if(window.EchoStream||window.chrome?.webview){
  const id=crypto.randomUUID();let waiting=null,closed=false,index=0;
  const receive=data=>{if(data?.id!==id||!waiting)return;const w=waiting;if(data.type==='error'){waiting=null;clearTimeout(w.timer);w.reject(Error(data.error==='cancelled'?'Сохранение отменено.':'Не удалось записать файл.'));return}if(data.type!==w.type)return;waiting=null;clearTimeout(w.timer);w.resolve()};
  const android=e=>receive(e.detail),windows=e=>receive(e.data);window.addEventListener('echo-file-save',android);window.chrome?.webview?.addEventListener('message',windows);
  const detach=()=>{window.removeEventListener('echo-file-save',android);window.chrome?.webview?.removeEventListener('message',windows)};
  function request(command,args,type){return new Promise((resolve,reject)=>{if(closed||waiting){reject(Error('Сохранение недоступно.'));return}const timer=setTimeout(()=>{waiting=null;reject(Error('Приложение не подтвердило сохранение файла.'))},command==='begin'?180000:30000);waiting={resolve,reject,timer,type};try{if(window.EchoStream)window.EchoStream[command](id,...args);else window.chrome.webview.postMessage(['stream',command,id,...args].join('|'))}catch(e){waiting=null;clearTimeout(timer);reject(e)}})}
  const cancel=()=>{try{if(window.EchoStream)window.EchoStream.cancel(id);else window.chrome.webview.postMessage('stream|cancel|'+id)}catch{}};
  try{await request('begin',[encodeURIComponent(name),String(size)],'ready')}catch(e){cancel();closed=true;detach();throw e}

  return{write:async bytes=>{await request('write',[String(index++),echoB64(bytes)],'write')},close:async()=>{try{await request('finish',[],'done')}catch(e){cancel();throw e}finally{closed=true;detach()}},abort:async()=>{cancel();closed=true;detach()}};
 }
 if(window.showSaveFilePicker){const handle=await window.showSaveFilePicker({suggestedName:name}),writer=await handle.createWritable();return{write:bytes=>writer.write(bytes),close:()=>writer.close(),abort:()=>writer.abort()}}
 throw Error('Сохранение больших файлов требует обновлённого приложения ECHO или Chrome/Edge на компьютере.');
}
