const breeds = [
  {
    id: 1,
    name: '布偶猫',
    description: '布偶猫有着柔顺的长毛和蓝色的大眼睛，性格温顺粘人，被称为"仙女猫"，是非常理想的家庭伴侣。',
    imageUrl: '/布偶猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 2,
    name: '英短蓝白',
    description: '英短蓝白有着圆滚滚的脸蛋和厚实的毛发，性格温和稳重，蓝白配色清新可爱，是非常受欢迎的家庭宠物。',
    imageUrl: '/英短蓝白.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 3,
    name: '美短',
    description: '美国短毛猫体格健壮，性格活泼聪明，适应能力强，有着美丽的虎斑花纹，是很好的伴侣动物。',
    imageUrl: '/美短.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 4,
    name: '暹罗猫',
    description: '暹罗猫有着独特的重点色和蓝眼睛，性格外向活泼，非常粘人，被称为"猫中之狗"，喜欢和主人互动。',
    imageUrl: '/暹罗猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 5,
    name: '缅因猫',
    description: '缅因猫是体型最大的家猫品种之一，有着浓密的毛发和大尾巴，性格温柔友善，被称为"温柔的巨人"。',
    imageUrl: '/缅因猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 6,
    name: '豹猫',
    description: '豹猫有着漂亮的豹纹皮毛，体格矫健，性格聪明活泼，充满野性魅力，是非常独特的猫咪品种。',
    imageUrl: '/豹猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 7,
    name: '加菲猫',
    description: '加菲猫有着扁平的脸蛋和大大的眼睛，性格安静温顺，慵懒可爱，是非常亲人的猫咪品种。',
    imageUrl: '/加菲猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 8,
    name: '金渐层',
    description: '金渐层有着金色的漂亮毛发，圆滚滚的身材，性格温柔粘人，是非常受欢迎的英短色系品种之一。',
    imageUrl: '/金渐层.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 9,
    name: '矮脚猫',
    description: '矮脚猫有着短短的四肢，走起路来摇摇晃晃十分可爱，性格活泼好动，聪明亲人，是非常有趣的伴侣。',
    imageUrl: '/矮脚猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 10,
    name: '无毛猫',
    description: '无毛猫没有毛发，皮肤光滑温暖，性格非常粘人，喜欢和主人亲近，是很独特的猫咪品种。',
    imageUrl: '/无毛猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 11,
    name: '德文猫',
    description: '德文卷毛猫有着卷曲的毛发和大大的耳朵，性格活泼机灵，聪明好动，是非常有特点的猫咪品种。',
    imageUrl: '/德文猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 12,
    name: '三花猫',
    description: '三花猫有着黑、红、白三种花色，性格温顺亲人，几乎都是母猫，是非常可爱的本土猫咪。',
    imageUrl: '/三花猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 13,
    name: '狸花猫',
    description: '狸花猫是中国本土品种，体格健壮，适应能力强，聪明勇敢，有着美丽的虎斑花纹。',
    imageUrl: '/狸花猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 14,
    name: '奶牛猫',
    description: '奶牛猫有着黑白相间的毛色，像奶牛一样可爱，性格活泼好动，聪明调皮，常常做出搞笑的举动。',
    imageUrl: '/奶牛猫.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  },
  {
    id: 15,
    name: '曼切斯特',
    description: '曼切斯特猫身材修长优雅，气质高贵，性格温和友善，是非常优雅迷人的猫咪品种。',
    imageUrl: '/曼切斯特.png',
    isUnlocked: false,
    memeTexts: ['喵的凝视', '还不给罐头', '本喵知道了']
  }
];

export default breeds;
