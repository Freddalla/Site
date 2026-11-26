/* CLÍNICA · service worker: o app abre mesmo sem internet.
   Rede primeiro (pega a versão nova quando há internet); sem internet, usa a cópia guardada.
   Ao mudar a lista de arquivos, aumente VERSAO. */
const VERSAO = 'clinica-v2';
const ARQUIVOS = ['./', 'index.html', 'app.css', 'app.js', 'dados.js', 'db.js', 'interpretador.js', 'ia.js',
  'manifest.webmanifest', 'icones/icone.svg', 'icones/icone-192.png', 'icones/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  const velhos = ks => ks.filter(k => k !== VERSAO);
  e.waitUntil(caches.keys().then(ks => Promise.all(velhos(ks).map(k => caches['delete'](k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const proprio = url.origin === location.origin;
  const fonte = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  if (!proprio && !fonte) return; // a API da IA vai sempre direto pela rede
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copia = res.clone(); caches.open(VERSAO).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true })
      .then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
