// js/transactions.js - Saque, transferência e resgate
function showTransactionModal(type) {
  const user = getCurrentUser();
  if (!user) return;

  let modalHTML = '';

  if (type === 'withdraw') {
    modalHTML = `
      <h3>Sacar OSD</h3>
      <input type="number" id="amount" placeholder="50" class="w-full p-3 border rounded-xl my-3" />
      <button onclick="confirmWithdraw()" class="btn btn-primary w-full">Sacar</button>
    `;
  } else if (type === 'transfer') {
    modalHTML = `
      <h3>Transferir por IBAN</h3>
      <input type="text" id="iban" placeholder="OSPT1234567890123456" class="w-full p-3 border rounded-xl my-2" />
      <input type="number" id="amount" placeholder="100" class="w-full p-3 border rounded-xl my-2" />
      <button onclick="confirmTransfer()" class="btn btn-primary w-full">Enviar</button>
    `;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="card">${modalHTML}</div>
      <button onclick="loadDashboard('${user.username}')" class="btn btn-ghost mt-3">Voltar</button>
    </div>
  `;
  setTimeout(() => lucide.createIcons(), 100);
}

function confirmWithdraw() {
  const user = getCurrentUser();
  const amount = parseFloat(document.getElementById('amount').value);

  if (!amount || amount <= 0) {
    alert('Valor inválido.');
    return;
  }

  db.ref('users/' + user.username).once('value')
    .then(snapshot => {
      const userData = snapshot.val();
      if (userData.balance < amount) {
        alert('Saldo insuficiente.');
        return;
      }

      updateUserBalance(user.username, -amount);
      addTransaction(user.username, 'withdraw', amount);
      showToast(`-${amount} OSD sacado!`);
      setTimeout(() => loadDashboard(user.username), 500);
    });
}

function confirmTransfer() {
  const user = getCurrentUser();
  const iban = document.getElementById('iban').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);

  if (!iban.startsWith('OSPT') || iban.length !== 22) {
    alert('IBAN inválido.');
    return;
  }

  if (!amount || amount <= 0) {
    alert('Valor inválido.');
    return;
  }

  db.ref('users').once('value')
    .then(snapshot => {
      let targetUser = null;
      snapshot.forEach(child => {
        const userData = child.val();
        if (userData.iban === iban) {
          targetUser = { key: child.key, ...userData };
        }
      });

      if (!targetUser) {
        alert('IBAN não encontrado.');
        return;
      }

      db.ref('users/' + user.username).once('value')
        .then(userSnap => {
          if (userSnap.val().balance < amount) {
            alert('Saldo insuficiente.');
            return;
          }

          updateUserBalance(user.username, -amount);
          updateUserBalance(targetUser.key, amount);
          addTransaction(user.username, 'transfer_out', amount, targetUser.key);
          addTransaction(targetUser.key, 'transfer_in', amount, user.username);
          showToast(`${amount} OSD enviado para ${targetUser.key}!`);
          setTimeout(() => loadDashboard(user.username), 1000);
        });
    });
}

// Mostra modal para resgatar código
function showRedemptionModal() {
  const user = getCurrentUser();
  if (!user) return;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h3 class="text-xl font-bold mb-4">Resgatar Código de Jogo</h3>
        <p class="text-sm text-muted mb-4">Digite o código gerado nos jogos.</p>
        <div class="input-group">
          <label>Código</label>
          <input type="text" id="redeemCode" placeholder="OSD-ALICE-123456789" class="w-full p-3 rounded-xl border" />
        </div>
        <button onclick="redeemCode()" class="btn btn-primary w-full mt-3">Resgatar</button>
        <button onclick="loadDashboard('${user.username}')" class="btn btn-ghost w-full mt-2">Voltar</button>
      </div>
    </div>
  `;
  setTimeout(() => lucide.createIcons(), 100);
}

// Resgata um código de jogo
function redeemCode() {
  const user = getCurrentUser();
  const code = document.getElementById('redeemCode').value.trim();

  if (!code) {
    alert('Digite um código.');
    return;
  }

  db.ref('redemption_codes/' + code).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data || data.used || data.username !== user.username) {
        alert('Código inválido ou já usado.');
        return;
      }

      updateUserBalance(user.username, data.amount);
      addTransaction(user.username, 'deposit', data.amount, 'Código de Jogo');

      db.ref('redemption_codes/' + code).update({ used: true });

      showToast(`+${data.amount} OSD resgatados!`);
      setTimeout(() => loadDashboard(user.username), 1000);
    })
    .catch(err => {
      console.error('Erro ao resgatar código:', err);
      alert('Erro ao verificar código.');
    });
}

// Mostra extrato completo
function showFullTransactions(username) {
  db.ref('users/' + username).once('value').then(snapshot => {
    const user = snapshot.val();
    const allTrans = Object.values(user.transactions || {}).reverse();
    const html = `
      <div class="container">
        <div class="header">
          <h2>Extrato Completo</h2>
        </div>
        <div class="card">
          ${allTrans.length ? allTrans.map(t => `
            <div class="py-2 border-b">
              <p><strong>${t.type}:</strong> ${t.amount} OSD</p>
              <p class="text-sm text-muted">${t.date} - ${t.time}</p>
            </div>
          `).join('') : '<p class="text-muted">Nenhuma transação</p>'}
        </div>
        <button onclick="loadDashboard('${username}')" class="btn btn-ghost mt-4">Voltar</button>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    setTimeout(() => lucide.createIcons(), 100);
  });
}
