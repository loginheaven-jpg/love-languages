export type LoveLanguage = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuizOption {
  text: string;
  category: LoveLanguage;
}

export interface QuizQuestion {
  id: number;
  option1: QuizOption;
  option2: QuizOption;
}

export interface LanguageInfo {
  key: LoveLanguage;
  name: string;
  nameEn: string;
  color: string;
  colorLight: string;
  icon: string;
  description: string;
  characteristics: string[];
  tips: string[];
}

export const LANGUAGE_INFO: Record<LoveLanguage, LanguageInfo> = {
  A: {
    key: 'A',
    name: '인정하는 말',
    nameEn: 'Words of Affirmation',
    color: '#E8736F',
    colorLight: '#FDE8E7',
    icon: '💬',
    description: '칭찬, 격려, 감사의 말을 통해 사랑을 느끼는 유형입니다. "사랑해", "고마워", "잘했어"와 같은 진심 어린 말 한마디가 이 유형에게는 가장 큰 사랑의 표현입니다.',
    characteristics: [
      '상대방의 자발적인 칭찬에 크게 감동받습니다',
      '"사랑해"라는 말을 직접 듣는 것이 매우 중요합니다',
      '비난이나 모욕적인 말에 깊은 상처를 받습니다',
      '감사와 인정의 표현을 자주 필요로 합니다',
    ],
    tips: [
      '매일 구체적으로 칭찬하는 습관을 들이세요',
      '감사 카드나 메모를 남겨보세요',
      '상대의 노력과 성취를 인정하는 말을 해주세요',
      '비판보다는 격려의 언어를 사용하세요',
    ],
  },
  B: {
    key: 'B',
    name: '함께하는 시간',
    nameEn: 'Quality Time',
    color: '#F5A623',
    colorLight: '#FEF3E0',
    icon: '⏰',
    description: '온전히 집중하며 함께 보내는 시간을 통해 사랑을 느끼는 유형입니다. 함께 있을 때 다른 일에 신경 쓰지 않고 오직 상대에게만 집중해 주는 것이 최고의 사랑 표현입니다.',
    characteristics: [
      '함께 있을 때 온전한 집중을 받는 것을 최고로 여깁니다',
      '대화 중 다른 일을 하면 큰 상처를 받습니다',
      '함께하는 활동 자체보다 "함께"라는 사실이 중요합니다',
      '약속을 미루거나 취소하면 깊이 실망합니다',
    ],
    tips: [
      '대화할 때 핸드폰을 내려놓고 눈을 맞추세요',
      '정기적인 데이트 시간을 만들어보세요',
      '함께 새로운 활동을 시도해보세요',
      '상대의 이야기를 끝까지 경청해주세요',
    ],
  },
  C: {
    key: 'C',
    name: '선물',
    nameEn: 'Receiving Gifts',
    color: '#7FB069',
    colorLight: '#E8F5E3',
    icon: '🎁',
    description: '정성이 담긴 선물을 통해 사랑을 느끼는 유형입니다. 선물의 가격이 아니라 "나를 생각하고 있었구나"라는 마음이 전해질 때 가장 큰 사랑을 느낍니다.',
    characteristics: [
      '선물에 담긴 사려깊음과 노력을 소중히 여깁니다',
      '기념일을 잊거나 성의 없는 선물에 크게 상처받습니다',
      '받은 선물을 오래 간직하고 특별하게 기억합니다',
      '물질주의가 아닌, 선물에 담긴 "마음"을 읽습니다',
    ],
    tips: [
      '기념일을 꼭 기억하고 작은 선물이라도 준비하세요',
      '일상에서 상대가 원하는 것을 메모해두세요',
      '직접 만든 선물이나 편지도 좋은 방법입니다',
      '특별한 날이 아니어도 깜짝 선물을 해보세요',
    ],
  },
  D: {
    key: 'D',
    name: '봉사',
    nameEn: 'Acts of Service',
    color: '#9B8EC4',
    colorLight: '#F0ECF8',
    icon: '🤝',
    description: '상대를 위해 구체적인 행동으로 도와줄 때 사랑을 느끼는 유형입니다. 말보다 행동이 중요하며, 자발적으로 짐을 덜어주는 것이 가장 큰 사랑의 표현입니다.',
    characteristics: [
      '행동이 말보다 중요하다고 생각합니다',
      '자발적으로 도와줄 때 깊은 사랑을 느낍니다',
      '게으름이나 약속 불이행에 크게 실망합니다',
      '억지가 아닌 마음에서 우러나온 봉사를 원합니다',
    ],
    tips: [
      '상대의 할 일 목록에서 하나를 대신 해주세요',
      '부탁하기 전에 먼저 도와주는 모습을 보여주세요',
      '집안일을 나눠서 하는 것도 좋은 방법입니다',
      '"내가 해줄게"라는 말을 실천으로 옮기세요',
    ],
  },
  E: {
    key: 'E',
    name: '스킨십',
    nameEn: 'Physical Touch',
    color: '#F4845F',
    colorLight: '#FEEAE4',
    icon: '🤗',
    description: '포옹, 손잡기, 어깨 두드리기 등 신체적 접촉을 통해 사랑을 느끼는 유형입니다. 따뜻한 터치 하나가 천 마디 말보다 큰 위로와 사랑이 됩니다.',
    characteristics: [
      '포옹, 손잡기 등 물리적 접촉으로 안정감을 느낍니다',
      '스킨십이 없으면 정서적 거리감을 느낍니다',
      '가벼운 터치도 큰 의미로 받아들입니다',
      '신체적 접촉을 통해 감정을 표현하는 편입니다',
    ],
    tips: [
      '만날 때와 헤어질 때 포옹을 해주세요',
      '대화할 때 자연스럽게 손을 잡아보세요',
      '지나가면서 어깨를 가볍게 두드려주세요',
      '소파에서 나란히 앉아 있는 것도 좋습니다',
    ],
  },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    option1: { text: '나는 칭찬을 듣기를 좋아한다.', category: 'A' },
    option2: { text: '나는 당신이 안아 주는 것을 좋아한다.', category: 'E' },
  },
  {
    id: 2,
    option1: { text: '나는 당신과 단 둘이 시간을 보내는 것이 좋다.', category: 'B' },
    option2: { text: '나는 당신이 실질적인 행동으로 도와주는 것을 좋아한다.', category: 'D' },
  },
  {
    id: 3,
    option1: { text: '나는 선물을 받는 것이 좋다.', category: 'C' },
    option2: { text: '나는 당신과 천천히 함께 걷는 것이 좋다.', category: 'B' },
  },
  {
    id: 4,
    option1: { text: '나는 당신이 행동으로 도와주는 것이 좋다.', category: 'D' },
    option2: { text: '나는 당신이 만져 주는 것을 좋아한다.', category: 'E' },
  },
  {
    id: 5,
    option1: { text: '나는 당신이 안아주면 사랑을 받는다고 느낀다.', category: 'E' },
    option2: { text: '나는 선물을 받을 때 사랑을 받는다고 느낀다.', category: 'C' },
  },
  {
    id: 6,
    option1: { text: '나는 당신과 함께 외출하는 것이 좋다.', category: 'B' },
    option2: { text: '나는 당신과 손잡고 있는 것이 좋다.', category: 'E' },
  },
  {
    id: 7,
    option1: { text: '나는 선물을 받는 것이 좋다.', category: 'C' },
    option2: { text: '나는 칭찬을 듣는 것이 좋다.', category: 'A' },
  },
  {
    id: 8,
    option1: { text: '나는 당신과 나란히 앉아 있는 것이 좋다.', category: 'B' },
    option2: { text: '나에게 이쁘다(멋지다)라고 말해주는 것이 좋다.', category: 'A' },
  },
  {
    id: 9,
    option1: { text: '나는 당신과 함께 시간을 보내는 것이 좋다.', category: 'B' },
    option2: { text: '나는 당신에게서 선물을 받는 것이 좋다.', category: 'C' },
  },
  {
    id: 10,
    option1: { text: '당신이 나에게 칭찬의 말을 해 주는 것이 좋다.', category: 'A' },
    option2: { text: '나는 당신이 구체적인 행동으로 도와주는 것이 좋다.', category: 'D' },
  },
  {
    id: 11,
    option1: { text: '내가 무슨 일을 할 때에 당신이 함께 해 주는 것이 좋다.', category: 'B' },
    option2: { text: '나는 당신이 따뜻하고 친절한 말을 해 주는 것이 좋다.', category: 'A' },
  },
  {
    id: 12,
    option1: { text: '나는 행동이 말보다 중요하다고 생각한다.', category: 'D' },
    option2: { text: '나는 당신이 안아주면 행복을 느낀다.', category: 'E' },
  },
  {
    id: 13,
    option1: { text: '나는 칭찬을 좋아하고 잔소리를 싫어한다.', category: 'A' },
    option2: { text: '작은 선물을 여러 개 받는 것이 큰 선물 한 가지 받는 것보다 좋다.', category: 'C' },
  },
  {
    id: 14,
    option1: { text: '나는 함께 이야기하거나 함께 무슨 일을 하면 좋다.', category: 'B' },
    option2: { text: '나는 당신이 만져주거나 안아주면 좋다.', category: 'E' },
  },
  {
    id: 15,
    option1: { text: '내가 잘한 것을 칭찬해 주었으면 좋겠다.', category: 'A' },
    option2: { text: '당신이 싫어하지만 나를 위해서 그 일을 해 주면 사랑을 느낀다.', category: 'D' },
  },
  {
    id: 16,
    option1: { text: '지나칠 때에 만나면 나를 만져주는 것이 좋다.', category: 'E' },
    option2: { text: '내 말을 열심히 들어주는 것이 좋다.', category: 'B' },
  },
  {
    id: 17,
    option1: { text: '집안 일들을 거들어 주면 좋다.', category: 'D' },
    option2: { text: '선물을 받는 것이 정말 좋다.', category: 'C' },
  },
  {
    id: 18,
    option1: { text: '"예쁘다", "멋지다" 라는 말을 듣기를 좋아한다.', category: 'A' },
    option2: { text: '나의 기분을 이해해 주는 것이 좋다.', category: 'B' },
  },
  {
    id: 19,
    option1: { text: '나를 포옹해 주면 안정감을 느낀다.', category: 'E' },
    option2: { text: '나를 위해 무슨 행동을 해 주면 사랑을 받는다고 느낀다.', category: 'D' },
  },
  {
    id: 20,
    option1: { text: '나를 위해 여러 가지 행동을 하고 있을 때 사랑을 받는다고 느낀다.', category: 'D' },
    option2: { text: '직접 만든 선물을 받는 것이 좋다.', category: 'C' },
  },
  {
    id: 21,
    option1: { text: '나의 말을 열심히 들어줄 때에 사랑을 받는다고 느낀다.', category: 'B' },
    option2: { text: '나는 실질적으로 도와주는 것을 좋아한다.', category: 'D' },
  },
  {
    id: 22,
    option1: { text: '생일 선물을 받는 것을 좋아한다.', category: 'C' },
    option2: { text: '생일에 의미 있는 말을 해 주는 것을 좋아한다.', category: 'A' },
  },
  {
    id: 23,
    option1: { text: '선물을 받으면 당신이 나를 생각하고 있었음을 느낀다.', category: 'C' },
    option2: { text: '나의 일을 도와주면 사랑을 받는다고 느낀다.', category: 'D' },
  },
  {
    id: 24,
    option1: { text: '하고 있는 말을 막지 않고 내 말을 끝까지 들어주는 것이 좋다.', category: 'B' },
    option2: { text: '생일이나 결혼 기념일을 잊지 않고 선물 주는 것이 좋다.', category: 'C' },
  },
  {
    id: 25,
    option1: { text: '매일 하는 집안 일을 도와주는 것을 좋아한다.', category: 'D' },
    option2: { text: '특별한 여행하는 것을 좋아한다.', category: 'B' },
  },
  {
    id: 26,
    option1: { text: '뜻밖에, 생각지 않을 때에 뽀뽀해 주는 것을 좋아한다.', category: 'E' },
    option2: { text: '특별한 날이 아닌데도 선물을 받는 것을 좋아한다.', category: 'C' },
  },
  {
    id: 27,
    option1: { text: '"고맙다" 라는 말을 듣기를 좋아한다.', category: 'A' },
    option2: { text: '대화 할 때에 나를 쳐다보며 말해 주는 것이 좋다.', category: 'B' },
  },
  {
    id: 28,
    option1: { text: '당신에게서 선물을 받는 것을 좋아한다.', category: 'C' },
    option2: { text: '당신이 나를 만져주는 것이 좋다.', category: 'E' },
  },
  {
    id: 29,
    option1: { text: '나의 부탁을 즉각 듣고 열심히 일해 주는 것을 좋아한다.', category: 'D' },
    option2: { text: '나에게 고맙다고 하고 나를 인정해 주는 말을 좋아한다.', category: 'A' },
  },
  {
    id: 30,
    option1: { text: '나는 당신이 매일 안아주는 것이 필요하다.', category: 'E' },
    option2: { text: '나는 당신이 매일 나를 고맙다고 말해 주는 것이 필요하다.', category: 'A' },
  },
];

export interface QuizResult {
  scores: Record<LoveLanguage, number>;
  primary: LoveLanguage;
  secondary: LoveLanguage;
  answers: (1 | 2)[];
}

export function calculateResult(answers: (1 | 2)[]): QuizResult {
  const scores: Record<LoveLanguage, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };

  answers.forEach((answer, index) => {
    const question = QUIZ_QUESTIONS[index];
    if (answer === 1) {
      scores[question.option1.category]++;
    } else {
      scores[question.option2.category]++;
    }
  });

  const sorted = (Object.entries(scores) as [LoveLanguage, number][])
    .sort((a, b) => b[1] - a[1]);

  return {
    scores,
    primary: sorted[0][0],
    secondary: sorted[1][0],
    answers,
  };
}
