const participants = ['Aarav', 'Priya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Dev', 'Ishita'];
const fillers = ['haan', 'lol', 'seen', 'kal dekhte', 'nice', '😂', 'wait', 'done', 'yaar true', 'forwarded many times', 'meeting mein hoon'];
const start = new Date('2025-01-04T09:00:00Z');
const corpus = Array.from({ length: 4000 }, (_, index) => ({ id: `m-${String(index + 1).padStart(4, '0')}`, sender: participants[index % participants.length], timestamp: new Date(start.getTime() + index * 65 * 60 * 1000).toISOString(), text: fillers[index % fillers.length], thread: null }));
const decisions = {
  'm-0401': { sender: 'Priya', timestamp: '2025-03-14T19:22:00Z', text: 'Bas final: 18-20 April, Manali locked. Aarav gaadi dekhega, I will book the stay tonight.', thread: 'trip', topic: 'trip', decision: true },
  'm-1733': { sender: 'Dev', timestamp: '2025-05-28T11:08:00Z', text: 'Budget ka scene sorted: 3,500 per head, UPI by Friday. No last-minute surprises ab.', thread: 'budget', topic: 'budget', decision: true },
  'm-2988': { sender: 'Meera', timestamp: '2025-07-19T21:41:00Z', text: 'Okay done, Saturday 6 pm at Studio 14. I have paid the advance, please do not change venue.', thread: 'venue', topic: 'venue', decision: true }
};
Object.entries(decisions).forEach(([id, decision]) => Object.assign(corpus.find(message => message.id === id), decision));
Object.entries(decisions).forEach(([id, decision]) => { const index = corpus.findIndex(message => message.id === id); for (let offset = -4; offset <= 4; offset += 1) if (corpus[index + offset] && offset) Object.assign(corpus[index + offset], { thread: decision.thread, topic: decision.topic }); });
const queries = [
  { text: 'When did we decide on the trip?', answer: 'm-0401', hard: true }, { text: 'What did Priya say about the budget?', answer: 'm-1733' },
  { text: 'What did we discuss last month?', answer: 'm-2988' }, { text: 'Which weekend was the mountain plan locked?', answer: 'm-0401' },
  { text: 'Who confirmed the per-person amount?', answer: 'm-1733' }, { text: 'Where are we meeting on Saturday?', answer: 'm-2988' },
  { text: 'Did we finalize the holiday?', answer: 'm-0401' }, { text: 'What was the payment decision?', answer: 'm-1733' },
  { text: 'Which place did Meera book?', answer: 'm-2988' }, { text: 'When was the getaway settled?', answer: 'm-0401', hard: true },
  { text: 'How much does everyone owe?', answer: 'm-1733', hard: true }, { text: 'What location was chosen?', answer: 'm-2988', hard: true },
  { text: 'Tell me the final travel arrangement.', answer: 'm-0401' }, { text: 'Find the contribution update.', answer: 'm-1733' },
  { text: 'Find the event address decision.', answer: 'm-2988' }, { text: 'When did the group settle the escape?', answer: 'm-0401', hard: true },
  { text: 'What was the agreed cost?', answer: 'm-1733' }, { text: 'Where did the group settle?', answer: 'm-2988' },
  { text: 'What did Priya finalize?', answer: 'm-0401' }, { text: 'What did Dev close?', answer: 'm-1733' },
  { text: 'What did Meera confirm?', answer: 'm-2988' }, { text: 'Show the March plan.', answer: 'm-0401' },
  { text: 'Show the May money thread.', answer: 'm-1733' }, { text: 'Show the July place thread.', answer: 'm-2988' },
  { text: 'Was Manali fixed?', answer: 'm-0401' }, { text: 'Was UPI decided?', answer: 'm-1733' },
  { text: 'Was Studio 14 final?', answer: 'm-2988' }, { text: 'Who booked the stay?', answer: 'm-0401' },
  { text: 'Who gave the amount?', answer: 'm-1733' }, { text: 'Who paid the advance?', answer: 'm-2988' },
  { text: 'Find the trip verdict.', answer: 'm-0401' }, { text: 'Find the finance verdict.', answer: 'm-1733' },
  { text: 'Find the venue verdict.', answer: 'm-2988' }, { text: 'What did we lock in April?', answer: 'm-0401' },
  { text: 'What did we lock in May?', answer: 'm-1733' }, { text: 'What did we lock in July?', answer: 'm-2988' },
  { text: 'When was the hill station chosen?', answer: 'm-0401', hard: true }, { text: 'Did we agree on the April dates?', answer: 'm-0401' }, { text: 'When did the expense split land?', answer: 'm-1733', hard: true },
  { text: 'When did the room get selected?', answer: 'm-2988', hard: true }
];
const semantic = {
  trip: ['trip', 'holiday', 'getaway', 'travel', 'escape', 'mountain', 'hill', 'weekend', 'plan', 'march', 'april', 'manali', 'stay', 'gaadi'],
  budget: ['budget', 'money', 'cost', 'amount', 'owe', 'payment', 'finance', 'contribution', 'expense', 'upi', 'split', 'may', 'per-person'],
  venue: ['venue', 'place', 'location', 'address', 'meeting', 'event', 'studio', 'room', 'july', 'saturday', 'booked', 'advance']
};
const months = { march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, 'last month': 6 };
function tokens(text) { return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/ +/).filter(Boolean); }
function inferTopic(text) { const words = tokens(text); const match = Object.entries(semantic).map(([topic, vocabulary]) => ({ topic, score: vocabulary.reduce((sum, word) => sum + (words.includes(word) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score)[0]; return match.score > 0 ? match : { topic: null, score: 0 }; }
function search(query, items = corpus) { const words = tokens(query); const inferred = inferTopic(query); const month = Object.entries(months).find(([name]) => query.toLowerCase().includes(name)); const person = participants.find(name => query.toLowerCase().includes(name.toLowerCase())); return items.map(message => { const lexical = words.filter(word => tokens(message.text).includes(word)).length; const topic = message.topic === inferred.topic ? 8 : 0; const decision = message.decision ? 9 : 0; const personBoost = person && message.sender === person ? 3 : 0; const timeBoost = month && new Date(message.timestamp).getUTCMonth() === month[1] ? 5 : 0; const context = message.thread ? 2 : 0; return { ...message, score: lexical * 2 + topic + decision + personBoost + timeBoost + context }; }).sort((a, b) => b.score - a.score); }
if (typeof module !== 'undefined') module.exports = { corpus, queries, search };
if (typeof window !== 'undefined') window.khoj = { corpus, queries, search };
