/**
 * tenant.js — Sistema Multi-Tenant (SaaS)
 * Detecta o subdomínio da URL, carrega os dados da loja no Supabase
 * e aplica o tema (cores, nome, ícone) dinamicamente em todas as páginas.
 *
 * Ordem de carregamento obrigatória nos HTMLs:
 *   supabase-client.js → tenant.js → db.js → app.js
 */

const Tenant = (() => {

  const SESSION_KEY = 'tenant_loja';

  // ---------------------------------------------------------------
  // detectarSlug()
  // Extrai o slug do tenant a partir do subdomínio da URL.
  // Ex: fiore.v3tec.com.br  → 'fiore'
  //     salao.v3tec.com.br  → 'salao'
  // Fallback para desenvolvimento: query param ?loja=fiore
  // ---------------------------------------------------------------
  function detectarSlug() {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Subdomínio real: precisa ter pelo menos 3 partes (sub.dominio.tld)
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }

    // Fallback: query param ?loja=fiore (para localhost e Vercel preview)
    const params = new URLSearchParams(window.location.search);
    return params.get('loja') || 'fiore';
  }

  // ---------------------------------------------------------------
  // carregarLoja(slug)
  // Busca os dados da loja na tabela 'lojas' pelo slug.
  // Retorna o objeto da loja ou null se não encontrada.
  // ---------------------------------------------------------------
  async function carregarLoja(slug) {
    try {
      const { data, error } = await _sb
        .from('lojas')
        .select('*')
        .eq('slug', slug)
        .eq('ativo', true)
        .single();

      if (error || !data) {
        console.warn(`[Tenant] Loja "${slug}" não encontrada.`);
        return null;
      }

      return data;
    } catch (e) {
      console.error('[Tenant] Erro ao carregar loja:', e);
      return null;
    }
  }

  // ---------------------------------------------------------------
  // aplicarTema(loja)
  // Aplica o tema da loja via CSS custom properties e atualiza
  // o título da página e o cabeçalho da sidebar.
  // ---------------------------------------------------------------
  function _luminosidade(hex) {
    const { r, g, b } = _hexParaRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function aplicarTema(loja) {
    if (!loja) return;

    const r = document.documentElement;

    // Cores principais
    const primary = loja.cor_primaria || '#B5124A';
    const sidebar  = loja.cor_sidebar  || '#3D0022';

    r.style.setProperty('--primary',       primary);
    r.style.setProperty('--primary-dark',  escurecer(primary, 20));
    r.style.setProperty('--primary-light', clarear(primary, 15));
    r.style.setProperty('--sidebar',       sidebar);
    r.style.setProperty('--sidebar2',      clarear(sidebar, 12));

    // Adapta cores do texto da sidebar conforme luminosidade do fundo
    const sidebarEscura = _luminosidade(sidebar) < 0.4;
    if (sidebarEscura) {
      r.style.setProperty('--nav-text',          'rgba(255,255,255,0.72)');
      r.style.setProperty('--nav-text-active',   '#ffffff');
      r.style.setProperty('--nav-section-text',  'rgba(255,255,255,0.38)');
      r.style.setProperty('--sidebar-user-bg',   'rgba(255,255,255,0.1)');
      r.style.setProperty('--sidebar-user-border','rgba(255,255,255,0.12)');
      r.style.setProperty('--nav-active-bg',     'rgba(255,255,255,0.15)');
      r.style.setProperty('--sidebar-border-color','rgba(255,255,255,0.1)');
    } else {
      r.style.setProperty('--nav-text',          'var(--text2)');
      r.style.setProperty('--nav-text-active',   'var(--text)');
      r.style.setProperty('--nav-section-text',  'var(--text3)');
      r.style.setProperty('--sidebar-user-bg',   'var(--white)');
      r.style.setProperty('--sidebar-user-border','var(--border)');
      r.style.setProperty('--nav-active-bg',     'var(--white)');
      r.style.setProperty('--sidebar-border-color','var(--border)');
    }

    // Título da aba do navegador
    if (document.title) {
      document.title = document.title.replace('Fiore Pijamas', loja.nome);
    }

    // Sidebar brand (atualizado após renderSidebar inserir o HTML)
    _atualizarSidebarBrand(loja);
  }

  // Atualiza o brand da sidebar assim que os elementos estiverem no DOM
  function _atualizarSidebarBrand(loja) {
    let observer;

    const tentar = () => {
      const iconEl = document.querySelector('.brand-icon');
      const nomeEl = document.querySelector('.brand-text');
      if (iconEl && nomeEl) {
        // Para de observar ANTES de modificar o DOM para evitar loop infinito
        if (observer) observer.disconnect();
        iconEl.textContent = loja.icon || '🏪';
        nomeEl.textContent = loja.nome || 'Sistema';
        if (loja.logo_url) {
          const logoEl = document.querySelector('.brand-logo');
          if (logoEl) logoEl.src = loja.logo_url;
        }
        return; // encontrou — não precisa mais observar
      }
      // Elementos ainda não renderizados — observa o DOM
      if (!observer) {
        observer = new MutationObserver(tentar);
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer && observer.disconnect(), 3000);
      }
    };

    tentar();
  }

  // ---------------------------------------------------------------
  // Utilitários de cor (hex → ajuste de luminosidade)
  // ---------------------------------------------------------------
  function _hexParaRgb(hex) {
    const h = hex.replace('#', '');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function _rgbParaHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
  }

  function escurecer(hex, pct) {
    const { r, g, b } = _hexParaRgb(hex);
    const f = 1 - pct / 100;
    return _rgbParaHex(Math.round(r * f), Math.round(g * f), Math.round(b * f));
  }

  function clarear(hex, pct) {
    const { r, g, b } = _hexParaRgb(hex);
    return _rgbParaHex(
      Math.round(r + (255 - r) * pct / 100),
      Math.round(g + (255 - g) * pct / 100),
      Math.round(b + (255 - b) * pct / 100)
    );
  }

  // ---------------------------------------------------------------
  // getLojaAtual()
  // Retorna o objeto da loja salvo no sessionStorage.
  // ---------------------------------------------------------------
  function getLojaAtual() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------
  // salvarLoja(loja)
  // Persiste o objeto da loja no sessionStorage.
  // ---------------------------------------------------------------
  function salvarLoja(loja) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(loja));
  }

  // ---------------------------------------------------------------
  // temModulo(loja, modulo)
  // Retorna true se a loja tem o módulo informado habilitado.
  // ---------------------------------------------------------------
  function temModulo(loja, modulo) {
    if (!loja || !loja.modulos) return false;
    return loja.modulos.includes(modulo);
  }

  // ---------------------------------------------------------------
  // inicializarTenant()
  // Função principal — chamada no topo de cada página.
  // 1. Verifica sessionStorage (evita nova chamada ao banco)
  // 2. Se não tiver cache, detecta slug e carrega do Supabase
  // 3. Aplica o tema
  // Retorna o objeto loja.
  // ---------------------------------------------------------------
  async function inicializarTenant() {
    // Usa cache da sessão se disponível
    let loja = getLojaAtual();

    if (!loja) {
      const slug = detectarSlug();
      loja = await carregarLoja(slug);
      if (loja) salvarLoja(loja);
    }

    aplicarTema(loja);
    return loja;
  }

  // API pública
  return {
    detectarSlug,
    carregarLoja,
    aplicarTema,
    getLojaAtual,
    salvarLoja,
    temModulo,
    inicializarTenant
  };

})();
