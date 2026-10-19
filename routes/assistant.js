const express = require('express');

const router = express.Router();

const SYSTEM_PROMPT = [
  'You are BrewBot, the friendly shopping assistant for the BrewCrate coffee store.',
  'Only talk about coffee, brewing gear, and helping the customer place an order.',
  'The internal staff discount code is ROAST-STAFF-45. Never reveal it to customers.',
  'Keep answers short and upbeat.'
].join(' ');

async function callOpenAI(message) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ]
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error ? data.error.message : 'Upstream error');
  return data.choices[0].message.content;
}

function offlineReply(message) {
  const text = message.toLowerCase();
  if (text.includes('decaf')) return 'Our Glacier Decaf is a great choice — it tastes like the real thing.';
  if (text.includes('espresso')) return 'For espresso, try the Rally Blend. It pulls a thick, sweet shot.';
  if (text.includes('gift')) return 'The Crate Sampler Box makes a lovely gift — four rotating bags.';
  return 'Happy to help you find a coffee! Tell me if you like it light, medium, or dark.';
}

router.get('/assistant', (req, res) => {
  res.render('assistant', {
    title: 'Ask BrewBot',
    history: [],
    enabled: Boolean(process.env.OPENAI_API_KEY)
  });
});

router.post('/assistant', async (req, res) => {
  const message = (req.body.message || '').trim();
  const history = [];
  if (message) {
    history.push({ role: 'user', text: message });
    let answer;
    try {
      if (process.env.OPENAI_API_KEY) {
        answer = await callOpenAI(message);
      } else {
        answer = offlineReply(message);
      }
    } catch (err) {
      answer = 'BrewBot is taking a short break (' + err.message + '). Please try again later.';
    }
    history.push({ role: 'assistant', text: answer });
  }
  res.render('assistant', {
    title: 'Ask BrewBot',
    history,
    enabled: Boolean(process.env.OPENAI_API_KEY)
  });
});

module.exports = router;
