// Dedicated ECHO account: linktest1010@gmail.com.
// Previous deployments belonged to the owner's personal account and must not be used.
// Set the new /exec URL only after Google authorization and deployment are confirmed.
export const FILE_STORAGE_SERVERS=Object.freeze([]);
export const FILE_STORAGE_URL='';
export async function storageForOwner(uid){
 if(typeof uid!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw Error('Некорректный владелец файла.');
 if(!FILE_STORAGE_URL)throw Error('Сервер ECHO ожидает подтверждения Google и публикации.');
 return {id:'echo-storage-1',url:FILE_STORAGE_URL};
}
