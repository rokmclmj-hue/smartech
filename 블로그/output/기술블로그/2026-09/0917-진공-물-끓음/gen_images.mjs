import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const base=path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)).replace(/^\//,'').replaceAll('/',path.sep); const out=path.join(base,'images'); await mkdir(out,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t=(x,y,s,z,c='#fff',w=600,a='middle')=>`<text x="${x}" y="${y}" fill="${c}" font-family="Arial,Malgun Gothic,sans-serif" font-size="${z}" font-weight="${w}" text-anchor="${a}">${esc(s)}</text>`;
const svg=(w,h,c)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g"><stop stop-color="#1a1a2e"/><stop offset="1" stop-color="#16213e"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${c}</svg>`;
const card=(ey,ttl,items,note='')=>svg(1200,700,t(50,54,ey,25,'#9fb5d5',600,'start')+t(50,112,ttl,44,'#fff',700,'start')+items.map((b,i)=>{let x=50+(i%2)*560,y=155+Math.floor(i/2)*235;return `<rect x="${x}" y="${y}" width="510" height="195" rx="18" fill="#202e48" stroke="#4b5a77"/>${t(x+255,y+60,b[0],31,'#8cded9',700)}${t(x+255,y+112,b[1],26,'#d4deed',500)}${t(x+255,y+150,b[2]||'',26,'#d4deed',500)}`}).join('')+(note?t(50,660,note,22,'#b9c7de',400,'start'):''));
const a={'thumbnail.png':svg(1080,1080,t(540,300,'일반 진공이론',58,'#a9bbdc',600)+t(540,485,'진공에서 물은',100,'#fff',800)+t(540,625,'왜 끓을까?',100,'#fff',800)+t(540,795,'증기압과 압력의 관계',56,'#bbc9de',500)),
'사진1.png':card('BOILING CONDITION · 끓음 조건','증기압이 주변 압력과 같아지는 순간',[['물의 증기압','온도가 올라가면','일반적으로 증가'],['주변 압력','진공으로 낮아지면','끓음 조건도 낮아짐']],'주변 압력을 낮추면 같은 증기압에 더 낮은 온도에서 도달할 수 있습니다.'),
'사진2.png':card('PHASE CHANGE · 현상 구분','증발·끓음·승화는 출발 상태가 다릅니다',[['증발','액체 표면 → 기체','실온에서도 가능'],['끓음','액체 내부 → 기포·기체','기포가 성장'],['승화','얼음 → 기체','액체를 거치지 않음'],['공정 질문','상태 → 압력·온도','측정 위치 확인']]),
'사진3.png':card('EVAPORATION COOLING · 증발 냉각','수증기 발생과 열공급이 함께 작용합니다',[['액체','상변화 에너지 필요','온도가 내려갈 수 있음'],['수증기','펌프가 배기','압력 조건 유지'],['응축','트랩·응축기','수증기 처리'],['공정','열공급과 부하','함께 확인']]),
'사진4.png':card('PROCESS CHECK · 공정 확인','압력·온도·수분 상태를 함께 기록하세요',[['01 수분 상태','액체인가, 얼음인가?','공정 현상 구분'],['02 측정 위치','챔버와 제품 위치','같은가?'],['03 수증기 처리','트랩·응축기 경로','적절한가?'],['04 펌프 조건','수증기량과 허용 조건','확인했는가?']])};
for(const [n,m] of Object.entries(a)) await sharp(Buffer.from(m)).png().toFile(path.join(out,n));
