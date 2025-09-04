// card.js - Cartão Virtual
function showCardScreen() {
  const user = getCurrentUser();
  const last4 = user.username.slice(-4).toUpperCase().padStart(4, 'X');
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <div class="header">
        <h2>Cartão Virtual Visa</h2>
      </div>
      <div class="card relative overflow-hidden" style="background: linear-gradient(135deg, #003366, #0055cc); color: white; height: 220px; border-radius: 20px;">
        <div class="absolute top-6 right-6">
          <i data-lucide="wifi" class="text-white opacity-70"></i>
        </div>
        <div class="absolute bottom-6 left-6">
          <div class="text-sm opacity-80">Número</div>
          <div class="text-lg font-mono">**** **** **** ${last4}</div>
          <div class="flex justify-between mt-4 text-sm">
            <span>VAL: 05/28</span>
            <span>${user.username.toUpperCase()}</span>
          </div>
          <div class="mt-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" class="h-8 opacity-90" />
          </div>
        </div>
      </div>
      <div class="card">
        <h3>Limite Disponível</h3>
        <p class="text-primary text-xl mt-2">1.500,00 OSD</p>
      </div>
      <button onclick="loadDashboard('${user.username}')" class="btn btn-ghost">Voltar</button>
    </div>
  `;
  setTimeout(() => lucide.createIcons(), 100);
}
