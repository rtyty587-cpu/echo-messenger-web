export const FILE_STORAGE_SERVERS=Object.freeze([]);
export const FILE_STORAGE_URL='';
export async function storageForOwner(uid){
 if(typeof uid!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw Error('Некорректный владелец файла.');
 if(!FILE_STORAGE_URL)throw Error('Внешнее хранилище отключено.');
 return {id:'echo-storage-1',url:FILE_STORAGE_URL};
}
