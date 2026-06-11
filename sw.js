// Fiore Pijamas — Service Worker
// Estratégia: network-first com fallback para cache (app sempre atualizado, offline funcional)
// IMPORTANTE: bumpar a versão do CACHE a cada deploy para invalidar caches antigos
const CACHE = 'fiore-v1';

const ASSETS = [
  '/', '/index.html', '/dashboard.html', '/pdv.html', '/vendas.html',
  '/clientes.html', '/encomendas.html', '/cobrancas.html', '/compras.html',
  '/estoque.html', '/fornecedores.html', '/funcionarios.html', '/gastos.html',
  '/produtos.html', '/relatorios.html', '/servicos.html', '/usuarios.html',
  '/acessos.html', '/carnes.html', '/agenda.html',
  '/css/style.css',
  '/js/supabase-client.js', '/js/tenant.js', '/js/db.js',
  '/js/icons.js', '/js/app.js', '/js/pwa.js',
  '/manifest.json', '/icons/icon-192.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // allSettled: um asset com 404 não aborta a instalação inteira
      Promise.allSettled(ASSETS.map(a => c.add(a)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (e.request.method !== 'GET') return;
  if (url.includes('supabase.co')) return; // nunca intercepta o banco de dados
  if (!url.startsWith('http')) return;     // chrome-extension:// etc.

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // cacheia respostas OK same-origin e opacas (Google Fonts / jsdelivr via no-cors)
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(hit =>
          hit || (e.request.mode === 'navigate' ? caches.match('/index.html') : undefined)
        )
      )
  );
});
