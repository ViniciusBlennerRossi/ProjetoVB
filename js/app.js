/**
 * Fiore Pijamas - Funções Compartilhadas
 */

// ===== AUTENTICAÇÃO (sessão em sessionStorage) =====
const Auth = {
  KEY: 'vbmodas_session',
  login(user) {
    sessionStorage.setItem(this.KEY, JSON.stringify({
      id: user.id, nome: user.nome, email: user.email,
      papel: user.papel, permissoes: user.permissoes || {}, hora: new Date().toISOString(),
      id_loja: user.id_loja || null, loja_slug: user.loja_slug || null
    }));
  },
  logout() { sessionStorage.removeItem(this.KEY); window.location.href = 'index.html'; },
  sessao() {
    try { return JSON.parse(sessionStorage.getItem(this.KEY) || 'null'); } catch { return null; }
  },
  usuario()  { return this.sessao(); },
  isAdmin()  { const s = this.sessao(); return s && s.papel === 'admin'; },
  isLogado() { return !!this.sessao(); },
  exigirLogin() {
    if (!this.isLogado()) { window.location.href = 'index.html'; return false; }
    return true;
  },
  exigirAdmin() {
    if (!this.exigirLogin()) return false;
    if (!this.isAdmin()) {
      mostrarToast('Acesso restrito ao administrador', 'danger');
      setTimeout(() => history.back(), 1500);
      return false;
    }
    return true;
  },
  temPermissao(tela, acao = 'consultar') {
    const s = this.sessao();
    if (!s) return false;
    if (s.papel === 'admin') return true;
    const DEFAULTS_VENDEDOR = ['dashboard','vendas','pdv','encomendas','clientes','cobrancas','carnes','produtos','estoque'];
    const perms = s.permissoes || {};
    if (Object.keys(perms).length === 0) {
      return DEFAULTS_VENDEDOR.includes(tela);
    }
    if (!perms[tela]) return false;
    return perms[tela][acao] === true;
  },
  exigirPermissao(tela, acao = 'consultar') {
    if (!this.exigirLogin()) return false;
    if (!this.temPermissao(tela, acao)) {
      mostrarToast('Acesso não autorizado', 'danger');
      setTimeout(() => history.back(), 1500);
      return false;
    }
    return true;
  }
};

// ===== FORMATAÇÃO =====
const Fmt = {
  moeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  },
  data(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d) ? '-' : d.toLocaleDateString('pt-BR');
  },
  dataHora(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return isNaN(d) ? '-' : d.toLocaleString('pt-BR');
  },
  dataInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toISOString().split('T')[0];
  },
  numero(n, dec = 0) {
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n || 0);
  },
  telefone(t) {
    if (!t) return '-';
    const d = t.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return t;
  },
  cpf(c) {
    if (!c) return '-';
    const d = c.replace(/\D/g, '');
    if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    return c;
  },
  inicial(nome) {
    if (!nome) return '?';
    return nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
};

// ===== SIDEBAR =====
function renderSidebar(paginaAtiva) {
  const user = Auth.usuario();
  if (!user) return '';
  const isAdmin = user.papel === 'admin';

  const modulos = (typeof Tenant !== 'undefined' ? Tenant.getLojaAtual()?.modulos : null) || [];

  const menu = [
    { href: 'dashboard.html',   icon: '🏠', label: 'Home',                 id: 'dashboard' },
    { section: 'LOJA' },
    { href: 'agenda.html',      icon: '📅', label: 'Agenda',               id: 'agenda' },
    { href: 'servicos.html',    icon: '✂️', label: 'Serviços',             id: 'servicos' },
    { href: 'vendas.html',      icon: '🛒', label: 'Vendas',               id: 'vendas' },
    { href: 'pdv.html',         icon: '🖥️', label: 'PDV',                  id: 'pdv' },
    { href: 'encomendas.html',  icon: '📋', label: 'Encomendas',           id: 'encomendas' },
    { href: 'clientes.html',    icon: '👥', label: 'Clientes',             id: 'clientes' },
    { href: 'funcionarios.html',icon: '👤', label: 'Funcionários',         id: 'funcionarios' },
    { href: 'cobrancas.html',   icon: '💰', label: 'Cobranças',            id: 'cobrancas' },
    { href: 'carnes.html',      icon: '📄', label: 'Carnês',               id: 'carnes' },
    { section: 'ESTOQUE' },
    { href: 'produtos.html',    icon: '👗', label: 'Produtos',             id: 'produtos' },
    { href: 'estoque.html',     icon: '📦', label: 'Estoque',              id: 'estoque' },
    { href: 'compras.html',     icon: '🚚', label: 'Compras',              id: 'compras' },
    { href: 'fornecedores.html',icon: '🏭', label: 'Fornecedores',         id: 'fornecedores' },
    { section: 'FINANCEIRO' },
    { href: 'gastos.html',      icon: '💸', label: 'Gastos',               id: 'gastos' },
    { href: 'relatorios.html',  icon: '📈', label: 'Relatórios',           id: 'relatorios' },
    { section: 'SISTEMA', adminOnly: true },
    { href: 'usuarios.html',    icon: '🔑', label: 'Usuários',             id: 'usuarios', adminOnly: true },
    { href: 'acessos.html',     icon: '🛡️', label: 'Controle de Acessos', id: 'acessos', adminOnly: true },
  ];

  let nav = '';
  menu.forEach(item => {
    if (item.section) {
      if (item.adminOnly && !isAdmin) return;
      nav += `<div class="nav-section">${item.section}</div>`;
    } else {
      if (item.adminOnly && !isAdmin) return;
      if (modulos.length > 0 && !item.adminOnly && item.id !== 'dashboard' && !modulos.includes(item.id)) return;
      if (!item.adminOnly && !Auth.temPermissao(item.id, 'consultar')) return;
      nav += `<a href="${item.href}" class="nav-item ${paginaAtiva === item.id ? 'active' : ''}">
        <span class="nav-icon">${item.icon}</span>${item.label}
      </a>`;
    }
  });

  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <span class="brand-icon">${(typeof Tenant !== 'undefined' && Tenant.getLojaAtual()?.icon) || '🌙'}</span>
        <div><div class="brand-text">${(typeof Tenant !== 'undefined' && Tenant.getLojaAtual()?.nome) || 'Fiore Pijamas'}</div></div>
      </div>
    </div>
    <div class="sidebar-user">
      <div class="user-avatar">${Fmt.inicial(user.nome)}</div>
      <div class="user-info">
        <div class="user-name">${user.nome}</div>
        <div class="user-role">${user.papel === 'admin' ? 'Administrador' : 'Vendedor'}</div>
      </div>
    </div>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      <button class="btn-logout" onclick="Auth.logout()">🚪 Sair</button>
    </div>
  </aside>`;
}

// ===== TOAST =====
function mostrarToast(msg, tipo = 'success', dur = 3500) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
  const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.innerHTML = `<span>${icons[tipo] || 'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),350); }, dur);
}

// ===== LOADER =====
function mostrarLoader(msg = 'Carregando...') {
  let el = document.getElementById('global-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-loader';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,.7);display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(2px)';
    el.innerHTML = `<div style="text-align:center"><div style="font-size:32px;animation:spin 1s linear infinite">⟳</div><div style="margin-top:8px;font-size:14px;font-weight:600;color:var(--primary)">${msg}</div></div>`;
    document.body.appendChild(el);
  }
}
function ocultarLoader() {
  const el = document.getElementById('global-loader');
  if (el) el.remove();
}

// Spinner CSS
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);

// ===== MODAL =====
const Modal = {
  abrir(id) { const el=document.getElementById(id); if(el){el.classList.add('open');document.body.style.overflow='hidden';} },
  fechar(id) { const el=document.getElementById(id); if(el){el.classList.remove('open');document.body.style.overflow='';} },
  fecharTodos() { document.querySelectorAll('.modal-overlay.open').forEach(el=>el.classList.remove('open')); document.body.style.overflow=''; }
};
document.addEventListener('click', e => { if(e.target.classList.contains('modal-overlay')) Modal.fecharTodos(); });

// ===== CONFIRM =====
function confirmar(msg, cb) {
  const id = 'modal-confirm-' + Date.now();
  const div = document.createElement('div');
  div.id = id; div.className = 'modal-overlay open';
  div.innerHTML = `<div class="modal" style="max-width:420px">
    <div class="modal-header"><div class="modal-title">⚠️ Confirmação</div>
      <button class="modal-close" onclick="document.getElementById('${id}').remove();document.body.style.overflow=''">✕</button></div>
    <div class="modal-body"><p style="font-size:14px;color:#444">${msg}</p></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="document.getElementById('${id}').remove();document.body.style.overflow=''">Cancelar</button>
      <button class="btn btn-danger" id="${id}-ok">Confirmar</button>
    </div></div>`;
  document.body.appendChild(div);
  document.body.style.overflow = 'hidden';
  document.getElementById(id+'-ok').onclick = () => { div.remove(); document.body.style.overflow=''; cb(); };
}

// ===== BADGE STATUS =====
function badgeStatus(status) {
  const map = {
    'pago':'<span class="badge badge-success">Pago</span>',
    'pendente':'<span class="badge badge-warning">Pendente</span>',
    'cancelada':'<span class="badge badge-danger">Cancelada</span>',
    'cancelado':'<span class="badge badge-danger">Cancelado</span>',
    'parcial':'<span class="badge badge-info">Parcial</span>',
    'ativo':'<span class="badge badge-success">Ativo</span>',
    'inativo':'<span class="badge badge-secondary">Inativo</span>',
    'entrada':'<span class="badge badge-success">Entrada</span>',
    'saida':'<span class="badge badge-danger">Saída</span>',
    'admin':'<span class="badge badge-primary">Admin</span>',
    'vendedor':'<span class="badge badge-info">Vendedor</span>',
    'aguardando':'<span class="badge badge-warning">Aguardando</span>',
    'confirmada':'<span class="badge badge-info">Confirmada</span>',
    'em_producao':'<span class="badge badge-purple">Em Produção</span>',
    'pronta':'<span class="badge badge-success">Pronta</span>',
    'entregue':'<span class="badge badge-secondary">Entregue</span>',
    'aberto':'<span class="badge badge-warning">Aberto</span>',
    'quitado':'<span class="badge badge-success">Quitado</span>',
  };
  return map[status] || `<span class="badge badge-secondary">${status||'-'}</span>`;
}

// ===== FORMAS DE PAGAMENTO =====
const FORMAS_PGTO = [
  { value: 'dinheiro',       label: 'Dinheiro' },
  { value: 'pix',            label: 'PIX' },
  { value: 'cartao_debito',  label: 'Cartão Débito' },
  { value: 'cartao_credito', label: 'Cartão Crédito' },
  { value: 'boleto',         label: 'Boleto' },
  { value: 'transferencia',  label: 'Transferência' },
  { value: 'crediario',      label: 'Crediário' },
  { value: 'carne',          label: 'Carnê' },
];
function labelFormaPgto(val) { return (FORMAS_PGTO.find(f=>f.value===val)||{label:val||'-'}).label; }

// ===== UTILITÁRIOS =====
function gerarParcelasDatas(inicio, num) {
  return Array.from({length: num}, (_, i) => addDias(inicio, 30*(i+1)));
}
function debounce(fn, delay=300) { let t; return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),delay);}; }

// ===== AUTOCOMPLETE DE CLIENTES =====
function setupClienteAutocomplete(inputId, hiddenId, onSelect) {
  const input = document.getElementById(inputId);
  const hidden = document.getElementById(hiddenId);
  if (!input) return;
  let dropdown = null;

  input.addEventListener('input', debounce(async function() {
    const val = this.value.trim();
    if (hidden) hidden.value = '';
    fecharDropdown();
    if (val.length < 2) return;

    const resultados = await DB.Clientes.buscar(val);
    if (!resultados.length) return;

    dropdown = document.createElement('div');
    dropdown.style.cssText = `position:absolute;z-index:9999;background:#fff;border:1.5px solid var(--border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);width:${input.offsetWidth}px;max-height:220px;overflow-y:auto;`;

    resultados.forEach(c => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid #f0f0f0;';
      item.innerHTML = `<strong>${c.nome}</strong>${c.telefone ? ' · '+Fmt.telefone(c.telefone) : ''}`;
      item.addEventListener('mousedown', () => {
        input.value = c.nome;
        if (hidden) hidden.value = c.id;
        fecharDropdown();
        if (onSelect) onSelect(c);
      });
      item.addEventListener('mouseover', () => item.style.background = 'var(--bg2)');
      item.addEventListener('mouseout', () => item.style.background = '');
      dropdown.appendChild(item);
    });

    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    document.body.appendChild(dropdown);
  }, 300));

  input.addEventListener('blur', () => setTimeout(fecharDropdown, 200));
  function fecharDropdown() { if (dropdown) { dropdown.remove(); dropdown = null; } }
}
