// auth.js
function showLoginScreen() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h2>Entrar</h2>
        <form id="loginForm">
          <input type="text" name="username" placeholder="Usuário" required />
          <input type="password" name="password" placeholder="Senha" required />
          <button type="submit">Entrar</button>
        </form>
        <button onclick="showRegisterScreen()">Criar Conta</button>
      </div>
    </div>
  `;
  document.getElementById('loginForm').onsubmit = handleLogin;
}

function showRegisterScreen() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="container">
      <div class="card">
        <h2>Criar Conta</h2>
        <form id="registerForm">
          <input type="text" name="username" placeholder="Nome" required />
          <input type="password" name="password" placeholder="Senha" required />
          <button type="submit">Registrar</button>
        </form>
        <button onclick="showLoginScreen()">Voltar</button>
      </div>
    </div>
  `;
  document.getElementById('registerForm').onsubmit = handleRegister;
}

function handleLogin(e) {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value;

  db.ref('users/' + username).once('value')
    .then(snapshot => {
      const user = snapshot.val();
      if (user && user.password === password) {
        localStorage.setItem('currentUser', username);
        showToast('Bem-vindo!');
        loadDashboard(username);
      } else {
        alert('Usuário ou senha incorretos.');
      }
    });
}

function handleRegister(e) {
  e.preventDefault();
  const username = e.target.username.value.trim();
  const password = e.target.password.value;

  db.ref('users/' + username).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        alert('Usuário já existe.');
        return;
      }

      const newUser = {
        username,
        password,
        balance: 1000,
        gameBalance: 0,
        helpCount: 3,
        gamesPlayed: 0,
        xp: 0,
        level: 1,
        iban: `OSPT${Math.floor(Math.random() * 9000000000000000 + 1000000000000000)}`,
        transactions: [],
        investments: []
      };

      db.ref('users/' + username).set(newUser)
        .then(() => {
          localStorage.setItem('currentUser', username);
          showToast('Conta criada! +100 OSD!');
          loadDashboard(username);
        });
    });
}
