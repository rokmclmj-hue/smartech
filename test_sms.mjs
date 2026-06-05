import { SolapiMessageService } from 'solapi';

const apiKey = 'NCSUS4DNNPVIHGMZ';
const apiSecret = 'JI2VWKSAM8Q4YGVW0SURBEDOAW5AUFNM';
const adminPhone = '01031947170';

console.log('Solapi 테스트 시작...');

try {
  const service = new SolapiMessageService(apiKey, apiSecret);
  const result = await service.send({
    to: adminPhone,
    from: adminPhone,
    text: '[스마텍] SMS 테스트 메시지입니다.',
  });
  console.log('✅ 발송 성공:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('❌ 발송 실패:', e.message);
  console.error('상세:', e);
}
