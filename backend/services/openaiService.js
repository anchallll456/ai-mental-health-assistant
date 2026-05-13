import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

const crisisPattern = /\b(suicide|kill myself|end my life|self harm|self-harm|hurt myself|can't go on|cant go on)\b/i;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const localSupportFlows = [
  {
    pattern: /\b(sad|lonely|alone|down|depressed|crying|upset)\b/i,
    reply: [
      'I am sorry you are feeling this way. You do not have to make the whole day better all at once.',
      'Try one gentle step: drink some water, sit somewhere comfortable, and name what feels heaviest right now.',
      'If you can, message one person you trust with something simple like: "I am having a hard day. Can you talk for a few minutes?"',
    ].join('\n\n'),
  },
  {
    pattern: /\b(anxious|anxiety|panic|worried|nervous|overthinking|stress|stressed)\b/i,
    reply: [
      'That sounds stressful. Let us slow the moment down a little.',
      'Breathe in for four counts, hold for two, and breathe out for six. Repeat that three times.',
      'Now write one sentence that starts with: "The next small thing I can do is..."',
    ].join('\n\n'),
  },
  {
    pattern: /\b(reframe|negative thought|thought|thinking)\b/i,
    reply: [
      'A helpful reframe starts by separating the fact from the fear.',
      'Try this: "The fact is ____. The story my mind is adding is ____. A kinder and more balanced thought is ____."',
      'You do not need to force positivity. Aim for a thought that feels believable and a little less harsh.',
    ].join('\n\n'),
  },
  {
    pattern: /\b(ground|grounding|calm|calming|breathe|breathing)\b/i,
    reply: [
      'Let us do a grounding reset.',
      'Notice 5 things you can see, 4 things you can feel, 3 sounds you can hear, 2 things you can smell, and 1 thing you can taste.',
      'When you finish, relax your shoulders and place both feet on the floor if you can.',
    ].join('\n\n'),
  },
  {
    pattern: /\b(plan|next 10 minutes|small step|what should i do)\b/i,
    reply: [
      'Here is a tiny 10-minute plan.',
      'Minute 1: take three slow breaths. Minutes 2-4: tidy or clear one small area. Minutes 5-8: do one task that lowers pressure. Minutes 9-10: check in with your body and choose the next small step.',
      'Keep it small. The goal is movement, not perfection.',
    ].join('\n\n'),
  },
];

function crisisReply() {
  return [
    'I am really sorry you are feeling this much pain. If you might hurt yourself or someone else, please call emergency services now.',
    'If you are in the U.S. or Canada, call or text 988 for the Suicide & Crisis Lifeline. If you are elsewhere, contact your local emergency number or a trusted person who can stay with you.',
    'You deserve immediate human support. Can you move away from anything you could use to harm yourself and message or call someone you trust right now?',
  ].join('\n\n');
}

function localSupportReply(message) {
  const flow = localSupportFlows.find((item) => item.pattern.test(message));

  if (flow) {
    return flow.reply;
  }

  return [
    'I hear you. Thank you for telling me.',
    'Try naming the feeling in one word, then choose one small action that would make the next few minutes easier.',
    'If this has been going on for a while, consider talking with someone you trust or a mental health professional. You deserve support from real people too.',
  ].join('\n\n');
}

export async function chatWithOpenAI(message) {
  try {
    const cleanMessage = message.trim();

    if (crisisPattern.test(cleanMessage)) {
      return crisisReply();
    }

    if (!openai) {
      return localSupportReply(cleanMessage);
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: [
            'You are MindMate, a supportive mental wellness companion.',
            'Be warm, concise, practical, and non-judgmental.',
            'Do not diagnose, claim to be a therapist, or replace professional care.',
            'Encourage professional or emergency support when safety risk appears.',
          ].join(' '),
        },
        { role: 'user', content: cleanMessage },
      ],
      temperature: 0.7,
      max_tokens: 350,
    });

    return completion.choices[0]?.message?.content?.trim() || 'I am here with you. Could you tell me a little more about what is going on?';
  } catch (error) {
    console.error('OpenAI Error:', error.message);
    return localSupportReply(message);
  }
}
