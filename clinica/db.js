/* =====================================================================
   CLÍNICA · banco de dados no aparelho (IndexedDB) e backup criptografado
   Todo registro tem id (UUID), criadoEm, atualizadoEm e excluido,
   para a sincronização em nuvem da fase 2 não exigir migração.
   ===================================================================== */
const NOME = 'clinica-rebeca';
const VERSAO = 1;
export const TABELAS = ['pacientes', 'atendimentos', 'despesas', 'fixos', 'anexos', 'ajustes'];

let conexao;
function abrir() {
  if (conexao) return conexao;
  conexao = new Promise((ok, erro) => {
    const req = indexedDB.open(NOME, VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const t of TABELAS) if (!db.objectStoreNames.contains(t)) db.createObjectStore(t, { keyPath: 'id' });
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
  return conexao;
}
async function tx(tabela, modo, fn) {
  const db = await abrir();
  return new Promise((ok, erro) => {
    const t = db.transaction(tabela, modo);
    const store = t.objectStore(tabela);
    const res = fn(store);
    t.oncomplete = () => ok(res?.result ?? res);
    t.onerror = () => erro(t.error);
    t.onabort = () => erro(t.error || new Error('Transação cancelada'));
  });
}

export const novoId = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2));
const agora = () => new Date().toISOString();

export async function todos(tabela) {
  return tx(tabela, 'readonly', s => s.getAll());
}
export async function pegar(tabela, id) {
  return tx(tabela, 'readonly', s => s.get(id));
}
export async function salvar(tabela, registro) {
  const r = { ...registro };
  r.id ||= novoId();
  r.criadoEm ||= agora();
  r.atualizadoEm = agora();
  r.excluido ??= false;
  await tx(tabela, 'readwrite', s => s.put(r));
  return r;
}
/* Exclusão lógica: some das telas, mas continua sabendo que foi excluído (para sincronizar depois) */
export async function excluir(tabela, id) {
  const r = await pegar(tabela, id);
  if (!r) return;
  if (tabela === 'anexos') { r.arquivo = null; }
  return salvar(tabela, { ...r, excluido: true });
}

/* Ajustes: um registro por chave */
export async function lerAjuste(chave, padrao) {
  const r = await pegar('ajustes', chave);
  return r ? r.valor : padrao;
}
export async function gravarAjuste(chave, valor) {
  return salvar('ajustes', { id: chave, valor });
}

/* Pede ao navegador para não apagar os dados quando faltar espaço */
export async function pedirPersistencia() {
  try {
    if (navigator.storage?.persisted && await navigator.storage.persisted()) return true;
    return navigator.storage?.persist ? await navigator.storage.persist() : false;
  } catch { return false; }
}

/* ---------- Imagens: reduz a foto para ~1600px em JPEG (≈200–400 KB) ---------- */
export async function comprimirImagem(arquivo, lado = 1600, qualidade = 0.78) {
  if (!arquivo.type.startsWith('image/') || arquivo.type === 'image/gif') return arquivo;
  try {
    const bmp = await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, lado / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * escala), h = Math.round(bmp.height * escala);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise(ok => canvas.toBlob(ok, 'image/jpeg', qualidade));
    return blob && blob.size < arquivo.size ? new File([blob], (arquivo.name || 'foto').replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : arquivo;
  } catch { return arquivo; }
}
export const blobParaBase64 = blob => new Promise((ok, erro) => {
  const r = new FileReader();
  r.onload = () => ok(String(r.result).split(',')[1]);
  r.onerror = () => erro(r.error);
  r.readAsDataURL(blob);
});
const base64ParaBlob = (b64, tipo) => {
  const bin = atob(b64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
};

/* ---------- Backup ----------
   Arquivo .clinica = JSON criptografado com AES-GCM; a chave vem da senha do backup (PBKDF2, 250 mil voltas).
   Sem a senha, o arquivo é ilegível. Por isso dá para guardar no Drive ou mandar para si mesma. */
const enc = new TextEncoder(), dec = new TextDecoder();
async function chaveDaSenha(senha, sal) {
  const base = await crypto.subtle.importKey('raw', enc.encode(senha), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: sal, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
const b64 = bytes => btoa(String.fromCharCode(...bytes));
const deB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function gerarBackup(senha) {
  const dados = { formato: 'clinica-backup', versao: 1, geradoEm: agora(), tabelas: {} };
  for (const t of TABELAS) {
    const linhas = await todos(t);
    if (t === 'anexos') {
      dados.tabelas[t] = [];
      for (const a of linhas) dados.tabelas[t].push({ ...a, arquivo: null, arquivoB64: a.arquivo ? await blobParaBase64(a.arquivo) : null });
    } else if (t === 'ajustes') {
      dados.tabelas[t] = linhas.filter(a => !['chaveIA', 'pinHash'].includes(a.id)); // a chave da IA e o PIN não vão no backup
    } else dados.tabelas[t] = linhas;
  }
  const sal = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chave = await chaveDaSenha(senha, sal);
  /* comprime antes de criptografar, quando o navegador permite */
  let bruto = enc.encode(JSON.stringify(dados));
  let comprimido = false;
  if (typeof CompressionStream !== 'undefined') {
    bruto = new Uint8Array(await new Response(new Blob([bruto]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    comprimido = true;
  }
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chave, bruto));
  const envelope = { formato: 'clinica-backup-cripto', versao: 1, gzip: comprimido, sal: b64(sal), iv: b64(iv), dados: b64Grande(cifrado) };
  return new Blob([JSON.stringify(envelope)], { type: 'application/octet-stream' });
}
function b64Grande(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export async function lerBackup(arquivo, senha) {
  const envelope = JSON.parse(await arquivo.text());
  if (envelope.formato !== 'clinica-backup-cripto') throw new Error('Este arquivo não é um backup da Clínica.');
  const chave = await chaveDaSenha(senha, deB64(envelope.sal));
  let bruto;
  try { bruto = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(envelope.iv) }, chave, deB64(envelope.dados))); }
  catch { throw new Error('Senha do backup incorreta.'); }
  if (envelope.gzip) bruto = new Uint8Array(await new Response(new Blob([bruto]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const dados = JSON.parse(dec.decode(bruto));
  if (dados.formato !== 'clinica-backup') throw new Error('Backup em formato desconhecido.');
  return dados;
}

/* Junta o backup com o que já está no aparelho: fica a versão mais recente de cada registro */
export async function restaurarBackup(dados) {
  let total = 0;
  const db = await abrir();
  for (const t of TABELAS) {
    const linhas = dados.tabelas[t] || [];
    const atuais = new Map((await todos(t)).map(r => [r.id, r]));
    await new Promise((ok, erro) => {
      const tr = db.transaction(t, 'readwrite');
      const s = tr.objectStore(t);
      for (const linha of linhas) {
        const atual = atuais.get(linha.id);
        if (atual && atual.atualizadoEm >= linha.atualizadoEm) continue;
        const r = { ...linha };
        if (t === 'anexos') { r.arquivo = r.arquivoB64 ? base64ParaBlob(r.arquivoB64, r.tipoArquivo || 'image/jpeg') : null; delete r.arquivoB64; }
        s.put(r); total++;
      }
      tr.oncomplete = ok; tr.onerror = () => erro(tr.error);
    });
  }
  return total;
}

/* Só para a prévia de demonstração: esvazia as tabelas de dados (não toca nos ajustes) */
export async function esvaziarDados() {
  const db = await abrir();
  for (const t of ['pacientes', 'atendimentos', 'despesas', 'fixos', 'anexos']) {
    await new Promise((ok, erro) => { const tr = db.transaction(t, 'readwrite'); tr.objectStore(t).clear(); tr.oncomplete = ok; tr.onerror = () => erro(tr.error); });
  }
}

/* Resumo de hash (para o PIN) */
export async function hashTexto(texto) {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(texto));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}
