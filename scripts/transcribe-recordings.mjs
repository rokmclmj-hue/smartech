/**
 * 통화 녹음 일괄 변환 스크립트
 *
 * 사용법:
 *   node scripts/transcribe-recordings.mjs
 *
 * 동작:
 *   1. data/녹음/ 폴더에서 미처리 음성파일 탐색
 *   2. CLOVA Speech API로 텍스트 변환
 *   3. data/상담기록/ 에 저장
 *   4. 처리 완료된 파일은 data/녹음/처리완료/ 로 이동
 *
 * 지원 형식: mp3, mp4, m4a, wav, aac
 */

import fs from 'fs';
import path from 'path';

// .env 직접 읽기
const envPath = new URL('../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=\s][^=]*)=["']?(.+?)["']?\s*$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const INVOKE_URL = envVars['CLOVA_INVOKE_URL'];
const SECRET_KEY = envVars['CLOVA_SECRET_KEY'];
const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const AUDIO_DIR    = path.join(root, 'data', '녹음');
const DONE_DIR     = path.join(root, 'data', '녹음', '처리완료');
const OUTPUT_DIR   = path.join(root, 'data', '상담기록');
const SUPPORTED    = new Set(['mp3', 'mp4', 'm4a', 'wav', 'aac']);
const MIME = {
  mp3: 'audio/mpeg',
  mp4: 'audio/mp4',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  aac: 'audio/aac',
};

function nowTs() {
  const d = new Date();
  return d.getFullYear().toString()
    + String(d.getMonth() + 1).padStart(2, '0')
    + String(d.getDate()).padStart(2, '0')
    + '_'
    + String(d.getHours()).padStart(2, '0')
    + String(d.getMinutes()).padStart(2, '0');
}

async function transcribeFile(audioPath) {
  const fileName = path.basename(audioPath);
  const ext = path.extname(audioPath).slice(1).toLowerCase();
  const mimeType = MIME[ext] ?? 'audio/mp4';

  const fileBuffer = fs.readFileSync(audioPath);
  const formData = new FormData();
  formData.append('media', new Blob([fileBuffer], { type: mimeType }), fileName);
  formData.append('params', JSON.stringify({
    language: 'ko-KR',
    completion: 'sync',
    fullText: true,
    diarization: { enable: true },  // 화자 분리 (대화록에 유용)
  }));

  const response = await fetch(`${INVOKE_URL}/recognizer/upload`, {
    method: 'POST',
    headers: {
      'X-CLOVASPEECH-API-KEY': SECRET_KEY,
      'Accept': 'application/json',
    },
    body: formData,
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`API ${response.status}: ${text}`);
  return JSON.parse(text);
}

function formatResult(result, originalFileName) {
  const lines = [];
  lines.push(`[원본 파일] ${originalFileName}`);
  lines.push(`[변환 일시] ${new Date().toLocaleString('ko-KR')}`);
  lines.push('');

  // 화자 분리 결과가 있으면 대화 형식으로 저장
  if (result.segments && result.segments.length > 0) {
    lines.push('=== 대화 내용 ===');
    let lastSpeaker = null;
    for (const seg of result.segments) {
      const speaker = seg.diarization?.label ?? '화자';
      const speakerLabel = speaker === 'spk_0' ? '담당자(스마텍)' :
                          speaker === 'spk_1' ? '고객' : speaker;
      if (speakerLabel !== lastSpeaker) {
        lines.push('');
        lines.push(`[${speakerLabel}]`);
        lastSpeaker = speakerLabel;
      }
      lines.push(seg.text?.trim() ?? '');
    }
  } else {
    lines.push('=== 전체 내용 ===');
    lines.push(result.text || result.fullText || '');
  }

  return lines.join('\n');
}

async function main() {
  console.log('========================================');
  console.log('  스마텍 통화 녹음 변환기');
  console.log('========================================\n');

  if (!INVOKE_URL || !SECRET_KEY) {
    console.error('오류: .env 파일에 CLOVA_INVOKE_URL 과 CLOVA_SECRET_KEY 가 없습니다.');
    process.exit(1);
  }

  // 폴더 생성
  [AUDIO_DIR, DONE_DIR, OUTPUT_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // 미처리 파일 목록 (data/녹음/ 루트 only, 처리완료 제외)
  const files = fs.readdirSync(AUDIO_DIR)
    .filter(f => {
      const ext = path.extname(f).slice(1).toLowerCase();
      return SUPPORTED.has(ext);
    })
    .sort();

  if (files.length === 0) {
    console.log('data/녹음/ 폴더에 변환할 음성 파일이 없습니다.');
    console.log('\n[사용 방법]');
    console.log('  1. data/녹음/ 폴더에 .mp3 / .m4a / .wav 파일을 넣으세요.');
    console.log('  2. run-transcribe.bat 을 다시 실행하세요.');
    return;
  }

  console.log(`변환할 파일: ${files.length}개\n`);

  let success = 0;
  let fail = 0;

  for (const file of files) {
    const audioPath = path.join(AUDIO_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    console.log(`\n[${files.indexOf(file) + 1}/${files.length}] ${file}`);
    console.log('  변환 중... (파일 크기에 따라 1~3분 소요)');

    try {
      const result = await transcribeFile(audioPath);
      const formatted = formatResult(result, file);

      const ts = nowTs();
      const outputPath = path.join(OUTPUT_DIR, `상담_${ts}_${baseName}.txt`);
      fs.writeFileSync(outputPath, formatted, 'utf8');
      console.log(`  저장: data/상담기록/${path.basename(outputPath)}`);

      // 처리 완료 파일 이동
      const donePath = path.join(DONE_DIR, file);
      fs.renameSync(audioPath, donePath);
      console.log(`  완료: data/녹음/처리완료/${file} 으로 이동`);

      success++;
    } catch (err) {
      console.error(`  실패: ${err.message}`);
      fail++;
    }
  }

  console.log('\n========================================');
  console.log(`  완료: ${success}개 성공 / ${fail}개 실패`);
  console.log('  변환된 내용은 data/상담기록/ 에서 확인하세요.');
  console.log('  AI 파이프라인 실행 시 자동으로 참조됩니다.');
  console.log('========================================\n');
}

main().catch(err => {
  console.error('\n예상치 못한 오류:', err.message);
  process.exit(1);
});
