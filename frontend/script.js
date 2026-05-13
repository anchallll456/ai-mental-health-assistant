const form = document.querySelector('#chatForm');
const input = document.querySelector('#messageInput');
const messages = document.querySelector('#chatMessages');
const sendButton = document.querySelector('#sendButton');
const themeToggle = document.querySelector('#themeToggle');
const moodRange = document.querySelector('#moodRange');
const moodLabel = document.querySelector('#moodLabel');
const promptButtons = document.querySelectorAll('[data-prompt]');
const registerForm = document.querySelector('#registerForm');
const registerStatus = document.querySelector('#registerStatus');
const userNameInput = document.querySelector('#userName');
const userEmailInput = document.querySelector('#userEmail');
const alertButton = document.querySelector('#alertButton');
const alertPanel = document.querySelector('#alertPanel');
const alertTitle = document.querySelector('#alertTitle');
const alertSummary = document.querySelector('#alertSummary');
const alertPreview = document.querySelector('#alertPreview');
const mailtoLink = document.querySelector('#mailtoLink');

let latestUserMessage = '';

const moodLabels = {
  1: 'Low',
  2: 'Tender',
  3: 'Steady',
  4: 'Hopeful',
  5: 'Strong',
};

function addMessage(role, text) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  article.append(paragraph);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  sendButton.textContent = isLoading ? 'Sending' : 'Send';
}

async function sendMessage(message) {
  addMessage('user', message);
  latestUserMessage = message;
  setLoading(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to reach the assistant.');
    }

    addMessage('assistant', data.reply);
  } catch (error) {
    addMessage('assistant', `${error.message} Please try again in a moment.`);
  } finally {
    setLoading(false);
    input.focus();
  }
}

function getRegisteredUser() {
  const savedUser = localStorage.getItem('mindmate-user');
  return savedUser ? JSON.parse(savedUser) : null;
}

function updateRegisteredUserUI() {
  const user = getRegisteredUser();

  if (!user) {
    registerStatus.textContent = 'Register to receive a wellness alert by email.';
    return;
  }

  userNameInput.value = user.name;
  userEmailInput.value = user.email;
  registerStatus.textContent = `Alerts will be prepared for ${user.email}.`;
}

function setAlertLoading(isLoading) {
  alertButton.disabled = isLoading;
  alertButton.textContent = isLoading ? 'Preparing' : 'Email Alert';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  sendMessage(message);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

promptButtons.forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const user = {
    name: userNameInput.value.trim(),
    email: userEmailInput.value.trim(),
  };

  localStorage.setItem('mindmate-user', JSON.stringify(user));
  updateRegisteredUserUI();
});

alertButton.addEventListener('click', async () => {
  const user = getRegisteredUser();

  if (!user) {
    registerStatus.textContent = 'Please save your name and email first.';
    userNameInput.focus();
    return;
  }

  if (!latestUserMessage) {
    addMessage('assistant', 'Send a message first, then I can prepare a precaution alert from your latest check-in.');
    return;
  }

  setAlertLoading(true);

  try {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...user,
        message: latestUserMessage,
        mood: moodRange.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to prepare alert.');
    }

    alertPanel.hidden = false;
    alertTitle.textContent = data.delivery.sent ? 'Precaution email sent' : 'Precaution email ready';
    alertSummary.textContent = `${data.analysis.label} care level: ${data.analysis.summary}`;
    alertPreview.textContent = data.email.text;
    mailtoLink.href = data.email.mailtoUrl;
    mailtoLink.hidden = data.delivery.sent;

    if (!data.delivery.sent) {
      registerStatus.textContent = 'Email provider is not configured yet. Use Open Email App to send this alert from your mail.';
    }
  } catch (error) {
    addMessage('assistant', `${error.message} Please check the saved email and try again.`);
  } finally {
    setAlertLoading(false);
  }
});

moodRange.addEventListener('input', () => {
  moodLabel.textContent = moodLabels[moodRange.value];
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('mindmate-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

if (localStorage.getItem('mindmate-theme') === 'dark') {
  document.body.classList.add('dark');
}

updateRegisteredUserUI();
