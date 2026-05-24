import fs from 'fs';
import path from 'path';

// .env 파일 직접 읽기
const envPath = new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=\s][^=]*)=["']?(.+?)["']?\s*$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const INVOKE_URL = envVars['CLOVA_INVOKE_URL'];
const SECRET_KEY = envVars['CLOVA_SECRET_KEY'];
console.log(`🔑 Secret Key 앞 8자리: ${SECRET_KEY?.slice(0, 8)}...`);

async function transcribeAudio(audioFilePath) {
  const fileName = path.basename(audioFilePath);
  const ext = path.extname(audioFilePath).slice(1).toLowerCase();
  const mimeTypes = { mp3: 'audio/mpeg', mp4: 'audio/mp4', m4a: 'audio/mp4', wav: 'audio/wav', aac: 'audio/aac' };
  const mimeType = mimeTypes[ext] || 'audio/mp4';
  const params = { language: 'ko-KR', completion: 'sync', fullText: true };

  console.log(`📂 파일 읽는 중: ${audioFilePath}`);
  const fileBuffer = fs.readFileSync(audioFilePath);

  // params를 Blob 아닌 plain string으로 전송 (filename 속성 없음)
  const formData = new FormData();
  formData.append('media', new Blob([fileBuffer], { type: mimeType }), fileName);
  formData.append('params', JSON.stringify(params));

  console.log('🔄 Clova Speech API 전송 중... (1~2분 소요)');

  const response = await fetch(`${INVOKE_URL}/recognizer/upload`, {
    method: 'POST',
    headers: {
      'X-CLOVASPEECH-API-KEY': SECRET_KEY,
      'Accept': 'application/json',
    },
    body: formData,
  });

  const responseText = await response.text();
  if (!response.ok) throw new Error(`API 오류 ${response.status}: ${responseText}`);
  return JSON.parse(responseText);
}

const audioFile = process.argv[2];
if (!audioFile || !fs.existsSync(audioFile)) {
  console.log('사용법: node scripts/test-clova-speech.mjs <음성파일경로>');
  process.exit(1);
}

transcribeAudio(audioFile)
  .then(result => {
    console.log('\n✅ 변환 완료!\n');
    const text = result.text || result.fullText || JSON.stringify(result, null, 2);
    console.log('=== 변환된 내용 ===');
    console.log(text);
    const projectRoot = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
    const outputDir = path.join(projectRoot, 'data', '상담기록');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const now = new Date();
    const ts = now.getFullYear().toString()
      + String(now.getMonth()+1).padStart(2,'0')
      + String(now.getDate()).padStart(2,'0')
      + '_'
      + String(now.getHours()).padStart(2,'0')
      + String(now.getMinutes()).padStart(2,'0');
    const baseName = path.basename(audioFile, path.extname(audioFile));
    const outputPath = path.join(outputDir, `상담_${ts}_${baseName}.txt`);
    fs.writeFileSync(outputPath, text, 'utf8');
    console.log(`\n📄 저장 위치: ${outputPath}`);
  })
  .catch(err => console.error('\n❌ 오류:', err.message));
