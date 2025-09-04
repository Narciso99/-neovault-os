// games.js - NeoBank OS
let gameBalance = 0;
let helpCount = 0;
let gamesPlayed = 0;

const quizzes = {
  capitals: [
    { q: "Qual é a capital da Austrália?", o: ["Sydney", "Canberra", "Melbourne", "Perth"], c: 1, v: 10 },
    { q: "Qual é a capital do Egito?", o: ["Alexandria", "Luxor", "Cairo", "Aswan"], c: 2, v: 12 }
  ],
  math_hard: [
    { q: "Qual é a raiz quadrada de 169?", o: ["11", "12", "13", "14"], c: 2, v: 14 }
  ],
  science: [
    { q: "Qual é o elemento químico com símbolo O?", o: ["Ouro", "Oxigênio", "Ósmio", "Oganessônio"], c: 1, v: 10 }
  ]
};

function showGamesScreen() {
  const user = getCurrentUser();
  if (!user) return;

  db.ref('users/' + user.username).once('value').then(snapshot => {
    const data = snapshot.val() || {};
    gameBalance = data.gameBalance || 0;
    helpCount = data.helpCount || 0;
    gamesPlayed = data.gamesPlayed || 0;
    renderGamesScreen(user);
  });
}

function renderGamesScreen(user) {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <div class="card text-center">
        <h2>Arena de Jogos 🎮</h2>
        <p>Saldo: ${gameBalance.toFixed(2)} OSD</p>
        <p>Ajudas: ${helpCount}</p>
        ${gameBalance > 0 ? `<button onclick="generateRedemptionCode('${user.username}')">Gerar Código</button>` : ''}
      </div>
      <div class="card">
        <h3>Escolha</h3>
        <button onclick="startGame('${user.username}', 'capitals')">🌍 Capitais</button>
      </div>
      <button onclick="loadDashboard('${user.username}')">Voltar</button>
    </div>
  `;
}

function startGame(username, type) {
  const questions = [...quizzes[type]].sort(() => Math.random() - 0.5).slice(0, 3);
  let totalEarned = 0;
  let current = 0;

  function showQuestion() {
    const q = questions[current];
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container">
        <div class="card">
          <h3>Pergunta ${current + 1}/3</h3>
          <p>${q.q}</p>
          ${q.o.map((opt, i) => `<button onclick="checkAnswer(${i}, ${q.c}, ${q.v}, ${current < 2})">${opt}</button>`).join('')}
          ${helpCount > 0 ? `<button onclick="useHelp()">Usar Ajuda</button>` : ''}
        </div>
        <button onclick="showGamesScreen()">Sair</button>
      </div>
    `;
  }

  window.checkAnswer = (ua, ca, value, hasNext) => {
    if (ua === ca) {
      totalEarned += value;
      showToast(`+${value} OSD!`);
    } else {
      showToast('Errado!');
    }

    if (hasNext) {
      current++;
      setTimeout(showQuestion, 800);
    } else {
      gameBalance += totalEarned;
      gamesPlayed++;
      if (gamesPlayed % 10 === 0) helpCount += 3;

      db.ref('users/' + username).update({
        gameBalance,
        gamesPlayed,
        helpCount
      }).then(() => {
        showToast(`Ganhou ${totalEarned} OSD!`);
        setTimeout(() => showGamesScreen(), 1000);
      });
    }
  };

  window.useHelp = () => {
    if (helpCount > 0) {
      helpCount--;
      db.ref('users/' + username + '/helpCount').set(helpCount);
      alert('Ajuda usada!');
      showQuestion(); // atualiza
    }
  };

  showQuestion();
}

function generateRedemptionCode(username) {
  db.ref('users/' + username + '/gameBalance').once('value').then(snapshot => {
    const amount = snapshot.val() || 0;
    if (amount <= 0) {
      alert('Jogue primeiro!');
      return;
    }

    const code = `OSD-${username.toUpperCase()}-${Date.now()}`;
    db.ref('redemption_codes/' + code).set({
      username,
      amount,
      used: false,
      ts: Date.now()
    }).then(() => db.ref('users/' + username + '/gameBalance').set(0))
    .then(() => {
      const app = document.getElementById('app');
      app.innerHTML = `
        <div class="container">
          <div class="card">
            <h3>Código Gerado! 🎉</h3>
            <p>${amount} OSD</p>
            <p>${code}</p>
            <button onclick="copyToClipboard('${code}')">Copiar</button>
            <button onclick="loadDashboard('${username}')">Voltar</button>
          </div>
        </div>
      `;
      showToast('Código gerado!');
    });
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('Código copiado!'))
    .catch(err => alert('Erro: ' + err.message));
}
