// helper: calculate entropy locally (same logic as backend)
function calcEntropy(password) {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^A-Za-z0-9]/.test(password)) charset += 32;
  if (charset === 0 || password.length === 0) return 0;
  const entropy = password.length * (Math.log2(charset));
  return Math.round(entropy * 100) / 100;
}

function entropyToScore(entropy, length) {
  let score = Math.min(100, Math.floor((entropy / 60) * 100));
  if (length >= 12) score = Math.min(100, score + 10);
  else if (length >= 8) score = Math.min(100, score + 5);
  return score;
}

function scoreToText(score, isCommon) {
  if (isCommon) return "Very Weak";
  if (score < 25) return "Very Weak";
  if (score < 45) return "Weak";
  if (score < 65) return "Fair";
  if (score < 85) return "Strong";
  return "Very Strong";
}

// DOM
const pwd = document.getElementById('pwd');
const scoreText = document.getElementById('scoreText');
const entropyText = document.getElementById('entropyText');
const lenText = document.getElementById('lenText');
const ratingText = document.getElementById('ratingText');
const checkBtn = document.getElementById('checkBtn');
const copyBtn = document.getElementById('copyBtn');
const showBtn = document.getElementById('showBtn');
const warn = document.getElementById('warn');
const suggestList = document.getElementById('suggestList');
const meterFg = document.querySelector('.meter-fg');

let lastServerResult = null;

// update circular meter
function updateMeter(score) {
  const circumference = 2 * Math.PI * 48; // r = 48
  const offset = circumference - (score / 100) * circumference;
  meterFg.style.strokeDashoffset = offset;
  scoreText.textContent = score;
  // change color by score via stroke opacity (gradient already there)
  if (score < 35) meterFg.style.filter = 'drop-shadow(0 6px 14px rgba(255,77,77,0.16))';
  else if (score < 65) meterFg.style.filter = 'drop-shadow(0 6px 14px rgba(255,184,77,0.12))';
  else meterFg.style.filter = 'drop-shadow(0 6px 14px rgba(76,209,55,0.16))';
}

// local realtime feedback (no server call)
pwd.addEventListener('input', () => {
  const value = pwd.value;
  const entropy = calcEntropy(value);
  const score = entropyToScore(entropy, value.length);
  updateMeter(score);
  entropyText.textContent = entropy;
  lenText.textContent = value.length;
  // rating based on local calc (we don't know if it's common yet)
  ratingText.textContent = scoreToText(score, false);
  warn.hidden = true;
  // suggestions quick local
  updateSuggestionsLocal(value);
});

// quick local suggestions
function updateSuggestionsLocal(pw) {
  const s = [];
  if (pw.length === 0) {
    s.push("Type a password to get suggestions.");
  } else {
    if (pw.length < 12) s.push("Use at least 12 characters.");
    if (!/[A-Z]/.test(pw)) s.push("Add uppercase letters (A–Z).");
    if (!/[a-z]/.test(pw)) s.push("Add lowercase letters (a–z).");
    if (!/[0-9]/.test(pw)) s.push("Include digits (0–9).");
    if (!/[^A-Za-z0-9]/.test(pw)) s.push("Include special characters (e.g., @!#).");
    if (pw.length >= 20) s.push("Nice! Consider a memorable passphrase or mix of words.");
  }
  renderSuggestions(s);
}

function renderSuggestions(list) {
  suggestList.innerHTML = '';
  list.forEach(it => {
    const li = document.createElement('li');
    li.textContent = it;
    suggestList.appendChild(li);
  });
}

// server-side check (dictionary + authoritative score)
checkBtn.addEventListener('click', async () => {
  const pw = pwd.value;
  const form = new URLSearchParams();
  form.append('password', pw);
  checkBtn.disabled = true;
  checkBtn.textContent = 'Checking...';
  try {
    const res = await fetch('/api/check', {
      method: 'POST',
      body: form
    });
    const json = await res.json();
    lastServerResult = json;
    // update UI with server data
    updateMeter(json.score);
    entropyText.textContent = json.entropy;
    lenText.textContent = json.length;
    ratingText.textContent = json.rating;
    warn.hidden = !json.common;
    renderSuggestions(json.suggestions.length ? json.suggestions : ['No suggestions, strong password!']);
  } catch (e) {
    console.error(e);
    alert('Server error. Make sure the Flask app is running and you called the correct endpoint.');
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = 'Run full check';
  }
});

// copy password (be careful)
copyBtn.addEventListener('click', () => {
  if (!pwd.value) return;
  navigator.clipboard.writeText(pwd.value).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy password', 1200);
  }).catch(() => {
    alert('Unable to copy. Your browser may block clipboard access.');
  });
});

// show/hide
showBtn.addEventListener('click', () => {
  if (pwd.type === 'password') {
    pwd.type = 'text';
    showBtn.textContent = 'Hide';
  } else {
    pwd.type = 'password';
    showBtn.textContent = 'Show';
  }
});

// init
updateMeter(0);
renderSuggestions(['Type a password to get suggestions.']);
