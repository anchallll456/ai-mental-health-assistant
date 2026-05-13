const riskLevels = {
  low: {
    label: 'Low',
    summary: 'Your message sounds generally steady, but it is still worth keeping a small wellness routine today.',
    precautions: [
      'Take a short screen break and drink water.',
      'Write down one thing that went okay today.',
      'Keep your sleep and meal timing as regular as possible.',
    ],
  },
  moderate: {
    label: 'Moderate',
    summary: 'Your message suggests emotional strain. A few grounding steps and trusted support may help.',
    precautions: [
      'Try a 5-4-3-2-1 grounding exercise.',
      'Break the next task into one small action you can finish in 10 minutes.',
      'Talk to a trusted friend, family member, mentor, or counselor if the feeling continues.',
    ],
  },
  high: {
    label: 'High',
    summary: 'Your message may need prompt human support, especially if these feelings feel intense or unsafe.',
    precautions: [
      'Move away from anything that could be used for self-harm.',
      'Call or message a trusted person and ask them to stay connected with you.',
      'If you may hurt yourself or someone else, contact emergency services now. In the U.S. or Canada, call or text 988.',
    ],
  },
};

const highRiskPattern = /\b(suicide|kill myself|end my life|self harm|self-harm|hurt myself|can't go on|cant go on)\b/i;
const moderateRiskPattern = /\b(sad|anxious|anxiety|panic|depressed|stress|stressed|lonely|overwhelmed|crying|upset)\b/i;

export function analyzeMentalHealth({ message = '', mood = 3 }) {
  const normalizedMood = Number(mood);

  if (highRiskPattern.test(message) || normalizedMood <= 1) {
    return { level: 'high', ...riskLevels.high };
  }

  if (moderateRiskPattern.test(message) || normalizedMood <= 2) {
    return { level: 'moderate', ...riskLevels.moderate };
  }

  return { level: 'low', ...riskLevels.low };
}

export function buildAlertEmail({ name, email, message, mood, analysis }) {
  const firstName = name?.trim() || 'there';
  const precautions = analysis.precautions.map((item, index) => `${index + 1}. ${item}`).join('\n');

  const subject = `MindMate wellness alert: ${analysis.label} care plan`;
  const text = [
    `Hi ${firstName},`,
    '',
    `MindMate reviewed your recent check-in and marked the care level as: ${analysis.label}.`,
    '',
    `Summary: ${analysis.summary}`,
    '',
    `Mood score: ${mood}/5`,
    `Your note: ${message}`,
    '',
    'Precautions you can take now:',
    precautions,
    '',
    'This message is for wellbeing support only and is not a medical diagnosis. If you feel unsafe or may hurt yourself or someone else, contact emergency services immediately.',
    '',
    'Take care,',
    'MindMate',
  ].join('\n');

  return {
    to: email,
    subject,
    text,
    mailtoUrl: `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
  };
}

export async function sendAlertEmail(emailPayload) {
  if (!process.env.RESEND_API_KEY || !process.env.ALERT_FROM_EMAIL) {
    return {
      sent: false,
      reason: 'Email provider is not configured. Add RESEND_API_KEY and ALERT_FROM_EMAIL to send alerts automatically.',
    };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.ALERT_FROM_EMAIL,
      to: emailPayload.to,
      subject: emailPayload.subject,
      text: emailPayload.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email provider error: ${errorText}`);
  }

  return { sent: true, provider: 'resend' };
}
