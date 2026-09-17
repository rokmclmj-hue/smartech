import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const base=path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)).replace(/^\//,'').replaceAll('/',path.sep); const out=path.join(base,'images'); await mkdir(out,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t=(x,y,s,z,c='#fff',w=600,a='middle')=>`<text x="${x}" y="${y}" fill="${c}" font-family="Arial,Malgun Gothic,sans-serif" font-size="${z}" font-weight="${w}" text-anchor="${a}">${esc(s)}</text>`;
const svg=(w,h,c)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g"><stop stop-color="#0f2e1a"/><stop offset="1" stop-color="#123a24"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${c}</svg>`;
const card=(ey,ttl,items,note='')=>svg(1200,700,t(50,54,ey,25,'#9fd5b5',600,'start')+t(50,112,ttl,40,'#fff',700,'start')+items.map((b,i)=>{let x=50+(i%2)*560,y=155+Math.floor(i/2)*235;return `<rect x="${x}" y="${y}" width="510" height="195" rx="18" fill="#173322" stroke="#3f6b4f"/>${t(x+255,y+60,b[0],29,'#8cded9',700)}${t(x+255,y+112,b[1],24,'#d4ead9',500)}${t(x+255,y+150,b[2]||'',24,'#d4ead9',500)}`}).join('')+(note?t(50,660,note,20,'#b9dec9',400,'start'):''));
const a={
'thumbnail.png':svg(1080,1080,t(540,300,'일반 진공이론·안전',52,'#a9dcbb',600)+t(540,470,'진공펌프 끌 때',92,'#fff',800)+t(540,590,'왜 질소를 쓸까?',92,'#fff',800)+t(540,760,'정지 시 벤트·퍼지 원리',50,'#bbe0cc',500)),
'사진1.png':card('SHUTDOWN STEP · 정지 전','무부하 운전으로 콘덴세이트부터 배출',[['가스 발라스트','정지 직전 열고','무부하로 운전'],['콘덴세이트','오일 속 응축수','배출 후 종료']],'이 절차를 거치면 부식 가능성이 크게 줄어듭니다.'),
'사진2.png':card('WHY IT MATTERS · 응축의 결과','응축이 도달진공 저하와 부식으로 이어짐',[['수증기 응축','재증발 필요','도달진공 회복 지연'],['콘덴세이트 축적','도달압력 상승','부식·펌프 고장']]),
'사진3.png':card('THREE PURPOSES · 세 가지 목적','같은 질소, 다른 이유',[['정비 전 퍼지','작업자 안전','잔류가스 제거'],['보관 중 벤트','표면 보호','수분 노출 차단'],['가동 중 실링가스','축 관통부','윤활유 희석 방지']]),
'사진4.png':card('REACTIVE PROCESS · 반응성 가스','가연성 증기 공정은 발라스트부터 질소로',[['가연성 증기','발라스트 가스','공기 대신 질소'],['정지 전 클린업','같은 원칙 적용','접촉 자체를 차단']])
};
for(const [n,m] of Object.entries(a)) await sharp(Buffer.from(m)).png().toFile(path.join(out,n));
console.log('done', Object.keys(a).join(', '));
