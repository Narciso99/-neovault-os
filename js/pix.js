// js/pix.js - Sistema de Pix entre usuários
function showPixScreen() {
  const user = getCurrentUser();
  if (!user) return;

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="header">
        <h2>Pix - NeoVault OS</h2>
      </div>
      <div class="card">
        <h3>Sua Chave Pix</h3>
        <p class="text-primary mt-2">${user.username}@neovault.os</p>
        <button onclick="copyPixKey('${user.username}')" class="btn btn-secondary mt-3">📋 Copiar Chave</button>
      </div>
      <div class="card">
        <h3>Enviar Pix</h3>
        <div class="input-group">
          <label>Chave (usuário@neovault.os)</label>
          <input type="text" id="pixKey" placeholder="alice@neovault.os" class="w-full p-3 rounded-xl border" />
        </div>
        <div class="input-group">
          <label>Valor (OSD)</label>
          <input type="number" id="pixAmount" placeholder="100" class="w-full p-3 rounded-xl border" />
        </div>
        <button onclick="sendPix()" class="btn btn-primary w-full mt-3">Enviar Pix</button>
      </div>
      <button onclick="loadDashboard('${user.username}')" class="btn btn-ghost mt-4">Voltar</button>
    </div>
  `;
  setTimeout(() => lucide.createIcons(), 100);
}

function copyPixKey(key) {
  navigator.clipboard.writeText(key + '@neovault.os');
  showToast('Chave Pix copiada!');
}

function sendPix() {
  const keyInput = document.getElementById('pixKey');
  const amountInput = document.getElementById('pixAmount');
  const key = keyInput.value.trim().replace('@neovault.os', '');
  const amount = parseFloat(amountInput.value);

  if (!key || !amount || amount <= 0) {
    alert('Preencha todos os campos.');
    return;
  }

  db.ref('users/' + key).once('value')
    .then(snapshot => {
      if (!snapshot.exists()) {
        alert('Usuário não encontrado.');
        return;
      }

      const sender = getCurrentUser();
      db.ref('users/' + sender.username).once('value')
        .then(userSnap => {
          if (userSnap.val().balance < amount) {
            alert('Saldo insuficiente.');
            return;
          }

          // Atualiza saldos
          updateUserBalance(sender.username, -amount);
          updateUserBalance(key, amount);

          // Adiciona transações
          addTransaction(sender.username, 'pix_out', amount, key);
          addTransaction(key, 'pix_in', amount, sender.username);

          // Notificações
          showToast(`${amount} OSD enviado via Pix!`);
          setTimeout(() => loadDashboard(sender.username), 1500);
        });
    })
    .catch(err => {
      console.error('Erro ao enviar Pix:', err);
      alert('Erro ao enviar Pix.');
    });
}
