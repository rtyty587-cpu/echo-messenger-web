export const COLLECTIBLES=Object.freeze([
 {id:'nft_spark',name:'Искра',rarity:'Обычный',supply:50000,price:30,color:'#ff9b43',shape:'star'},
 {id:'nft_moon',name:'Лунный свет',rarity:'Обычный',supply:30000,price:40,color:'#9eb7ff',shape:'moon'},
 {id:'nft_leaf',name:'Мятный кристалл',rarity:'Обычный',supply:20000,price:50,color:'#61e8b3',shape:'gem'},
 {id:'nft_comet',name:'Комета',rarity:'Редкий',supply:2000,price:300,color:'#56cfff',shape:'star'},
 {id:'nft_rose',name:'Розовый кварц',rarity:'Редкий',supply:1000,price:500,color:'#ff83bb',shape:'gem'},
 {id:'nft_orbit',name:'Орбита',rarity:'Эпический',supply:200,price:2000,color:'#bf8dff',shape:'moon'},
 {id:'nft_flame',name:'Сердце сверхновой',rarity:'Эпический',supply:100,price:4000,color:'#ff666d',shape:'star'},
 {id:'nft_crown',name:'Корона космоса',rarity:'Мифический',supply:12,price:25000,color:'#ffda7c',shape:'crown'},
 {id:'nft_lantern',name:'Фонарь полуночи',rarity:'Эпический · Хэллоуин',supply:350,price:6000,color:'#ff913c',shape:'pumpkin',season:'halloween'},
 {id:'nft_snowglobe',name:'Снежная вселенная',rarity:'Эпический · Новый год',supply:500,price:5500,color:'#82eaff',shape:'snowglobe',season:'newyear'},
 {id:'nft_sunwheel',name:'Солнечный оберег',rarity:'Эпический · Масленица',supply:450,price:5000,color:'#ffc760',shape:'sunwheel',season:'maslenitsa'},
 {id:'nft_bear',name:'Мишка ECHO',rarity:'Легендарный',supply:3,price:1000000,color:'#f5c18c',shape:'bear'}
]);
export const GIVEAWAY_CHANNEL='EC0000000001';
export function collectible(id){return COLLECTIBLES.find(x=>x.id===id)}
export function nftArt(id){const item=collectible(id);if(!item)return '';const shapes={
 pumpkin:'<path d="M57 33q-8-18 12-20l-3 19" fill="#86c989"/><ellipse cx="60" cy="66" rx="43" ry="34"/><ellipse cx="60" cy="66" rx="20" ry="34" fill="#fff" opacity=".14"/><path d="m30 57 18-7-3 15Zm60 0-18-7 3 15ZM35 76l12 6 13-4 13 4 12-6-8 15H43Z" fill="#22142d"/>',
 snowglobe:'<circle cx="60" cy="51" r="37" fill="#caf5ff" opacity=".25"/><circle cx="60" cy="51" r="35" fill="none" stroke="currentColor" stroke-width="3"/><path d="m60 25-19 27h10L37 69h46L69 52h10Z"/><path d="M34 88h52l6 16H28Z" fill="#c4a2ff"/><g fill="white"><circle cx="35" cy="43" r="3"/><circle cx="81" cy="58" r="3"/><circle cx="78" cy="33" r="2"/><path d="m60 16 2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z"/></g>',
 sunwheel:'<path d="m60 8 7 20 17-13-4 22 23-2-14 18 20 9-21 8 12 19-22-4 1 23-17-15-11 20-7-22-20 11 6-22-23-1 17-16-19-12 23-5-9-21 21 8Z"/><circle cx="60" cy="60" r="28" fill="#a83e21"/><circle cx="60" cy="60" r="22" fill="#ffe6a4"/><path d="M48 57q4-5 8 0m9 0q4-5 8 0M49 68q11 12 22 0" fill="none" stroke="#a83e21" stroke-width="3" stroke-linecap="round"/>',
 star:'<path d="m60 18 12 26 29 5-21 21 5 30-25-14-25 14 5-30-21-21 29-5Z"/>',
 moon:'<path d="M78 24a38 38 0 1 0 19 63A42 42 0 0 1 78 24Z"/><circle cx="90" cy="33" r="4" fill="white"/>',
 gem:'<path d="m22 43 17-20h42l17 20-38 57Z"/><path d="m22 43 38 57 19-57-10-20M22 43h76M51 23 41 43l19 57" fill="none" stroke="white" stroke-opacity=".5" stroke-width="2"/>',
 crown:'<path d="m23 34 19 17 18-27 18 27 19-17-10 50H33Z"/><path d="M35 94h50" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>',
 bear:'<circle cx="34" cy="32" r="17"/><circle cx="86" cy="32" r="17"/><rect x="23" y="24" width="74" height="74" rx="32"/><ellipse cx="60" cy="76" rx="22" ry="17" fill="#ffe6cc"/><circle cx="43" cy="57" r="5" fill="#422b25"/><circle cx="77" cy="57" r="5" fill="#422b25"/><path d="m53 71 7 8 7-8Z" fill="#422b25"/><path d="M60 79v6" stroke="#422b25" stroke-width="3"/>'};
 return '<svg viewBox="0 0 120 120" aria-hidden="true" color="'+item.color+'" fill="currentColor"><circle cx="60" cy="60" r="54" fill="currentColor" opacity=".08"/>'+shapes[item.shape]+'<circle cx="29" cy="19" r="3" fill="white" opacity=".8"/></svg>';
}
export function decorateAvatar(el,data){const item=collectible(data.nftCorner);if(!item)return;el.classList.add('hasCollectible');const badge=document.createElement('span');badge.className='nftCorner';badge.title=item.name;badge.setAttribute('aria-label',item.name);badge.innerHTML=nftArt(item.id);el.append(badge)}
export function profileDetails(el,data){el.replaceChildren();if(data.bio){const p=document.createElement('p');p.textContent=data.bio;el.append(p)}const item=collectible(data.nftBio);if(item){const p=document.createElement('div');p.className='profileCollectible';const art=document.createElement('span');art.innerHTML=nftArt(item.id);p.append(art,document.createTextNode(item.name+' · '+item.rarity));el.append(p)}}
