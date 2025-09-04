// dashboard.js - NeoVault OS
let currentUser = null;

function loadDashboard(username) {
  currentUser = username;
  const userRef = db.ref('users/' + username);
  
  userRef.on('value', snapshot => {
    const user = snapshot.val();
    if (!user) {
      showToast('Usuário não encontrado.');
      showLoginScreen();
      return;
    }
    user.level = Math.floor((user.xp || 0) / 100) + 1;
    renderDashboard(user, username);
  });
}

function renderDashboard(user, username) {
  const app = document.getElementById('app');
  if (!app) return;

  // Últimas 5 transações
  const transactions = Object.values(user.transactions || {}).slice(-5).reverse();
  const transactionItems = transactions.length ? transactions.map(t => {
    const icons = {
      deposit: 'plus-circle text-green-500',
      withdraw: 'minus-circle text-red-500',
      pix_in: 'qr-code text-blue-500',
      pix_out: 'qr-code text-orange-500',
      transfer_in: 'arrow-down-right text-purple-500',
      transfer_out: 'arrow-up-right text-gray-500',
      investment_gain: 'trending-up text-indigo-500'
    }[t.type] || 'circle';

    const label = {
      deposit: `+${t.amount} OSD`,
      withdraw: `-${t.amount} OSD`,
      pix_in: `+${t.amount} (Pix) ← ${t.target}`,
      pix_out: `-${t.amount} (Pix) → ${t.target}`,
      transfer_in: `+${t.amount} (IBAN) ← ${t.target}`,
      transfer_out: `-${t.amount} (IBAN) → ${t.target}`,
      investment_gain: `💰 +${t.amount.toFixed(2)} OSD de investimento`
    }[t.type] || t.type;

    const amountClass = {
      deposit: 'amount-positive',
      pix_in: 'amount-positive',
      transfer_in: 'amount-positive',
      investment_gain: 'amount-investment',
      withdraw: 'amount-negative',
      pix_out: 'amount-negative',
      transfer_out: 'amount-negative'
    }[t.type] || 'amount-negative';

    return `
      <li class="transaction-item">
        <div class="transaction-icon">
          <i data-lucide="${icons.split(' ')[0]}" class="w-5 h-5"></i>
        </div>
        <div class="transaction-content">
          <p class="transaction-label">${label}</p>
          <p class="transaction-date">${t.date}</p>
        </div>
        <span class="transaction-amount ${amountClass}">${t.amount} OSD</span>
      </li>
    `;
  }).join('') : '<li class="text-muted text-center py-2">Nenhuma transação</li>';

  app.innerHTML = `
    <header class="header">
      <div class="flex items-center gap-3">
        <img src="${user.avatar}" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-blue-300 shadow-sm" />
        <div>
          <h2 class="text-lg">Olá, ${user.username}!</h2>
          <p class="text-sm text-muted">Nível ${user.level}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="btnLogout" title="Sair"><i data-lucide="log-out" class="w-5 h-5"></i></button>
      </div>
    </header>

    <main class="container">
      <div class="card text-center">
        <p class="text-muted">Saldo disponível</p>
        <p class="balance-display">${user.balance.toFixed(2)} <span class="osd">OSD</span></p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        <button onclick="showTransactionModal('withdraw')" class="btn btn-secondary py-4">Sacar</button>
        <button onclick="showTransactionModal('transfer')" class="btn btn-secondary py-4">Transferir</button>
        <button onclick="showPixScreen()" class="btn btn-secondary py-4">Pix</button>
        <button onclick="showInvestmentsScreen()" class="btn btn-secondary py-4">Investir</button>
      </div>

      <div class="card">
        <h3>IBAN</h3>
        <p class="font-mono">${user.iban}</p>
      </div>

      <button onclick="showGamesScreen()" class="btn btn-primary w-full mb-2">Jogar e Ganhar OSD</button>
      <button onclick="showRedemptionModal()" class="btn btn-secondary w-full">Resgatar Código</button>
    </main>
  `;

  document.getElementById('btnLogout').onclick = () => {
    db.ref('users/' + currentUser).off();
    localStorage.removeItem('currentUser');
    showToast('Até logo!');
    showLoginScreen();
  };

  lucide.createIcons();
}
