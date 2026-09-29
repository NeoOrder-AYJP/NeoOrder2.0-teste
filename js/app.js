/**
 * Main Application Logic & View Router for Sabor & Gestão
 */

// Application State
const state = {
  currentView: 'landing', // landing, login-mesa, login-equipe, dashboard-cliente, dashboard-atendente, dashboard-gerente
  cart: [], // [{ prato_id, prato_nome, quantidade, preco_unitario }]
  sliderIndex: 0,
  sliderInterval: null,
  audioEnabled: false,
  billingFilter: 'mes', // dia, semana, mes
  activeManagerTab: 'pedidos' // pedidos, chamados, cardapio, estoque, mesas, equipe, faturamento, backup
};

// Audio Alert Synthesizer for Staff Calls (RF-29, RF-30)
function playNotificationSound() {
  if (!state.audioEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn("Audio playback not allowed yet", e);
  }
}

// Router and View Switching
function navigateTo(viewName) {
  state.currentView = viewName;
  clearInterval(state.sliderInterval);
  updateNavigationUI();
  renderCurrentView();
  window.scrollTo(0, 0);
}

function updateNavigationUI() {
  const currentUser = AuthManager.getCurrentUser();
  const userBadge = document.getElementById('user-badge');
  const floatingCallBtn = document.getElementById('floating-call-btn-container');

  if (currentUser) {
    userBadge.classList.remove('hidden');
    document.getElementById('user-display-name').textContent = currentUser.nome;
    document.getElementById('user-display-role').textContent = currentUser.tipo === 'mesa' ? 'Mesa' : currentUser.perfil;

    // Show floating call button if user is client mesa
    if (currentUser.tipo === 'mesa' && state.currentView === 'dashboard-cliente') {
      floatingCallBtn.classList.remove('hidden');
    } else {
      floatingCallBtn.classList.add('hidden');
    }
  } else {
    userBadge.classList.add('hidden');
    floatingCallBtn.classList.add('hidden');
  }

  // Active state for nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const target = btn.getAttribute('data-target-view');
    if (target === state.currentView) {
      btn.className = "nav-btn px-space-md py-space-sm transition-colors text-sm font-bold rounded-xl bg-surface-container-highest text-primary shadow-sm";
    } else {
      btn.className = "nav-btn px-space-md py-space-sm transition-colors text-sm font-semibold rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container";
    }
  });
}

function renderCurrentView() {
  const viewport = document.getElementById('app-viewport');
  const db = StorageManager.getDB();
  const currentUser = AuthManager.getCurrentUser();

  switch (state.currentView) {
    case 'landing':
      viewport.innerHTML = renderLandingPage(db);
      initLandingPageSlider();
      break;

    case 'login-mesa':
      viewport.innerHTML = renderLoginMesaPage(db);
      break;

    case 'login-equipe':
      viewport.innerHTML = renderLoginEquipePage();
      break;

    case 'dashboard-cliente':
      if (!currentUser || currentUser.tipo !== 'mesa') {
        navigateTo('login-mesa');
        return;
      }
      viewport.innerHTML = renderDashboardCliente(db, currentUser);
      break;

    case 'dashboard-atendente':
      if (!currentUser || currentUser.tipo !== 'funcionario') {
        navigateTo('login-equipe');
        return;
      }
      viewport.innerHTML = renderDashboardAtendente(db);
      break;

    case 'dashboard-gerente':
      if (!currentUser || currentUser.perfil !== 'Gerente') {
        navigateTo('login-equipe');
        return;
      }
      viewport.innerHTML = renderDashboardGerente(db);
      break;

    default:
      viewport.innerHTML = renderLandingPage(db);
      break;
  }
}

/* ==========================================================================
   1. LANDING PAGE (PRÉ-LOGIN) VIEW
   ========================================================================== */
function renderLandingPage(db) {
  const destaques = db.pratos.filter(p => p.ativo && p.destaque);
  const slides = destaques.length > 0 ? destaques : db.pratos.filter(p => p.ativo).slice(0, 3);

  return `
    <div class="w-full flex flex-col">
      <!-- HERO ROTATING SLIDER (RF-01, RF-02, RF-40, RNF-06) -->
      <section class="relative bg-secondary text-white py-12 md:py-16 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <div class="lg:col-span-6 space-y-6 z-10">
            <div class="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary-fixed">
              <span class="material-symbols-outlined text-[16px]">stars</span>
              <span>Destaques Gastronômicos</span>
            </div>

            <h1 id="slider-title" class="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white transition-all">
              ${slides[0]?.nome || 'Gastronomia Exclusiva'}
            </h1>

            <p id="slider-desc" class="text-base text-surface-container-highest/90 max-w-xl leading-relaxed">
              ${slides[0]?.descricao || 'Aproveite nossos pratos preparados com ingredientes frescos e selecionados.'}
            </p>

            <div class="flex flex-wrap gap-4 pt-2">
              <button onclick="handleHeroOrderClick()" class="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-base shadow-lg transition transform active:scale-95 flex items-center gap-2">
                <span class="material-symbols-outlined">restaurant_menu</span>
                <span>Fazer Pedido em Mesa</span>
              </button>
              <button onclick="navigateTo('login-equipe')" class="px-6 py-3.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-white font-semibold text-base border border-white/20 transition flex items-center gap-2">
                <span class="material-symbols-outlined">badge</span>
                <span>Área do Funcionário</span>
              </button>
            </div>

            <!-- Slider Dots Nav -->
            <div class="flex items-center gap-2 pt-4" id="slider-dots">
              ${slides.map((_, i) => `
                <button onclick="setSlide(${i})" class="w-3 h-3 rounded-full transition-all ${i === 0 ? 'bg-primary w-8' : 'bg-white/40'}" id="dot-${i}"></button>
              `).join('')}
            </div>
          </div>

          <!-- Slider Image Container -->
          <div class="lg:col-span-6 relative flex justify-center">
            <div class="w-full max-w-lg h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative">
              <img id="slider-img" src="${slides[0]?.imagem}" alt="${slides[0]?.nome}" class="w-full h-full object-cover transition-all duration-500">
              <div class="absolute bottom-4 right-4 bg-secondary/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <span id="slider-price" class="text-xl font-extrabold text-white">R$ ${slides[0]?.preco.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- PUBLIC MENU SECTION (RF-04) -->
      <section class="py-12 md:py-16 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-surface-container-high pb-6">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-on-surface">Cardápio do Restaurante</h2>
            <p class="text-sm text-on-surface-variant mt-1">Confira nossa seleção completa de pratos e a disponibilidade em tempo real</p>
          </div>
          <button onclick="handleHeroOrderClick()" class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-md transition flex items-center gap-2 self-start md:self-auto">
            <span class="material-symbols-outlined text-[20px]">login</span>
            <span>Entrar para Fazer Pedido</span>
          </button>
        </div>

        <!-- Dish Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${db.pratos.filter(p => p.ativo).map(prato => {
            const disp = StorageManager.getPratoDisponibilidade(prato, db);
            return renderDishCardPublic(prato, disp);
          }).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderDishCardPublic(prato, disp) {
  return `
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md border border-outline-variant/30 flex flex-col justify-between ${!disp.disponivel ? 'opacity-70' : ''}">
      <div>
        <div class="relative h-48 w-full overflow-hidden bg-surface-container">
          <img src="${prato.imagem}" alt="${prato.nome}" class="w-full h-full object-cover">
          <!-- Availability Badge -->
          <div class="absolute top-3 right-3">
            ${disp.disponivel ? `
              <span class="inline-flex items-center gap-1.5 bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                <span class="w-2 h-2 rounded-full bg-emerald-300"></span>
                <span>Disponível</span>
              </span>
            ` : `
              <span class="inline-flex items-center gap-1.5 bg-red-700 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                <span class="w-2 h-2 rounded-full bg-red-300"></span>
                <span>Indisponível</span>
              </span>
            `}
          </div>
        </div>
        <div class="p-5">
          <span class="text-[11px] uppercase font-bold text-primary tracking-wider">${prato.categoria || 'Prato'}</span>
          <h3 class="font-bold text-lg text-on-surface mt-1 leading-snug">${prato.nome}</h3>
          <p class="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">${prato.descricao}</p>
        </div>
      </div>
      <div class="p-5 pt-0 flex items-center justify-between border-t border-surface-container-low mt-2">
        <span class="text-xl font-extrabold text-secondary">R$ ${prato.preco.toFixed(2).replace('.', ',')}</span>
        <button onclick="handleHeroOrderClick()" ${!disp.disponivel ? 'disabled' : ''} class="px-4 py-2 rounded-xl text-xs font-bold ${disp.disponivel ? 'bg-primary hover:bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'} transition">
          ${disp.disponivel ? 'Pedir em Mesa' : 'Esgotado'}
        </button>
      </div>
    </div>
  `;
}

function initLandingPageSlider() {
  const db = StorageManager.getDB();
  const destaques = db.pratos.filter(p => p.ativo && p.destaque);
  const slides = destaques.length > 0 ? destaques : db.pratos.filter(p => p.ativo).slice(0, 3);

  if (slides.length <= 1) return;

  state.sliderIndex = 0;
  state.sliderInterval = setInterval(() => {
    state.sliderIndex = (state.sliderIndex + 1) % slides.length;
    updateSlideContent(slides);
  }, 5000); // RNF-06: 5 seconds
}

function setSlide(index) {
  const db = StorageManager.getDB();
  const destaques = db.pratos.filter(p => p.ativo && p.destaque);
  const slides = destaques.length > 0 ? destaques : db.pratos.filter(p => p.ativo).slice(0, 3);
  state.sliderIndex = index;
  updateSlideContent(slides);
}

function updateSlideContent(slides) {
  const slide = slides[state.sliderIndex];
  if (!slide) return;

  const title = document.getElementById('slider-title');
  const desc = document.getElementById('slider-desc');
  const img = document.getElementById('slider-img');
  const price = document.getElementById('slider-price');

  if (title) title.textContent = slide.nome;
  if (desc) desc.textContent = slide.descricao;
  if (img) img.src = slide.imagem;
  if (price) price.textContent = `R$ ${slide.preco.toFixed(2).replace('.', ',')}`;

  slides.forEach((_, i) => {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      if (i === state.sliderIndex) {
        dot.className = "w-8 h-3 rounded-full bg-primary transition-all";
      } else {
        dot.className = "w-3 h-3 rounded-full bg-white/40 transition-all";
      }
    }
  });
}

function handleHeroOrderClick() {
  const currentUser = AuthManager.getCurrentUser();
  if (currentUser && currentUser.tipo === 'mesa') {
    navigateTo('dashboard-cliente');
  } else {
    navigateTo('login-mesa');
  }
}

/* ==========================================================================
   2. AUTHENTICATION & LOGIN VIEWS
   ========================================================================== */
function renderLoginMesaPage(db) {
  const mesasAtivas = db.usuarios.filter(u => u.tipo === 'mesa' && u.ativo);

  return `
    <div class="max-w-4xl mx-auto w-full my-auto py-12 px-margin-mobile">
      <div class="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-2xl border border-outline-variant/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        <!-- Left: Form -->
        <div class="lg:col-span-7 space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">
              <span class="material-symbols-outlined text-[24px]">table_bar</span>
            </div>
            <div>
              <h2 class="font-bold text-2xl text-on-surface">Login de Mesa</h2>
              <p class="text-xs text-on-surface-variant">Identifique sua mesa para iniciar seus pedidos</p>
            </div>
          </div>

          <div id="login-mesa-error" class="hidden p-3 rounded-xl bg-red-100 text-red-900 text-xs font-semibold border border-red-200"></div>

          <form onsubmit="handleLoginMesaSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Selecione ou digite sua Mesa</label>
              <input type="text" id="login-mesa-input" required class="w-full p-3.5 rounded-xl border border-outline/30 focus:outline-none focus:border-primary text-sm font-semibold bg-surface-container-low" placeholder="Ex: Mesa 05">
            </div>

            <!-- Quick Table Selector Pills -->
            <div>
              <span class="block text-[11px] font-bold text-on-surface-variant/80 uppercase mb-2">Atalhos de Mesas Cadastradas:</span>
              <div class="flex flex-wrap gap-2">
                ${mesasAtivas.map(m => `
                  <button type="button" onclick="selectQuickMesa('${m.login}')" class="text-xs font-bold bg-surface-container hover:bg-primary-fixed hover:text-on-primary-fixed px-3 py-1.5 rounded-lg border border-outline-variant/30 transition">
                    ${m.nome}
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Senha da Mesa</label>
              <input type="password" id="login-mesa-senha" required class="w-full p-3.5 rounded-xl border border-outline/30 focus:outline-none focus:border-primary text-sm font-semibold bg-surface-container-low" placeholder="••••••" value="123">
              <p class="text-[11px] text-on-surface-variant/70 mt-1">* A senha padrão inicial de teste é <strong>123</strong></p>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-base shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">key</span>
              <span>Acessar Cardápio da Mesa</span>
            </button>
          </form>
        </div>

        <!-- Right: Info Panel -->
        <div class="lg:col-span-5 bg-surface-container-low p-6 rounded-2xl border border-surface-container-high space-y-4">
          <div class="flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined">restaurant</span>
            <span>Atendimento Digital</span>
          </div>
          <h3 class="font-bold text-lg text-on-surface">Faça pedidos direto da sua mesa com agilidade</h3>
          <ul class="space-y-2 text-xs text-on-surface-variant">
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>Disponibilidade de pratos atualizada em tempo real</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>Histórico de pedidos completo do consumo</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>Botão para chamar garçom com 1 clique</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  `;
}

function selectQuickMesa(login) {
  const input = document.getElementById('login-mesa-input');
  if (input) input.value = login;
}

function handleLoginMesaSubmit(e) {
  e.preventDefault();
  const login = document.getElementById('login-mesa-input').value;
  const senha = document.getElementById('login-mesa-senha').value;
  const errorDiv = document.getElementById('login-mesa-error');

  try {
    AuthManager.loginMesa(login, senha);
    navigateTo('dashboard-cliente');
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('hidden');
  }
}

function renderLoginEquipePage() {
  return `
    <div class="max-w-md mx-auto w-full my-auto py-12 px-margin-mobile">
      <div class="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 space-y-6">

        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-secondary text-white mx-auto flex items-center justify-center font-bold shadow-md">
            <span class="material-symbols-outlined text-[28px]">badge</span>
          </div>
          <h2 class="font-bold text-2xl text-on-surface">Acesso Operacional</h2>
          <p class="text-xs text-on-surface-variant">Área exclusiva para Atendentes e Gerentes</p>
        </div>

        <div id="login-equipe-error" class="hidden p-3 rounded-xl bg-red-100 text-red-900 text-xs font-semibold border border-red-200"></div>

        <form onsubmit="handleLoginEquipeSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Usuário</label>
            <input type="text" id="login-equipe-user" required class="w-full p-3.5 rounded-xl border border-outline/30 focus:outline-none focus:border-primary text-sm font-semibold bg-surface-container-low" placeholder="ex: atendente ou admin" value="admin">
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface-variant uppercase mb-1">Senha</label>
            <input type="password" id="login-equipe-senha" required class="w-full p-3.5 rounded-xl border border-outline/30 focus:outline-none focus:border-primary text-sm font-semibold bg-surface-container-low" placeholder="••••••" value="123">
          </div>

          <div class="p-3 bg-surface-container rounded-xl text-xs text-on-surface-variant space-y-1">
            <p><strong>Contas de Teste Pré-Cadastradas:</strong></p>
            <p>• Gerente: usuário <code>admin</code> | senha <code>123</code></p>
            <p>• Atendente: usuário <code>atendente</code> | senha <code>123</code></p>
          </div>

          <button type="submit" class="w-full py-3.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold text-base shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">login</span>
            <span>Entrar no Painel</span>
          </button>
        </form>

      </div>
    </div>
  `;
}

function handleLoginEquipeSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('login-equipe-user').value;
  const senha = document.getElementById('login-equipe-senha').value;
  const errorDiv = document.getElementById('login-equipe-error');

  try {
    const session = AuthManager.loginFuncionario(user, senha);
    if (session.perfil === 'Gerente') {
      navigateTo('dashboard-gerente');
    } else {
      navigateTo('dashboard-atendente');
    }
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('hidden');
  }
}

/* ==========================================================================
   3. CLIENT DASHBOARD VIEW (RF-12 to RF-18, RF-26, RF-27)
   ========================================================================== */
function renderDashboardCliente(db, currentUser) {
  const meusPedidos = db.pedidos.filter(p => p.mesa_id === currentUser.id);

  return `
    <div class="max-w-7xl mx-auto w-full py-8 px-margin-mobile md:px-margin-desktop space-y-10">

      <!-- Top Mesa Banner -->
      <div class="bg-secondary text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
            <span class="material-symbols-outlined text-[32px]">table_restaurant</span>
          </div>
          <div>
            <span class="text-xs font-bold text-primary-fixed uppercase tracking-wider">Comanda Conectada</span>
            <h1 class="text-2xl md:text-3xl font-extrabold text-white">${currentUser.nome}</h1>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button onclick="openCallModal()" class="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">notifications_active</span>
            <span>Chamar Garçom</span>
          </button>

          <button onclick="openCartModal()" class="relative px-5 py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-md transition flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
            <span>Carrinho (${getCartItemCount()})</span>
          </button>
        </div>
      </div>

      <!-- MAIN CLIENT TABS: Cardápio | Meus Pedidos -->
      <div class="space-y-6">
        <div class="flex items-center gap-2 border-b border-surface-container-high pb-3">
          <button onclick="toggleClientTab('cardapio')" id="tab-btn-cardapio" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-container-highest text-primary">
            Cardápio
          </button>
          <button onclick="toggleClientTab('historico')" id="tab-btn-historico" class="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container">
            Meus Pedidos (${meusPedidos.length})
          </button>
        </div>

        <!-- CARDAPIO TAB CONTENT -->
        <div id="client-tab-cardapio" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${db.pratos.filter(p => p.ativo).map(prato => {
            const disp = StorageManager.getPratoDisponibilidade(prato, db);
            return renderDishCardClient(prato, disp);
          }).join('')}
        </div>

        <!-- HISTORICO TAB CONTENT -->
        <div id="client-tab-historico" class="hidden space-y-4">
          ${meusPedidos.length === 0 ? `
            <div class="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant">
              <span class="material-symbols-outlined text-4xl mb-2 text-outline">receipt_long</span>
              <p class="font-bold">Nenhum pedido realizado ainda.</p>
              <p class="text-xs">Escolha pratos do cardápio e confirme seu primeiro pedido!</p>
            </div>
          ` : meusPedidos.map(p => `
            <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-on-surface">Pedido #${p.id.slice(0,8)}</span>
                  <span class="text-xs text-on-surface-variant">${new Date(p.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  ${renderOrderStatusBadge(p.status)}
                </div>
                <div class="text-xs text-on-surface-variant space-y-0.5">
                  ${p.itens.map(i => `<div>${i.quantidade}x ${i.prato_nome} (R$ ${i.preco_unitario.toFixed(2)})</div>`).join('')}
                </div>
              </div>
              <div class="text-right">
                <span class="block text-xs font-semibold text-on-surface-variant">Total</span>
                <span class="text-lg font-extrabold text-secondary">R$ ${p.valor_total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>

    </div>
  `;
}

function renderDishCardClient(prato, disp) {
  return `
    <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-md border border-outline-variant/30 flex flex-col justify-between ${!disp.disponivel ? 'opacity-60' : ''}">
      <div>
        <div class="relative h-48 w-full overflow-hidden bg-surface-container">
          <img src="${prato.imagem}" alt="${prato.nome}" class="w-full h-full object-cover">
          <div class="absolute top-3 right-3">
            ${disp.disponivel ? `
              <span class="inline-flex items-center gap-1 bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow">
                <span>Disp: ${disp.maxPorcoes}</span>
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 bg-red-700 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow">
                <span>Indisponível</span>
              </span>
            `}
          </div>
        </div>
        <div class="p-5">
          <span class="text-[11px] uppercase font-bold text-primary tracking-wider">${prato.categoria || 'Prato'}</span>
          <h3 class="font-bold text-lg text-on-surface mt-1">${prato.nome}</h3>
          <p class="text-xs text-on-surface-variant mt-2 line-clamp-2">${prato.descricao}</p>
        </div>
      </div>
      <div class="p-5 pt-0 flex items-center justify-between border-t border-surface-container-low mt-2">
        <span class="text-xl font-extrabold text-secondary">R$ ${prato.preco.toFixed(2).replace('.', ',')}</span>
        <button onclick="addToCart('${prato.id}')" ${!disp.disponivel ? 'disabled' : ''} class="px-4 py-2 rounded-xl text-xs font-bold ${disp.disponivel ? 'bg-primary hover:bg-primary-container text-white shadow' : 'bg-surface-container text-on-surface-variant cursor-not-allowed'} transition flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
          <span>Adicionar</span>
        </button>
      </div>
    </div>
  `;
}

function toggleClientTab(tab) {
  const cardapioDiv = document.getElementById('client-tab-cardapio');
  const historicoDiv = document.getElementById('client-tab-historico');
  const btnCardapio = document.getElementById('tab-btn-cardapio');
  const btnHistorico = document.getElementById('tab-btn-historico');

  if (tab === 'cardapio') {
    cardapioDiv.classList.remove('hidden');
    historicoDiv.classList.add('hidden');
    btnCardapio.className = "px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-container-highest text-primary";
    btnHistorico.className = "px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container";
  } else {
    cardapioDiv.classList.add('hidden');
    historicoDiv.classList.remove('hidden');
    btnCardapio.className = "px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container";
    btnHistorico.className = "px-5 py-2.5 rounded-xl font-bold text-sm bg-surface-container-highest text-primary";
  }
}

/* ==========================================================================
   4. SHOPPING CART LOGIC (RF-15, RF-16, RF-17)
   ========================================================================== */
function addToCart(pratoId) {
  const db = StorageManager.getDB();
  const prato = db.pratos.find(p => p.id === pratoId);
  if (!prato) return;

  const disp = StorageManager.getPratoDisponibilidade(prato, db);
  if (!disp.disponivel) {
    alert("Prato indisponível devido ao estoque insuficiente de ingredientes.");
    return;
  }

  const existing = state.cart.find(item => item.prato_id === pratoId);
  if (existing) {
    if (existing.quantidade + 1 > disp.maxPorcoes) {
      alert(`Quantidade máxima disponível em estoque atingida (${disp.maxPorcoes} porções).`);
      return;
    }
    existing.quantidade += 1;
  } else {
    state.cart.push({
      prato_id: prato.id,
      prato_nome: prato.nome,
      quantidade: 1,
      preco_unitario: prato.preco
    });
  }

  updateCartModalUI();
  renderCurrentView();
  openCartModal();
}

function getCartItemCount() {
  return state.cart.reduce((sum, i) => sum + i.quantidade, 0);
}

function openCartModal() {
  document.getElementById('modal-carrinho').classList.remove('hidden');
  updateCartModalUI();
}

function closeCartModal() {
  document.getElementById('modal-carrinho').classList.add('hidden');
}

function updateCartModalUI() {
  const listDiv = document.getElementById('cart-items-list');
  const totalSpan = document.getElementById('cart-total-value');
  if (!listDiv || !totalSpan) return;

  if (state.cart.length === 0) {
    listDiv.innerHTML = `
      <div class="text-center py-12 text-on-surface-variant space-y-2">
        <span class="material-symbols-outlined text-4xl text-outline">remove_shopping_cart</span>
        <p class="font-bold text-sm">Seu carrinho está vazio.</p>
        <p class="text-xs">Selecione pratos no cardápio para adicionar.</p>
      </div>
    `;
    totalSpan.textContent = "R$ 0,00";
    return;
  }

  let total = 0;
  listDiv.innerHTML = state.cart.map((item, index) => {
    const itemTotal = item.preco_unitario * item.quantidade;
    total += itemTotal;
    return `
      <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-surface-container-high">
        <div class="space-y-0.5">
          <h4 class="font-bold text-sm text-on-surface">${item.prato_nome}</h4>
          <span class="text-xs text-on-surface-variant">R$ ${item.preco_unitario.toFixed(2).replace('.', ',')} un</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-surface-container rounded-lg p-1">
            <button onclick="changeCartQty(${index}, -1)" class="w-6 h-6 rounded bg-surface-container-high hover:bg-surface-container-highest font-bold text-xs flex items-center justify-center">-</button>
            <span class="w-6 text-center text-xs font-bold">${item.quantidade}</span>
            <button onclick="changeCartQty(${index}, 1)" class="w-6 h-6 rounded bg-surface-container-high hover:bg-surface-container-highest font-bold text-xs flex items-center justify-center">+</button>
          </div>
          <span class="text-xs font-bold text-secondary min-w-[60px] text-right">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
    `;
  }).join('');

  totalSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function changeCartQty(index, delta) {
  const item = state.cart[index];
  if (!item) return;

  if (delta > 0) {
    const db = StorageManager.getDB();
    const prato = db.pratos.find(p => p.id === item.prato_id);
    const disp = StorageManager.getPratoDisponibilidade(prato, db);
    if (item.quantidade + 1 > disp.maxPorcoes) {
      alert(`Limite máximo de porções disponíveis em estoque atingido (${disp.maxPorcoes}).`);
      return;
    }
    item.quantidade += 1;
  } else {
    item.quantidade -= 1;
    if (item.quantidade <= 0) {
      state.cart.splice(index, 1);
    }
  }
  updateCartModalUI();
  renderCurrentView();
}

function handleOrderSubmit() {
  const currentUser = AuthManager.getCurrentUser();
  if (!currentUser || currentUser.tipo !== 'mesa') {
    alert("Por favor, faça login com a conta da sua mesa para enviar o pedido.");
    navigateTo('login-mesa');
    return;
  }

  if (state.cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  try {
    StorageManager.criarPedido(currentUser.id, state.cart);
    state.cart = [];
    closeCartModal();
    alert("Pedido enviado com sucesso para a cozinha!");
    renderCurrentView();
  } catch (err) {
    alert("Erro ao enviar pedido: " + err.message);
  }
}

/* ==========================================================================
   5. STAFF CALL MODAL & AUDIO NOTIFICATIONS (RF-26 to RF-31)
   ========================================================================== */
function openCallModal() {
  document.getElementById('modal-chamar-funcionario').classList.remove('hidden');
}

function closeCallModal() {
  document.getElementById('modal-chamar-funcionario').classList.add('hidden');
}

function handleConfirmCall() {
  const currentUser = AuthManager.getCurrentUser();
  if (!currentUser || currentUser.tipo !== 'mesa') {
    alert("Apenas mesas autenticadas podem chamar funcionários.");
    return;
  }

  const justInput = document.getElementById('call-justificativa');
  const justificativa = justInput.value.trim();

  if (!justificativa) {
    alert("Por favor, informe uma justificativa para o chamado.");
    return;
  }

  try {
    StorageManager.criarChamado(currentUser.id, justificativa);
    justInput.value = '';
    closeCallModal();
    alert("Chamado enviado aos atendentes com sucesso!");
    playNotificationSound();
    renderCurrentView();
  } catch (err) {
    alert("Erro ao enviar chamado: " + err.message);
  }
}

function enableSoundNotifications() {
  state.audioEnabled = true;
  playNotificationSound();
  alert("Notificações sonoras ativadas com sucesso!");
  renderCurrentView();
}

/* ==========================================================================
   6. ATTENDANT DASHBOARD VIEW (RF-19, RF-20, RF-28 to RF-31)
   ========================================================================== */
function renderDashboardAtendente(db) {
  const chamadosPendentes = db.chamados.filter(c => c.status === 'Pendente');

  return `
    <div class="max-w-7xl mx-auto w-full py-8 px-margin-mobile md:px-margin-desktop space-y-8">

      <!-- Attendente Header Bar -->
      <div class="bg-secondary text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow">
            <span class="material-symbols-outlined text-[28px]">soup_kitchen</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold">Painel do Atendente de Salão</h1>
            <p class="text-xs text-surface-container-highest">Gerenciamento de Pedidos e Chamados em Tempo Real</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="enableSoundNotifications()" class="px-4 py-2.5 rounded-xl ${state.audioEnabled ? 'bg-emerald-700 text-white' : 'bg-surface-container-lowest/10 text-white hover:bg-surface-container-lowest/20'} font-bold text-xs border border-white/20 transition flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">volume_up</span>
            <span>${state.audioEnabled ? 'Sons Ativados' : 'Ativar Notificações Sonoras'}</span>
          </button>
        </div>
      </div>

      <!-- CHAMADOS PENDENTES SECTION (RF-28 to RF-31) -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600 text-[24px]">notifications_active</span>
            <h2 class="text-xl font-bold text-on-surface">Chamados de Mesas Pendentes (${chamadosPendentes.length})</h2>
          </div>
        </div>

        ${chamadosPendentes.length === 0 ? `
          <div class="p-6 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant text-xs">
            Nenhum chamado de mesa pendente no momento.
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${chamadosPendentes.map(ch => {
              const mesa = db.usuarios.find(u => u.id === ch.mesa_id);
              return `
                <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-extrabold text-amber-900 text-base">${mesa?.nome || 'Mesa'}</span>
                      <span class="text-[11px] font-semibold text-amber-700">${new Date(ch.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p class="text-xs text-amber-800 font-medium">"${ch.justificativa}"</p>
                  </div>
                  <button onclick="handleAtenderChamado('${ch.id}')" class="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Marcar como Atendido</span>
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </section>

      <!-- ACTIVE ORDERS SECTION (RF-19, RF-20) -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
            <h2 class="text-xl font-bold text-on-surface">Pedidos da Cozinha / Salão</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${db.pedidos.map(p => {
            const mesa = db.usuarios.find(u => u.id === p.mesa_id);
            return renderOrderCardStaff(p, mesa);
          }).join('')}
        </div>
      </section>

    </div>
  `;
}

function renderOrderCardStaff(pedido, mesa) {
  return `
    <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-md flex flex-col justify-between space-y-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div>
            <span class="font-extrabold text-lg text-on-surface">${mesa?.nome || 'Mesa'}</span>
            <span class="block text-[11px] text-on-surface-variant">Pedido #${pedido.id.slice(0,8)} • ${new Date(pedido.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
          ${renderOrderStatusBadge(pedido.status)}
        </div>

        <div class="space-y-1 text-xs text-on-surface space-y-1">
          ${pedido.itens.map(i => `
            <div class="flex justify-between font-medium">
              <span>${i.quantidade}x ${i.prato_nome}</span>
              <span class="text-on-surface-variant">R$ ${(i.preco_unitario * i.quantidade).toFixed(2).replace('.', ',')}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="space-y-3 pt-3 border-t border-surface-container-high">
        <div class="flex items-center justify-between text-sm">
          <span class="font-bold text-on-surface-variant">Valor Total:</span>
          <span class="font-extrabold text-secondary text-base">R$ ${pedido.valor_total.toFixed(2).replace('.', ',')}</span>
        </div>

        <!-- Status Action Buttons -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase text-on-surface-variant">Atualizar Status:</label>
          <div class="grid grid-cols-2 gap-1.5">
            <button onclick="handleUpdateOrderStatus('${pedido.id}', 'Recebido')" class="px-2 py-1.5 rounded-lg text-[11px] font-bold ${pedido.status === 'Recebido' ? 'bg-blue-600 text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'} transition">Recebido</button>
            <button onclick="handleUpdateOrderStatus('${pedido.id}', 'Em preparo')" class="px-2 py-1.5 rounded-lg text-[11px] font-bold ${pedido.status === 'Em preparo' ? 'bg-amber-600 text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'} transition">Em preparo</button>
            <button onclick="handleUpdateOrderStatus('${pedido.id}', 'Pronto')" class="px-2 py-1.5 rounded-lg text-[11px] font-bold ${pedido.status === 'Pronto' ? 'bg-emerald-600 text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'} transition">Pronto</button>
            <button onclick="handleUpdateOrderStatus('${pedido.id}', 'Entregue')" class="px-2 py-1.5 rounded-lg text-[11px] font-bold ${pedido.status === 'Entregue' ? 'bg-slate-700 text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'} transition">Entregue</button>
          </div>
          <button onclick="handleUpdateOrderStatus('${pedido.id}', 'Cancelado')" class="w-full py-1.5 rounded-lg text-[11px] font-bold ${pedido.status === 'Cancelado' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'} transition">
            Cancelado ${pedido.status === 'Cancelado' ? '' : '(Estorna Estoque)'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderOrderStatusBadge(status) {
  switch (status) {
    case 'Recebido':
      return `<span class="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">Recebido</span>`;
    case 'Em preparo':
      return `<span class="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">Em preparo</span>`;
    case 'Pronto':
      return `<span class="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">Pronto</span>`;
    case 'Entregue':
      return `<span class="bg-slate-200 text-slate-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">Entregue</span>`;
    case 'Cancelado':
      return `<span class="bg-red-100 text-red-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">Cancelado</span>`;
    default:
      return `<span class="bg-gray-100 text-gray-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">${status}</span>`;
  }
}

function handleAtenderChamado(chamadoId) {
  try {
    StorageManager.atenderChamado(chamadoId);
    renderCurrentView();
  } catch (err) {
    alert("Erro ao atender chamado: " + err.message);
  }
}

function handleUpdateOrderStatus(pedidoId, novoStatus) {
  try {
    StorageManager.atualizarStatusPedido(pedidoId, novoStatus);
    renderCurrentView();
  } catch (err) {
    alert("Erro ao atualizar pedido: " + err.message);
  }
}

/* ==========================================================================
   7. MANAGER DASHBOARD VIEW (RF-10, RF-11, RF-21 to RF-25, RF-32 to RF-42)
   ========================================================================== */
function renderDashboardGerente(db) {
  return `
    <div class="max-w-7xl mx-auto w-full py-8 px-margin-mobile md:px-margin-desktop space-y-8">

      <!-- Manager Top Bar -->
      <div class="bg-secondary text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow">
            <span class="material-symbols-outlined text-[28px]">query_stats</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold">Painel de Gestão e Backoffice</h1>
            <p class="text-xs text-surface-container-highest">Controle Total de Operações, Estoque, Faturamento e Contas</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="StorageManager.exportarDadosJSON()" class="px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">download</span>
            <span>Exportar Backup (JSON)</span>
          </button>
          <label class="px-4 py-2.5 rounded-xl bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Importar JSON</span>
            <input type="file" accept=".json" onchange="handleImportJSON(event)" class="hidden">
          </label>
        </div>
      </div>

      <!-- MANAGER NAVIGATION TABS -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface-container-high">
        <button onclick="setManagerTab('pedidos')" class="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${state.activeManagerTab === 'pedidos' ? 'bg-primary text-white shadow' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">Pedidos Ativos</button>
        <button onclick="setManagerTab('faturamento')" class="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${state.activeManagerTab === 'faturamento' ? 'bg-primary text-white shadow' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">Faturamento & Métricas</button>
        <button onclick="setManagerTab('estoque')" class="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${state.activeManagerTab === 'estoque' ? 'bg-primary text-white shadow' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">Estoque de Insumos</button>
        <button onclick="setManagerTab('cardapio')" class="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${state.activeManagerTab === 'cardapio' ? 'bg-primary text-white shadow' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">Gerenciar Cardápio</button>
        <button onclick="setManagerTab('mesas')" class="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${state.activeManagerTab === 'mesas' ? 'bg-primary text-white shadow' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">Contas de Mesas</button>
        <button onclick="setManagerTab('equipe')" class="px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${state.activeManagerTab === 'equipe' ? 'bg-primary text-white shadow' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">Contas da Equipe</button>
      </div>

      <!-- ACTIVE TAB CONTENT -->
      <div>
        ${renderManagerTabContent(db)}
      </div>

    </div>
  `;
}

function setManagerTab(tab) {
  state.activeManagerTab = tab;
  renderCurrentView();
}

function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      StorageManager.importarDadosJSON(event.target.result);
      alert("Dados restaurados com sucesso a partir do arquivo JSON!");
      renderCurrentView();
    } catch (err) {
      alert("Erro ao importar JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

function renderManagerTabContent(db) {
  switch (state.activeManagerTab) {
    case 'pedidos':
      return renderDashboardAtendente(db);

    case 'faturamento':
      return renderManagerFaturamento(db);

    case 'estoque':
      return renderManagerEstoque(db);

    case 'cardapio':
      return renderManagerCardapio(db);

    case 'mesas':
      return renderManagerMesas(db);

    case 'equipe':
      return renderManagerEquipe(db);

    default:
      return renderManagerFaturamento(db);
  }
}

/* 7.1 Faturamento Dashboard (RF-32 to RF-36, RN-08, RN-09) */
function renderManagerFaturamento(db) {
  // Only Entregue orders count for revenue (RN-08, RF-35)
  // Cancelled orders ignored (RN-04, RF-35)
  const now = new Date();

  const pedidosEntregues = db.pedidos.filter(p => {
    if (p.status !== 'Entregue') return false;
    const pDate = new Date(p.criado_em);

    if (state.billingFilter === 'dia') {
      return pDate.toDateString() === now.toDateString();
    } else if (state.billingFilter === 'semana') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return pDate >= oneWeekAgo;
    } else {
      // Month
      return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
    }
  });

  const totalFaturado = pedidosEntregues.reduce((sum, p) => sum + p.valor_total, 0);
  const qtdPedidos = pedidosEntregues.length;
  const ticketMedio = qtdPedidos > 0 ? (totalFaturado / qtdPedidos) : 0;

  // Calculate top dishes
  const dishSales = {};
  pedidosEntregues.forEach(p => {
    p.itens.forEach(i => {
      dishSales[i.prato_nome] = (dishSales[i.prato_nome] || 0) + i.quantidade;
    });
  });

  const sortedDishes = Object.entries(dishSales).sort((a, b) => b[1] - a[1]);

  return `
    <div class="space-y-6">

      <!-- Filter Bar -->
      <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-surface-container-high">
        <h3 class="font-bold text-lg text-on-surface">Métricas & Faturamento</h3>

        <div class="flex items-center gap-2 bg-surface-container rounded-xl p-1">
          <button onclick="setBillingFilter('dia')" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.billingFilter === 'dia' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}">Hoje / Dia</button>
          <button onclick="setBillingFilter('semana')" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.billingFilter === 'semana' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}">Últimos 7 Dias</button>
          <button onclick="setBillingFilter('mes')" class="px-3 py-1.5 rounded-lg text-xs font-bold ${state.billingFilter === 'mes' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}">Este Mês</button>
        </div>
      </div>

      <!-- Key Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md space-y-2">
          <span class="text-xs font-bold uppercase text-on-surface-variant">Faturamento Total (${state.billingFilter.toUpperCase()})</span>
          <div class="text-3xl font-extrabold text-secondary">R$ ${totalFaturado.toFixed(2).replace('.', ',')}</div>
          <p class="text-[11px] text-emerald-700 font-semibold">* Considera apenas pedidos entregues</p>
        </div>

        <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md space-y-2">
          <span class="text-xs font-bold uppercase text-on-surface-variant">Pedidos Finalizados</span>
          <div class="text-3xl font-extrabold text-on-surface">${qtdPedidos}</div>
          <p class="text-[11px] text-on-surface-variant">Pedidos com status "Entregue"</p>
        </div>

        <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md space-y-2">
          <span class="text-xs font-bold uppercase text-on-surface-variant">Ticket Médio</span>
          <div class="text-3xl font-extrabold text-primary">R$ ${ticketMedio.toFixed(2).replace('.', ',')}</div>
          <p class="text-[11px] text-on-surface-variant">Faturamento / Pedidos Finalizados</p>
        </div>
      </div>

      <!-- Top Dishes Table -->
      <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md space-y-4">
        <h4 class="font-bold text-base text-on-surface">Pratos Mais Vendidos no Período</h4>

        ${sortedDishes.length === 0 ? `
          <p class="text-xs text-on-surface-variant">Nenhuma venda registrada no período selecionado.</p>
        ` : `
          <div class="divide-y divide-surface-container-high">
            ${sortedDishes.map(([nome, qty], idx) => `
              <div class="py-3 flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-[11px]">${idx + 1}</span>
                  <span class="font-bold text-on-surface">${nome}</span>
                </div>
                <span class="font-extrabold text-secondary">${qty} porções vendidas</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

function setBillingFilter(filter) {
  state.billingFilter = filter;
  renderCurrentView();
}

/* 7.2 Estoque Management (RF-21 to RF-25) */
function renderManagerEstoque(db) {
  return `
    <div class="space-y-6">

      <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-surface-container-high">
        <div>
          <h3 class="font-bold text-lg text-on-surface">Controle de Estoque de Insumos</h3>
          <p class="text-xs text-on-surface-variant">Gerencie quantidades e cadastre novos ingredientes</p>
        </div>

        <button onclick="openAddIngredientModal()" class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow transition flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Novo Ingrediente</span>
        </button>
      </div>

      <!-- Ingredient List Table -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-md overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-surface-container-high text-[11px] uppercase font-bold text-on-surface-variant">
              <th class="p-4">Ingrediente</th>
              <th class="p-4">Unidade</th>
              <th class="p-4">Quantidade Atual</th>
              <th class="p-4 text-right">Ações / Ajuste</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container-high text-xs">
            ${db.ingredientes.map(ing => `
              <tr>
                <td class="p-4 font-bold text-on-surface">${ing.nome}</td>
                <td class="p-4 text-on-surface-variant uppercase font-semibold">${ing.unidade}</td>
                <td class="p-4">
                  <span class="font-bold ${ing.quantidade < 2.0 ? 'text-red-700' : 'text-on-surface'}">${ing.quantidade} ${ing.unidade}</span>
                  ${ing.quantidade < 2.0 ? '<span class="ml-2 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Estoque Baixo</span>' : ''}
                </td>
                <td class="p-4 text-right">
                  <button onclick="handleEditIngredienteQty('${ing.id}')" class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest font-bold text-xs transition">
                    Ajustar / Repor
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;
}

function openAddIngredientModal() {
  const nome = prompt("Nome do novo ingrediente:");
  if (!nome) return;
  const unidade = prompt("Unidade de medida (ex: kg, L, un):", "kg");
  if (!unidade) return;
  const qtyStr = prompt("Quantidade inicial em estoque:", "10.0");
  const qty = parseFloat(qtyStr);
  if (isNaN(qty)) return;

  const db = StorageManager.getDB();
  db.ingredientes.push({
    id: StorageManager.generateUUID(),
    nome: nome.trim(),
    unidade: unidade.trim(),
    quantidade: qty
  });
  StorageManager.saveDB(db);
  renderCurrentView();
}

function handleEditIngredienteQty(ingId) {
  const db = StorageManager.getDB();
  const ing = db.ingredientes.find(i => i.id === ingId);
  if (!ing) return;

  const novaQtyStr = prompt(`Ajustar quantidade em estoque para "${ing.nome}" (${ing.unidade}):`, ing.quantidade);
  if (novaQtyStr === null) return;
  const novaQty = parseFloat(novaQtyStr);
  if (isNaN(novaQty) || novaQty < 0) {
    alert("Quantidade inválida.");
    return;
  }

  ing.quantidade = novaQty;
  StorageManager.saveDB(db);
  renderCurrentView();
}

/* 7.3 Cardápio Management (RF-37 to RF-40) */
function renderManagerCardapio(db) {
  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-surface-container-high">
        <div>
          <h3 class="font-bold text-lg text-on-surface">Gerenciamento do Cardápio</h3>
          <p class="text-xs text-on-surface-variant">Cadastre pratos, vincule receitas e defina pratos em destaque</p>
        </div>

        <button onclick="openAddDishModal()" class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow transition flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Novo Prato</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${db.pratos.map(p => `
          <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-md flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <div class="h-36 w-full rounded-xl overflow-hidden bg-surface-container relative">
                <img src="${p.imagem}" alt="${p.nome}" class="w-full h-full object-cover">
                ${p.destaque ? '<span class="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Slide Destaque</span>' : ''}
              </div>
              <h4 class="font-bold text-base text-on-surface">${p.nome}</h4>
              <p class="text-xs text-on-surface-variant line-clamp-2">${p.descricao}</p>
              <div class="text-sm font-extrabold text-secondary">R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
            </div>

            <div class="pt-3 border-t border-surface-container-high flex items-center justify-between gap-2">
              <button onclick="handleEditDish('${p.id}')" class="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold transition">Editar</button>
              <button onclick="handleDeleteDish('${p.id}')" class="py-1.5 px-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition">Excluir</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openAddDishModal() {
  const db = StorageManager.getDB();
  const nome = prompt("Nome do Prato:");
  if (!nome) return;
  const descricao = prompt("Descrição:");
  if (!descricao) return;
  const preco = parseFloat(prompt("Preço (ex: 45.90):", "45.90"));
  if (isNaN(preco)) return;
  const imagem = prompt("URL da Imagem:", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80");
  const destaque = confirm("Destacar este prato nos slides da Landing Page?");

  // Simple recipe builder
  alert("Agora vincule os ingredientes consumidos por porção deste prato.");
  const ingredientesReceita = [];
  db.ingredientes.forEach(ing => {
    const qtyStr = prompt(`Quantidade de "${ing.nome}" (${ing.unidade}) por porção (digite 0 se não usa):`, "0");
    const qty = parseFloat(qtyStr);
    if (!isNaN(qty) && qty > 0) {
      ingredientesReceita.push({
        ingrediente_id: ing.id,
        quantidade: qty,
        unidade: ing.unidade
      });
    }
  });

  const novoPrato = {
    id: StorageManager.generateUUID(),
    nome: nome.trim(),
    descricao: descricao.trim(),
    preco: preco,
    imagem: imagem.trim(),
    destaque: destaque,
    categoria: "Pratos Principais",
    ativo: true,
    ingredientes: ingredientesReceita
  };

  db.pratos.push(novoPrato);
  StorageManager.saveDB(db);
  renderCurrentView();
}

function handleEditDish(pratoId) {
  const db = StorageManager.getDB();
  const prato = db.pratos.find(p => p.id === pratoId);
  if (!prato) return;

  const nome = prompt("Nome do Prato:", prato.nome);
  if (!nome) return;
  const descricao = prompt("Descrição:", prato.descricao);
  if (!descricao) return;
  const preco = parseFloat(prompt("Preço:", prato.preco));
  if (isNaN(preco)) return;

  prato.nome = nome.trim();
  prato.descricao = descricao.trim();
  prato.preco = preco;
  prato.destaque = confirm("Destacar nos slides da Landing Page?", prato.destaque);

  StorageManager.saveDB(db);
  renderCurrentView();
}

function handleDeleteDish(pratoId) {
  if (!confirm("Tem certeza que deseja remover este prato do cardápio?")) return;
  const db = StorageManager.getDB();
  db.pratos = db.pratos.filter(p => p.id !== pratoId);
  StorageManager.saveDB(db);
  renderCurrentView();
}

/* 7.4 Mesa Accounts Management (RF-10, RN-10) */
function renderManagerMesas(db) {
  const mesas = db.usuarios.filter(u => u.tipo === 'mesa');

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-surface-container-high">
        <div>
          <h3 class="font-bold text-lg text-on-surface">Contas de Mesas (Clientes)</h3>
          <p class="text-xs text-on-surface-variant">Crie e gerencie acessos de mesas do restaurante</p>
        </div>

        <button onclick="openAddMesaModal()" class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow transition flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Nova Mesa</span>
        </button>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-md overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-surface-container-high text-[11px] uppercase font-bold text-on-surface-variant">
              <th class="p-4">Identificador Mesa</th>
              <th class="p-4">Login</th>
              <th class="p-4">Senha</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container-high text-xs">
            ${mesas.map(m => `
              <tr>
                <td class="p-4 font-bold text-on-surface">${m.nome}</td>
                <td class="p-4 text-on-surface-variant font-mono">${m.login}</td>
                <td class="p-4 text-on-surface-variant font-mono">${m.senha}</td>
                <td class="p-4">
                  ${m.ativo ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Ativa</span>' : '<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Inativa</span>'}
                </td>
                <td class="p-4 text-right space-x-2">
                  <button onclick="handleToggleMesaActive('${m.id}')" class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-bold text-xs transition">
                    ${m.ativo ? 'Inativar' : 'Reativar'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddMesaModal() {
  const nome = prompt("Nome da Mesa (ex: Mesa 09):");
  if (!nome) return;
  const login = prompt("Identificador de Login (ex: mesa09):", nome.toLowerCase().replace(/\s+/g, ''));
  if (!login) return;
  const senha = prompt("Senha da Mesa:", "123");
  if (!senha) return;

  const db = StorageManager.getDB();
  db.usuarios.push({
    id: StorageManager.generateUUID(),
    tipo: 'mesa',
    nome: nome.trim(),
    login: login.trim(),
    senha: senha.trim(),
    perfil: null,
    ativo: true,
    criado_em: new Date().toISOString()
  });
  StorageManager.saveDB(db);
  renderCurrentView();
}

function handleToggleMesaActive(id) {
  const db = StorageManager.getDB();
  const m = db.usuarios.find(u => u.id === id);
  if (m) {
    m.ativo = !m.ativo;
    StorageManager.saveDB(db);
    renderCurrentView();
  }
}

/* 7.5 Staff Accounts Management (RF-11) */
function renderManagerEquipe(db) {
  const equipe = db.usuarios.filter(u => u.tipo === 'funcionario');

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-surface-container-high">
        <div>
          <h3 class="font-bold text-lg text-on-surface">Contas da Equipe Operacional</h3>
          <p class="text-xs text-on-surface-variant">Cadastre e gerencie acessos de Atendentes e Gerentes</p>
        </div>

        <button onclick="openAddStaffModal()" class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow transition flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">add</span>
          <span>Novo Funcionário</span>
        </button>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-md overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container-low border-b border-surface-container-high text-[11px] uppercase font-bold text-on-surface-variant">
              <th class="p-4">Nome</th>
              <th class="p-4">Usuário</th>
              <th class="p-4">Perfil</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container-high text-xs">
            ${equipe.map(f => `
              <tr>
                <td class="p-4 font-bold text-on-surface">${f.nome}</td>
                <td class="p-4 text-on-surface-variant font-mono">${f.login}</td>
                <td class="p-4 font-bold text-primary">${f.perfil}</td>
                <td class="p-4">
                  ${f.ativo ? '<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Ativo</span>' : '<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Inativo</span>'}
                </td>
                <td class="p-4 text-right space-x-2">
                  <button onclick="handleToggleStaffActive('${f.id}')" class="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high font-bold text-xs transition">
                    ${f.ativo ? 'Inativar' : 'Reativar'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddStaffModal() {
  const nome = prompt("Nome do Funcionário:");
  if (!nome) return;
  const login = prompt("Usuário de Acesso:", nome.toLowerCase().split(' ')[0]);
  if (!login) return;
  const senha = prompt("Senha:", "123");
  if (!senha) return;
  const perfil = confirm("Clique OK para perfil 'Gerente' ou Cancelar para 'Atendente'") ? "Gerente" : "Atendente";

  const db = StorageManager.getDB();
  db.usuarios.push({
    id: StorageManager.generateUUID(),
    tipo: 'funcionario',
    nome: nome.trim(),
    login: login.trim(),
    senha: senha.trim(),
    perfil: perfil,
    ativo: true,
    criado_em: new Date().toISOString()
  });
  StorageManager.saveDB(db);
  renderCurrentView();
}

function handleToggleStaffActive(id) {
  const db = StorageManager.getDB();
  const f = db.usuarios.find(u => u.id === id);
  if (f) {
    f.ativo = !f.ativo;
    StorageManager.saveDB(db);
    renderCurrentView();
  }
}

/* ==========================================================================
   INITIALIZATION & EVENT LISTENERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Bar Listeners
  document.querySelectorAll('[data-target-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target-view');
      navigateTo(target);
    });
  });

  document.getElementById('nav-brand-logo')?.addEventListener('click', () => {
    navigateTo('landing');
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    AuthManager.logout();
    navigateTo('landing');
  });

  // Call Staff Modal Listeners
  document.getElementById('btn-floating-call')?.addEventListener('click', openCallModal);
  document.getElementById('close-modal-call')?.addEventListener('click', closeCallModal);
  document.getElementById('cancel-call-btn')?.addEventListener('click', closeCallModal);
  document.getElementById('confirm-call-btn')?.addEventListener('click', handleConfirmCall);

  // Quick reason chip listeners
  document.querySelectorAll('.chip-reason').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const text = e.target.textContent.trim();
      const input = document.getElementById('call-justificativa');
      if (input) input.value = text;
    });
  });

  // Cart Drawer Listeners
  document.getElementById('close-cart-btn')?.addEventListener('click', closeCartModal);
  document.getElementById('btn-submit-order')?.addEventListener('click', handleOrderSubmit);

  // Initial Route Check
  const currentUser = AuthManager.getCurrentUser();
  if (currentUser) {
    if (currentUser.tipo === 'mesa') {
      navigateTo('dashboard-cliente');
    } else if (currentUser.perfil === 'Gerente') {
      navigateTo('dashboard-gerente');
    } else {
      navigateTo('dashboard-atendente');
    }
  } else {
    navigateTo('landing');
  }
});
