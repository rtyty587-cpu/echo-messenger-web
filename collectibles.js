export const COLLECTIBLES=Object.freeze([
 {id:'nft_spark',name:'Искра',rarity:'Обычный',supply:50000,price:30,color:'#ff9b43',shape:'star'},
 {id:'nft_moon',name:'Лунный свет',rarity:'Обычный',supply:30000,price:40,color:'#9eb7ff',shape:'moon'},
 {id:'nft_leaf',name:'Мятный кристалл',rarity:'Обычный',supply:20000,price:50,color:'#61e8b3',shape:'gem'},
 {id:'nft_comet',name:'Комета',rarity:'Редкий',supply:2000,price:300,color:'#56cfff',shape:'star'},
 {id:'nft_rose',name:'Розовый кварц',rarity:'Редкий',supply:1000,price:500,color:'#ff83bb',shape:'gem'},
 {id:'nft_orbit',name:'Орбита',rarity:'Эпический',supply:200,price:2000,color:'#bf8dff',shape:'moon'},
 {id:'nft_flame',name:'Сердце сверхновой',rarity:'Эпический',supply:100,price:4000,color:'#ff666d',shape:'star'},
 {id:'nft_crown',name:'Корона космоса',rarity:'Мифический',supply:12,price:25000,color:'#ffda7c',shape:'crown'},
 {id:'nft_bear',name:'Мишка ECHO',rarity:'Легендарный',supply:3,price:1000000,color:'#f5c18c',shape:'bear'}
]);
export const GIVEAWAY_CHANNEL='EC0000000001';
export function collectible(id){return COLLECTIBLES.find(x=>x.id===id)}
export function nftArt(id){const item=collectible(id);if(!item)return '';const shapes={
 star:'<path d="m60 18 12 26 29 5-21 21 5 30-25-14-25 14 5-30-21-21 29-5Z"/>',
 moon:'<path d="M78 24a38 38 0 1 0 19 63A42 42 0 0 1 78 24Z"/><circle cx="90" cy="33" r="4" fill="white"/>',
 gem:'<path d="m22 43 17-20h42l17 20-38 57Z"/><path d="m22 43 38 57 19-57-10-20M22 43h76M51 23 41 43l19 57" fill="none" stroke="white" stroke-opacity=".5" stroke-width="2"/>',
 crown:'<path d="m23 34 19 17 18-27 18 27 19-17-10 50H33Z"/><path d="M35 94h50" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>',
 bear:'<circle cx="34" cy="32" r="17"/><circle cx="86" cy="32" r="17"/><rect x="23" y="24" width="74" height="74" rx="32"/><ellipse cx="60" cy="76" rx="22" ry="17" fill="#ffe6cc"/><circle cx="43" cy="57" r="5" fill="#422b25"/><circle cx="77" cy="57" r="5" fill="#422b25"/><path d="m53 71 7 8 7-8Z" fill="#422b25"/><path d="M60 79v6" stroke="#422b25" stroke-width="3"/>'};
 return '<svg viewBox="0 0 120 120" aria-hidden="true" color="'+item.color+'" fill="currentColor"><circle cx="60" cy="60" r="54" fill="currentColor" opacity=".08"/>'+shapes[item.shape]+'<circle cx="29" cy="19" r="3" fill="white" opacity=".8"/></svg>';
}
export function decorateAvatar(el,data){const item=collectible(data.nftCorner);if(!item)return;el.classList.add('hasCollectible');const badge=document.createElement('span');badge.className='nftCorner';badge.title=item.name;badge.setAttribute('aria-label',item.name);badge.innerHTML=nftArt(item.id);el.append(badge)}
export function profileDetails(el,data){el.replaceChildren();if(data.bio){const p=document.createElement('p');p.textContent=data.bio;el.append(p)}const item=collectible(data.nftBio);if(item){const p=document.createElement('div');p.className='profileCollectible';const art=document.createElement('span');art.innerHTML=nftArt(item.id);p.append(art,document.createTextNode(item.name+' · '+item.rarity));el.append(p)}}
