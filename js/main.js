// main.js - NeoVault OS
function createThemeToggle() {
  if (document.getElementById('theme-toggle')) return;

  const toggle = document.createElement('button');
  toggle.id = 'theme-toggle';
  toggle.innerHTML = '<i data-lucide="sun" class="w-6 h-6"></i>';
  toggle.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px;
    border-radius: 50%; background: #003366; color: white; display: flex;
    align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    z-index: 1000; cursor: pointer; border: none; outline: none;
  `;

  toggle.onclick = () => {
    document.documentElement.classList.toggle('dark');
    const icon = toggle.querySelector('i');
    icon.setAttribute('data-lucide', document.documentElement.classList.contains('dark') ? 'moon' : 'sun');
    lucide.createIcons();
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  };

  document.body.appendChild(toggle);
  lucide.createIcons();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('NeoVault OS', { body: msg, icon: 'img/logo.svg' });
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('✅ Copiado!'))
    .catch(err => alert('Falha ao copiar: ' + err.message));
}

function showSticker(emoji) {
  const sticker = document.createElement('div');
  sticker.innerHTML = `<span style="
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 80px; z-index: 1000; animation: pop 0.6s ease-out;
  ">${emoji}</span>`;
  document.body.appendChild(sticker);
  setTimeout(() => document.body.removeChild(sticker), 1000);
}

function getCurrentUser() {
  return { username: localStorage.getItem('currentUser') };
}

function updateUserBalance(username, amount) {
  const ref = db.ref('users/' + username);
  ref.transaction(user => {
    if (user) {
      user.balance += amount;
      user.xp = (user.xp || 0) + amount * 0.1;
      user.level = Math.floor(user.xp / 100) + 1;
    }
    return user;
  });
}

function addTransaction(username, type, amount, target = null) {
  const transaction = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    type,
    amount,
    target
  };
  db.ref('users/' + username + '/transactions').push(transaction);
}

document.addEventListener('DOMContentLoaded', () => {
  createThemeToggle();
  const user = localStorage.getItem('currentUser');
  if (user) loadDashboard(user);
  else showLoginScreen();
  setTimeout(() => lucide.createIcons(), 200);
});
