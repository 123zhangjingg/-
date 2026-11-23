export const config = {
  recipientName: '冯扬',
  senderName: '张靖',
  flowerType: 'pink-rose',
  theme: 'romantic',
  musicEnabled: false,
  musicSource: '',
  letter: [
    '{recipient}：',
    '想了想，还是决定把这份小礼物送给你。',
    '有些心意，平时可能不太容易说出口，所以想用这样一束花，替我表达一点特别的心情。',
    '和你相处的时候，总会觉得时间过得很快。你的笑容、你的温柔，还有一些不经意的小细节，都让我觉得很美好。',
    '慢慢地，我发现自己开始期待和你见面的时刻，也开始在意你今天过得好不好。',
    '所以，今天想认真地告诉你：',
    '我喜欢你。',
    '不是一时兴起，而是想慢慢了解你，想和你分享生活里的小事，也想成为能给你带来快乐的人。',
    '这束花送给你，希望它能替我把这份喜欢，温柔地告诉你。',
    '不想给你任何压力，只希望你收到它的时候，能开心地笑一笑。',
    '愿你每天都有好心情，愿所有美好的事情都能如期而至。',
    '这束花送给你，也把我的一点点心意交给你。',
    '—— {sender}'
  ],
  closing: '「愿这束花替我，把喜欢轻轻告诉你。」',
  openingName: '{recipient}，',
  flowerTitle: '这束玫瑰，',
  dedication: '致 {recipient}',
  from: '来自 {sender}',
  signature: '{sender}赠'
};

export function personalize(text) {
  return text.replaceAll('{recipient}', config.recipientName).replaceAll('{sender}', config.senderName);
}

