// auth.js - NeoVault OS
function showLoginScreen() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="container">
      <div class="text-center mb-8">
        <img src="img/logo.svg" alt="NeoVault OS" class="w-16 h-16 mx-auto mb-3" />
        <h1 class="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">NeoVault OS</h1>
      </div>
      <div class="card">
        <form id="loginForm" class="space-y-4">
          <div class="input-group">
            <label>Usuário</label>
            <input type="text" name="username" required class="w-full p-3 rounded-xl border" />
          </div>
          <div class="input-group">
            <label>Senha</label>
            <input type="password" name="password" required class="w-full p-3 rounded-xl border" />
          </div>
          <button type="submit" class="btn btn-primary">Entrar</button>
          <button type="button" id="btnRegister" class="btn btn-secondary mt-2">Criar Conta</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('loginForm').onsubmit = handleLogin;
  document.getElementById('btnRegister').onclick = showRegisterScreen;
  setTimeout(() => lucide.createIcons(), 100);
}

function showRegisterScreen() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="container">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">Criar Conta</h1>
      </div>
      <div class="card">
        <form id="registerForm" class="space-y-4">
          <div class="input-group">
            <label>Nome</label>
            <input type="text" name="username" required class="w-full p-3 rounded-xl border" />
          </div>
          <div class="input-group">
            <label>Senha</label>
            <input type="password" name="password" required class="w-full p-3 rounded-xl border" />
          </div>
          <button type="submit" class="btn btn-primary">Registrar</button>
          <button type="button" id="btnBack" class="btn btn-secondary mt-2">Voltar</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('registerForm').onsubmit = handleRegister;
  document.getElementById('btnBack').onclick = showLoginScreen;
  setTimeout(() => lucide.createIcons(), 100);
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

      const iban = `OSPT${Math.floor(Math.random() * 9000000000000000 + 1000000000000000)}`;
      const email = `${username}@neovault.com`;

      const newUser = {
        username,
        password,
        avatar: 'img/avatar-default.png',
        balance: 1000,
        gameBalance: 0,
        helpCount: 3,
        gamesPlayed: 0,
        xp: 0,
        level: 1,
        iban: iban,
        email: email,
        transactions: [],
        investments: [],
        achievements: [],
        createdAt: new Date().toISOString()
      };

      db.ref('users/' + username).set(newUser)
        .then(() => {
          localStorage.setItem('currentUser', username);
          showToast('Conta criada! +100 OSD!');
          loadDashboard(username);
        });
    });
}
