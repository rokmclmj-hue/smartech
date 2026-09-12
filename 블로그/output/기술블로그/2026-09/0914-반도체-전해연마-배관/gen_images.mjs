import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const base = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)).replace(/^\//, '').replaceAll('/', path.sep);
const out = path.join(base, 'images'); await mkdir(out, { recursive: true });
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const svg = (w,h,content,bg=true) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1a1a2e"/><stop offset="1" stop-color="#16213e"/></linearGradient></defs><rect width="100%" height="100%" fill="${bg?'url(#g)':'#202e48'}"/>${content}</svg>`;
const text=(x,y,s,size,color='#fff',weight=600,anchor='middle')=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,Malgun Gothic,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
const card = (title, sub, boxes) => svg(1200,700, text(50,54,title,25,'#9fb5d5',600,'start') + text(50,112,sub,44,'#fff',700,'start') + boxes.map((b,i)=>{const x=50+(i%2)*560,y=155+Math.floor(i/2)*235;return `<rect x="${x}" y="${y}" width="510" height="195" rx="18" fill="#202e48" stroke="#4b5a77"/>${text(x+28,y+48,b[0],30,'#8cded9',700,'start')}${text(x+28,y+96,b[1],25,'#d4deed',500,'start')}${text(x+28,y+136,b[2],25,'#d4deed',500,'start')}`}).join('')+text(50,660,'설명용 도식 · 실제 표면 상태나 공정 결과를 비율로 나타내지 않았습니다.',22,'#b9c7de',400,'start'));
const assets={
 'thumbnail.png':svg(1080,1080,text(540,300,'반도체 공정',58,'#a9bbdc',600)+text(540,485,'진공 배관',108,'#fff',800)+text(540,625,'전해연마 기준',108,'#fff',800)+text(540,795,'표면은 언제 관리할까?',56,'#bbc9de',500)),
 '사진1.png':card('SURFACE FINISH · 표면 관리','전해연마는 진공면의 상태를 관리합니다',[['처리 전','가공 흔적과 미세한 요철','세정·입자·기체 방출 검토 대상'],['전해연마 후','표면을 전기화학적으로 제거','평활화·부동태화를 함께 검토']]),
 '사진2.png':card('PURCHASE CHECK · 발주·검수','전해연마 여부만으로 청정도가 결정되지는 않습니다',[['01 재질·용접','재질 증빙 · 내부 비드','열변색과 산화물 제거 기준'],['02 표면 범위','외부인지 진공면 내부인지','도면에 명시'],['03 후처리','린스 · 건조 · 부동태화','순서와 조건 확인'],['04 시험 문서','누설 · 청정도 · 표면처리','검사 기준을 분리']])
};
for (const [name,markup] of Object.entries(assets)) await sharp(Buffer.from(markup)).png().toFile(path.join(out,name));
await copyFile(path.join(base,'..','..','..','..','..','public','images','products','hardware.png'),path.join(out,'사진3.png'));
