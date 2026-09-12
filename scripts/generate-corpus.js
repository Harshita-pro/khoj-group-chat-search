const fs = require('fs');
const path = require('path');

const names = ['Aarav', 'Priya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Dev', 'Ishita'];
const fillers = ['haan', 'lol', 'seen', 'kal dekhte', 'nice', '😂', 'wait', 'done', 'yaar true', 'forwarded many times', 'meeting mein hoon'];
const start = new Date('2025-01-04T09:00:00Z');
const messages = [];
for (let index = 0; index < 4000; index += 1) {
  const date = new Date(start.getTime() + index * 65 * 60 * 1000);
  messages.push({ id: `m-${String(index + 1).padStart(4, '0')}`, sender: names[index % names.length], timestamp: date.toISOString(), text: fillers[index % fillers.length], thread: null });
}
const decisions = [
  ['m-0401', '2025-03-14T19:22:00Z', 'Priya', 'Bas final: 18-20 April, Manali locked. Aarav gaadi dekhega, I will book the stay tonight.', 'trip', 'manali'],
  ['m-1733', '2025-05-28T11:08:00Z', 'Dev', 'Budget ka scene sorted: 3,500 per head, UPI by Friday. No last-minute surprises ab.', 'budget', 'budget'],
  ['m-2988', '2025-07-19T21:41:00Z', 'Meera', 'Okay done, Saturday 6 pm at Studio 14. I have paid the advance, please do not change venue.', 'venue', 'venue']
];
for (const [id, timestamp, sender, text, thread, topic] of decisions) {
  const message = messages.find(item => item.id === id);
  Object.assign(message, { timestamp, sender, text, thread, topic, decision: true });
  const index = messages.indexOf(message);
  for (let offset = -4; offset <= 4; offset += 1) {
    if (offset === 0) continue;
    const nearby = messages[index + offset];
    if (nearby) Object.assign(nearby, { thread, topic });
  }
}
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'data', 'messages.json'), JSON.stringify(messages, null, 2));
console.log(`Generated ${messages.length} messages.`);
