// dashboard.js
function loadDashboard(username) {
  db.ref('users/' + username).on('value', snapshot => {
    const user = snapshot.val();
    if (!user) {
      showToast('Usuário não encontrado.');
      showLoginScreen();
      return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="container">
        <div class="card">
          <h2>Olá, ${user.username}!</h2>
          <p>Saldo: ${user.balance} OSD</p>
        </div>
        <button onclick="showGamesScreen()">Jogar</button>
      </div>
    `;
  });
}
