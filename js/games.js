// games.js - NeoVault OS
let gameBalance = 0;
let helpCount = 0;
let gamesPlayed = 0;

const quizzes = {
  capitals: [
    { q: "Qual é a capital da Austrália?", o: ["Sydney", "Canberra", "Melbourne", "Perth"], c: 1, v: 10 },
    { q: "Qual é a capital do Egito?", o: ["Alexandria", "Luxor", "Cairo", "Aswan"], c: 2, v: 12 },
    { q: "Qual é a capital da Noruega?", o: ["Oslo", "Bergen", "Trondheim", "Stavanger"], c: 0, v: 15 }
  ],
  math_hard: [
    { q: "Qual é a raiz quadrada de 169?", o: ["11", "12", "13", "14"], c: 2, v: 14 },
    { q: "Quanto é 17 x 23?", o: ["391", "381", "401", "371"], c: 0, v: 16 }
  ],
  science: [
    { q: "Qual é o elemento químico com símbolo O?", o: ["Ouro", "Oxigênio", "Ósmio", "Oganessônio"], c: 1, v: 10 },
    { q: "Qual é o planeta mais próximo do Sol?", o: ["Vênus", "Terra", "Mercúrio", "Marte"], c: 2, v: 12 }
  ],
  riddles: [
    { q: "O que é cheio de furos mas segura água?", o: ["Esponja", "Queijo", "Rede", "Balde"], c: 0, v: 20 },
    { q: "Quanto tempo leva para o Sol ficar verde?", o: ["Nunca", "100 anos", "1000 anos", "Depende"], c: 0, v: 25 }
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
        ${gameBalance > 0 ? `<button onclick="generateRedemptionCode('${user.username}')" class="btn btn-primary">Gerar Código</button>` : ''}
      </div>
      <div class="card">
        <h3>Escolha</h3>
        <button onclick="startGame('${user.username}', 'capitals')" class="btn btn-secondary">🌍 Capitais</button>
        <button onclick="startGame('${user.username}', 'math_hard')" class="btn btn-secondary">🧮 Matemática</button>
        <button onclick="startGame('${user.username}', 'science')" class="btn btn-secondary">🔬 Ciência</button>
        <button onclick="startGame('${user.username}', 'riddles')" class="btn btn-secondary">🧠 Adivinhas</button>
      </div>
      <button onclick="loadDashboard('${user.username}')" class="btn btn-ghost">Voltar</button>
    </div>
  `;
  lucide.createIcons();
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
          ${q.o.map((opt, i) => `<button onclick="checkAnswer(${i}, ${q.c}, ${q.v}, ${current < 2})" class="btn btn-secondary">${opt}</button>`).join('')}
          ${helpCount > 0 ? `<button onclick="useHelp(${current})" class="btn btn-info">Usar Ajuda</button>` : ''}
        </div>
        <button onclick="showGamesScreen()" class="btn btn-ghost">Sair</button>
      </div>
    `;
    lucide.createIcons();
  }

  window.checkAnswer = (ua, ca, value, hasNext) => {
    if (ua === ca) {
      totalEarned += value;
      showToast(`+${value} OSD!`);
      showSticker('🎉');
    } else {
      showToast('❌ Errado!');
      showSticker('😢');
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
        showToast(`🎯 Ganhou ${totalEarned} OSD!`);
        setTimeout(() => showGamesScreen(), 1000);
      });
    }
  };

  window.useHelp = (curr) => {
    if (helpCount > 0) {
      helpCount--;
      db.ref('users/' + username + '/helpCount').set(helpCount);
      const q = questions[curr];
      const correct = q.c;
      let percs = new Array(q.o.length).fill(0);
      percs[correct] = Math.floor(Math.random() * 21 + 40);
      let remaining = 100 - percs[correct];
      const numOthers = q.o.length - 1;
      const base = Math.floor(remaining / numOthers);
      let extra = remaining % numOthers;

      for (let i = 0; i < q.o.length; i++) {
        if (i !== correct) {
          percs[i] = base + (extra > 0 ? 1 : 0);
          extra--;
        }
      }

      alert("Percentagens da audiência:\n" + q.o.map((opt, i) => `${opt}: ${percs[i]}%`).join('\n'));
      showQuestion();
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
          <div class="card text-center">
            <h3 class="text-xl font-bold mb-4">Código Gerado! 🎉</h3>
            <p class="text-muted mb-2">Resgate:</p>
            <p class="balance-display">${amount} <span class="osd">OSD</span></p>
            <p class="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mb-4">${code}</p>
            <button onclick="copyToClipboard('${code}')" class="btn btn-primary mb-3">📋 Copiar Código</button>
            <button onclick="loadDashboard('${username}')" class="btn btn-ghost">Voltar ao Dashboard</button>
          </div>
        </div>
      `;
      showToast('Código gerado! Copie e use no depósito.');
      lucide.createIcons();
    });
  });
}
