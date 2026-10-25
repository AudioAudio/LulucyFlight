// Lulucy's Flight 닉네임 필터 (게임·서버 공용으로 쓸 수 있게 독립 함수로 작성)
// checkNickname(name) → { ok: true } | { ok: false, reason: 'empty'|'long'|'banned'|'reserved' }
const NICK = (() => {
  // 한글 비속어·혐오 표현 (자모 단위로 비교 → 자모 분리·쌍자음 우회도 잡음)
  const KO = ['시발', '씨발', '씨바', '시바알', '씨빨', '시빨', '씌발', '쓰발', '쓰바', '쉬발', '슈발', '시팔', '씨팔', '씨펄', '십발', '십팔놈', '십새',
    '씹', '좆', '좃같', '존나', '졸라', '존니', '병신', '븅신', '빙신', '병싄', '등신', '머저리',
    '개새', '개색', '개세끼', '새끼', '새기', '색기', '섀끼', '쌔끼', '개같', '개년', '개놈', '개자식', '개잡', '개소리', '개씹',
    '썅', '쌍년', '쌍놈', '썅년', '썅놈', '걸레년', '창녀', '창년', '화냥', '갈보',
    '니미', '느금', '니애미', '니앰', '느그애미', '애미', '애비', '엄창', '엠창', '니엄마', '느개비',
    '지랄', '염병', '옘병', '엿먹', '꺼져', '닥쳐', '닥치', '뒤져', '뒈져', '디져', '죽어라', '자살',
    '미친놈', '미친년', '미친새', '또라이', '돌아이', '정신병자', '찐따', '쓰레기새',
    '섹스', '쎅스', '섹1스', '보지', '자지', '잠지', '보짓', '자짓', '젖꼭', '딸딸', '자위', '야동', '포르노', '강간', '성폭', '몸캠', '조건만남', '원조교제',
    '한남충', '한녀', '김치녀', '된장녀', '맘충', '틀딱', '급식충', '일베', '메갈', '워마드', '흑형', '짱깨', '쪽발', '쪽바리',
    '마약', '대마초', '필로폰', '도박'];
  // 초성·자음 축약 (입력한 자음이 연달아 있을 때만 검사 → '갓불' 같은 정상 단어는 통과)
  const CHO = ['ㅅㅂ', 'ㅆㅂ', 'ㅄ', 'ㅂㅅ', 'ㅈㄹ', 'ㅈㄴ', 'ㄲㅈ', 'ㄷㅊ', 'ㅁㅊ', 'ㄴㄱㅁ', 'ㅅㅂㄹㅁ', 'ㅆㄹㄱ', 'ㅈ같', 'ㅗ'];
  // 영어 (긴 단어는 부분 일치, 짧아서 다른 단어 속에 흔한 것은 이름 전체가 그 단어일 때만)
  const EN_SUB = ['fuck', 'fuk', 'fck', 'shit', 'bitch', 'asshole', 'cunt', 'nigger', 'nigga', 'faggot', 'motherf', 'whore', 'slut', 'porn', 'pussy', 'penis', 'vagina', 'dildo', 'hitler', 'nazi', 'retard', 'bastard', 'sibal', 'ssibal', 'shibal', 'byungsin', 'gaesaekki'];
  const EN_WORD = ['sex', 'dick', 'cock', 'rape', 'fag', 'tits', 'anal', 'stfu', 'wtf', 'kys', 'cum', 'jot', 'jiral'];
  // 숫자·영문을 섞은 한글 욕 우회
  const MIX = ['c발', 'c8', 'ㅅ8', 'ㅆ8', '씨8', '시8', '18놈', '18년', '개18', 'ㅅ1ㅂ', 'ㅆ1ㅂ', 'tlqkf', 'qudtls', 'wlfkf', 'whssk', 'rotoRl'.toLowerCase()];
  // 운영진 사칭 방지
  const RESERVED = ['관리자', '운영자', '운영진', '개발자', '공지사항', '시스템', 'admin', 'administrator', 'moderator', 'system', 'official', 'soop', '숲운영', '아프리카tv'];
  // 정상 단어 속에 우연히 들어간 경우 허용 (검사 전에 지움)
  const ALLOW = ['시발점', '시발역', '시발택시', '새끼손가락', '새끼발가락', '보지마', '보지않', '안보지', '애비뉴', '니미츠', '개새우', '졸라맨', '자지러', '시바견', '시바이누'];

  const L = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', V = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',
    T = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const SOFT = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ', 'ㅢ': 'ㅣ', 'ㅟ': 'ㅣ', 'ㅝ': 'ㅓ', 'ㅞ': 'ㅔ', 'ㅙ': 'ㅐ', 'ㅚ': 'ㅐ', 'ㅖ': 'ㅔ', 'ㅒ': 'ㅐ' };
  const LEET = { '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '+': 't' };
  const jamo = s => [...s].map(c => {
    const k = c.charCodeAt(0) - 0xAC00;
    if (k < 0 || k > 11171) return SOFT[c] || c;
    const t = T[k % 28], j = L[Math.floor(k / 588)] + V[Math.floor(k % 588 / 28)] + t;
    return [...j].map(x => SOFT[x] || x).join('');
  }).join('');
  // NFKC는 전각·특수 문자를 정리하지만 한글 자음(ㅅ)을 조합용 자모로 바꿔 버리므로 한글 자모는 그대로 둠
  const base = s => [...s].map(c => /[\u3131-\u318E\uAC00-\uD7A3]/.test(c) ? c : c.normalize('NFKC')).join('').toLowerCase();
  const keepKo = s => s.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z]/g, '');                      // 숫자·기호·공백 제거
  const keepAll = s => s.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]/g, '');                 // 숫자는 남김(c8 같은 우회용)
  const strip = (s, list) => list.reduce((a, w) => a.split(w).join(''), s);
  const KO_J = KO.map(w => jamo(w)), CHO_N = CHO.map(w => [...w].map(x => SOFT[x] || x).join(''));

  function check(raw) {
    const name = String(raw ?? '').replace(/\s+/g, ' ').trim();
    if (!name) return { ok: false, reason: 'empty' };
    const b = base(name);
    const ko = strip(keepKo(b), ALLOW), mix = strip(keepAll(b), ALLOW);
    const en = keepKo([...b].map(c => LEET[c] || c).join(''));                    // 영어는 leet 치환 후 비교
    if (RESERVED.some(w => { const r = keepKo(base(w)); return r && (ko.includes(r) || mix.includes(keepAll(base(w))) || en.includes(r)); })) return { ok: false, reason: 'reserved' };
    const kj = jamo(ko);
    if (KO_J.some(w => kj.includes(w))) return { ok: false, reason: 'banned' };
    const choOnly = [...ko].map(x => SOFT[x] || x).join('');
    if (CHO_N.some(w => choOnly.includes(w))) return { ok: false, reason: 'banned' };
    if (MIX.some(w => mix.includes(w))) return { ok: false, reason: 'banned' };
    if (EN_SUB.some(w => en.includes(w))) return { ok: false, reason: 'banned' };
    const words = b.split(/[^a-z0-9]+/).filter(Boolean).map(w => keepKo([...w].map(c => LEET[c] || c).join('')));
    if (EN_WORD.some(w => en === w || words.includes(w))) return { ok: false, reason: 'banned' };
    if ([...name].length > 10) return { ok: false, reason: 'long' };          // 길이는 마지막에(표시용 검사에서 금칙어 여부를 먼저 판단)
    return { ok: true };
  }
  return { check };
})();
if (typeof module !== 'undefined') module.exports = NICK;
