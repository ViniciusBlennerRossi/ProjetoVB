/**
 * pwa.js — Instalação do app Fiore Pijamas (PWA)
 * Autocontido: registra o service worker e injeta o botão flutuante
 * Web/App em todas as páginas. Sem dependências de outros scripts.
 */
(function () {
  'use strict';

  const DISMISS_KEY = 'fiore-pwa-dismissed';
  const DISMISS_DAYS = 14;

  // ---- Detecção de ambiente ----
  const isStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // ---- Service Worker (sempre registra, mesmo no app instalado) ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // Já está rodando como app instalado — não mostra botão
  if (isStandalone) return;

  // ---- Captura o prompt de instalação (Android/Chrome) ----
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    localStorage.removeItem(DISMISS_KEY);
    removerUI();
  });

  // ---- Dispensa com expiração ----
  const dispensadoEm = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
  if (dispensadoEm) {
    const dias = (Date.now() - dispensadoEm) / 86400000;
    if (dias < DISMISS_DAYS) return;
    localStorage.removeItem(DISMISS_KEY);
  }

  // ---- UI: botão flutuante + popover ----
  let wrap = null;

  function removerUI() {
    if (wrap) { wrap.remove(); wrap = null; }
  }

  function montarUI() {
    const css = `
      .pwa-fab-wrap { position: fixed; right: 16px; bottom: 16px; z-index: 950; font-family: 'Manrope', sans-serif; }
      .pwa-fab {
        width: 52px; height: 52px; border-radius: 50%;
        background: #B5124A; color: #fff; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(181,18,74,.4);
        transition: transform .15s, box-shadow .15s;
      }
      .pwa-fab:hover { transform: scale(1.08); box-shadow: 0 6px 18px rgba(181,18,74,.5); }
      .pwa-pop {
        position: absolute; right: 0; bottom: 64px; width: 260px;
        background: #fff; border-radius: 14px; padding: 16px;
        box-shadow: 0 10px 36px rgba(0,0,0,.18); border: 1px solid #f0e0e6;
        display: none;
      }
      .pwa-pop.aberto { display: block; }
      .pwa-pop-titulo { font-size: 14px; font-weight: 800; color: #2d2d2d; margin-bottom: 4px; }
      .pwa-pop-sub { font-size: 12px; color: #756169; margin-bottom: 12px; }
      .pwa-pop button {
        width: 100%; padding: 10px; border-radius: 8px; border: none;
        font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
      }
      .pwa-btn-instalar { background: #B5124A; color: #fff; margin-bottom: 8px; }
      .pwa-btn-instalar:hover { background: #93103c; }
      .pwa-btn-web { background: transparent; color: #756169; }
      .pwa-btn-web:hover { background: #f7f2f4; }
      .pwa-ios-passos { font-size: 12.5px; color: #4a4a4a; line-height: 1.7; margin-bottom: 12px; }
      @media print { .pwa-fab-wrap { display: none !important; } }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    wrap = document.createElement('div');
    wrap.className = 'pwa-fab-wrap';
    wrap.innerHTML = `
      <div class="pwa-pop" id="pwa-pop">
        <div id="pwa-pop-conteudo">
          <div class="pwa-pop-titulo">📱 Fiore Pijamas</div>
          <div class="pwa-pop-sub">Como você prefere usar o sistema?</div>
          <button class="pwa-btn-instalar" id="pwa-btn-instalar">⬇️ Instalar App</button>
          <button class="pwa-btn-web" id="pwa-btn-web">Continuar na Web</button>
        </div>
      </div>
      <button class="pwa-fab" id="pwa-fab" title="Instalar o app Fiore" aria-label="Instalar o app Fiore">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      </button>
    `;
    document.body.appendChild(wrap);

    const pop = wrap.querySelector('#pwa-pop');
    const fab = wrap.querySelector('#pwa-fab');

    fab.addEventListener('click', e => {
      e.stopPropagation();
      pop.classList.toggle('aberto');
    });

    document.addEventListener('click', e => {
      if (wrap && !wrap.contains(e.target)) pop.classList.remove('aberto');
    });

    wrap.querySelector('#pwa-btn-web').addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      removerUI();
    });

    wrap.querySelector('#pwa-btn-instalar').addEventListener('click', () => {
      const conteudo = wrap.querySelector('#pwa-pop-conteudo');

      if (isIOS) {
        conteudo.innerHTML = `
          <div class="pwa-pop-titulo">📱 Instalar no iPhone</div>
          <div class="pwa-ios-passos">
            1. Toque em <strong>Compartilhar</strong> <span style="font-size:15px">⬆️</span> na barra do Safari<br>
            2. Role e toque em <strong>"Adicionar à Tela de Início"</strong><br>
            3. Toque em <strong>"Adicionar"</strong>
          </div>
          <button class="pwa-btn-web" id="pwa-btn-ok">Entendi</button>
        `;
        conteudo.querySelector('#pwa-btn-ok').addEventListener('click', () => {
          pop.classList.remove('aberto');
        });
        return;
      }

      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(escolha => {
          if (escolha.outcome === 'accepted') removerUI();
          deferredPrompt = null;
          if (pop) pop.classList.remove('aberto');
        });
        return;
      }

      // Sem prompt disponível (já instalado, critérios não atendidos ou navegador sem suporte)
      conteudo.innerHTML = `
        <div class="pwa-pop-titulo">📱 Instalar o app</div>
        <div class="pwa-ios-passos">
          Use o menu do navegador (⋮) e toque em<br>
          <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
        </div>
        <button class="pwa-btn-web" id="pwa-btn-ok">Entendi</button>
      `;
      conteudo.querySelector('#pwa-btn-ok').addEventListener('click', () => {
        pop.classList.remove('aberto');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montarUI);
  } else {
    montarUI();
  }
})();
