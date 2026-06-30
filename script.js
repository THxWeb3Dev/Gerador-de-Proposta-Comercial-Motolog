'use strict';

const DB_VERSION = '1.0.0';
const DB_KEY = `gotrack_routes_db_${DB_VERSION}`;
const LEGACY_KEYS = ['gotrack_routes', 'routes', 'deliveries'];
const SESSION_KEY = 'gotrack_session_v1';
const PRICES = { Natura: 7.5, Outros: 10 };

const app = document.getElementById('app');
const modal = document.getElementById('route-modal');
let state = { user: null, tab: 'history', db: { version: DB_VERSION, routes: [] } };

const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateKey = date => new Date(date).toISOString().slice(0, 10);
const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const logo = () => document.getElementById('brand-logo').innerHTML;

function safeParse(raw) {
  try {
    return JSON.parse(raw || 'null');
  } catch {
    return null;
  }
}

function loadDb() {
  const current = safeParse(localStorage.getItem(DB_KEY));
  if (current?.routes) return current;

  const previousVersionKey = Object.keys(localStorage).find(key => key.startsWith('gotrack_routes_db_'));
  const previous = previousVersionKey ? safeParse(localStorage.getItem(previousVersionKey)) : null;
  if (previous?.routes) return saveDb({ ...previous, version: DB_VERSION });

  for (const key of LEGACY_KEYS) {
    const legacy = safeParse(localStorage.getItem(key));
    if (Array.isArray(legacy)) return saveDb({ version: DB_VERSION, routes: legacy });
  }
  return saveDb({ version: DB_VERSION, routes: seedRoutes() });
}

function saveDb(db = state.db) {
  localStorage.setItem(DB_KEY, JSON.stringify({ ...db, version: DB_VERSION }));
  return { ...db, version: DB_VERSION };
}

function seedRoutes() {
  const today = new Date();
  return [0, 1, 2].map((offset, index) => ({
    id: uid(), recipient: ['Maria Silva', 'João Pereira', 'Ana Costa'][index], district: ['Centro', 'Icaraí', 'Barreto'][index],
    receiver: ['Carlos Silva', 'Lucia Pereira', 'Rafael Costa'][index], document: ['CPF ***.123', '(21) 99999-0000', 'RG 123456'][index],
    category: index === 1 ? 'Outros' : 'Natura', status: index === 2 ? 'estornada' : 'concluida', qrName: 'nota-fiscal.jpg',
    createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset, 10 + index, 25).toISOString()
  }));
}

function init() {
  state.db = loadDb();
  state.user = safeParse(localStorage.getItem(SESSION_KEY));
  render();
}

function render() {
  if (!state.user) return renderLogin();
  app.innerHTML = `<header class="glass topbar"><div class="user">${logo()}<div><h2>Rotas GO Track</h2><p class="muted">Sessão: <b>${escapeHtml(state.user.name)}</b> · v ${DB_VERSION}</p></div></div><button class="btn ghost" data-action="logout">Sair</button></header>${renderTab()}${renderNav()}`;
}

function renderLogin() {
  app.className = 'login';
  app.innerHTML = `<section class="glass login-card"><div class="brand-row">${logo()}<div><h1>GO Track</h1><p>Controle de Entregas</p></div></div><form id="login-form"><div class="field"><label>Usuário</label><input name="name" required minlength="2" autocomplete="username" placeholder="Ex.: admin"></div><div class="field"><label>Senha</label><input name="password" required minlength="3" type="password" autocomplete="current-password" placeholder="Digite sua senha"></div><button class="btn primary" type="submit">Entrar no painel</button></form><p class="muted">Login simples local. A sessão persiste no navegador via localStorage.</p></section>`;
}

function renderNav() {
  const items = [['history', '⌘', 'Histórico'], ['new', '+', 'Nova'], ['close', '▤', 'Fechamento']];
  return `<nav class="glass tabs">${items.map(([id, icon, label]) => `<button class="tab ${state.tab === id ? 'active' : ''}" data-tab="${id}"><span>${icon}</span>${label}</button>`).join('')}</nav>`;
}

function renderTab() {
  if (state.tab === 'new') return renderNew();
  if (state.tab === 'close') return renderClose();
  return renderHistory();
}

function renderHistory() {
  const total = state.db.routes.length;
  const done = state.db.routes.filter(route => route.status === 'concluida').length;
  const reversed = total - done;
  const groups = groupByDay(state.db.routes);
  return `<section class="stats"><div class="glass stat"><span>Total</span><b>${total}</b></div><div class="glass stat"><span>Entregues</span><b>${done}</b></div><div class="glass stat"><span>Estornadas</span><b style="color:#ef6549">${reversed}</b></div></section><section class="glass panel">${total ? Object.entries(groups).map(([day, routes]) => `<div class="day"><h3>${day}</h3>${routes.map(routeCard).join('')}</div>`).join('') : `<div class="empty">${logo()}<h2>Nenhuma rota cadastrada ainda</h2><p class="muted">Adicione sua primeira entrega para vê-la organizada por dia da semana.</p></div>`}</section>`;
}

function groupByDay(routes) {
  return [...routes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).reduce((acc, route) => {
    const label = new Date(route.createdAt).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
    acc[label] = acc[label] || [];
    acc[label].push(route);
    return acc;
  }, {});
}

function routeCard(route) {
  return `<button class="route" data-open-route="${route.id}"><div><strong>${escapeHtml(route.recipient)}</strong><p class="muted">${escapeHtml(route.district)} · ${new Date(route.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${route.category}</p></div><span class="badge ${route.status === 'concluida' ? 'ok' : 'back'}">${route.status}</span></button>`;
}

function renderNew() {
  return `<section class="glass panel"><h1>Nova Entrega</h1><p class="muted">Registre a rota com os dados do recebedor e a nota fiscal.</p><form id="delivery-form" class="form-grid"><div class="field"><label>Nome do destinatário</label><input name="recipient" required placeholder="Ex.: Maria Silva"></div><div class="field"><label>Bairro</label><input name="district" required placeholder="Ex.: Centro"></div><div class="field"><label>Nome do recebedor</label><input name="receiver" required placeholder="Quem recebeu"></div><div class="field"><label>Documento / telefone</label><input name="document" required placeholder="RG, CPF ou telefone"></div><div class="field"><label>Status</label><select name="status"><option value="concluida">Concluída</option><option value="estornada">Estornada</option></select></div><div class="field"><span class="section-label">Origem da carga</span><div class="switch"><input id="nat" name="category" value="Natura" type="radio" checked><label for="nat">Natura</label><input id="out" name="category" value="Outros" type="radio"><label for="out">Outros</label></div></div><div class="span"><span class="section-label">Código QR / Nota Fiscal</span><label class="filebox"><strong>📷 Tirar foto ou anexar</strong><span id="file-name" class="muted">PNG/JPG até 4 MB</span><input name="qr" type="file" accept="image/png,image/jpeg" capture="environment"></label></div><button class="btn primary span" type="submit">Registrar entrega</button></form></section>`;
}

function closurePeriod(previous = false) {
  const now = new Date();
  const end = now.getDate() <= 15 ? new Date(now.getFullYear(), now.getMonth(), 15) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const start = end.getDate() === 15 ? new Date(end.getFullYear(), end.getMonth(), 1) : new Date(end.getFullYear(), end.getMonth(), 16);
  if (!previous) return { start, end };
  const prevEnd = new Date(start); prevEnd.setDate(start.getDate() - 1);
  const prevStart = prevEnd.getDate() === 15 ? new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1) : new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 16);
  return { start: prevStart, end: prevEnd };
}

function rowsForPeriod(period) {
  const rows = [];
  for (let d = new Date(period.start); d <= period.end; d.setDate(d.getDate() + 1)) {
    const routes = state.db.routes.filter(route => dateKey(route.createdAt) === dateKey(d));
    const done = routes.filter(route => route.status === 'concluida');
    const reversed = routes.filter(route => route.status === 'estornada').length;
    const natura = done.filter(route => route.category === 'Natura').length;
    const outros = done.filter(route => route.category === 'Outros').length;
    rows.push({ date: new Date(d), done: done.length, reversed, natura, outros, value: natura * PRICES.Natura + outros * PRICES.Outros });
  }
  return rows;
}

function renderClose() {
  const period = closurePeriod(state.previousPeriod);
  const rows = rowsForPeriod(period);
  const totals = rows.reduce((acc, row) => ({ done: acc.done + row.done, reversed: acc.reversed + row.reversed, natura: acc.natura + row.natura, outros: acc.outros + row.outros, value: acc.value + row.value }), { done: 0, reversed: 0, natura: 0, outros: 0, value: 0 });
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const isClosingDay = today.getDate() === 15 || today.getDate() === lastDay;
  return `<section class="glass panel"><h2>${isClosingDay ? 'Hoje é dia de fechamento' : 'Prévia de fechamento'}</h2><p class="muted">Período: ${period.start.toLocaleDateString('pt-BR')} – ${period.end.toLocaleDateString('pt-BR')}</p><div class="actions"><button class="btn ${state.previousPeriod ? 'ghost' : 'primary'}" data-period="current">Período atual</button><button class="btn ${state.previousPeriod ? 'primary' : 'ghost'}" data-period="previous">Período anterior</button><button class="btn primary" data-action="pdf">Gerar e baixar PDF</button></div><div class="totals"><div class="total"><b>${totals.done}</b><span> entregues</span></div><div class="total"><b>${totals.reversed}</b><span> estornadas</span></div><div class="total"><b>${totals.natura}</b><span> Natura</span></div><div class="total"><b>${money(totals.value)}</b><span> total</span></div></div><div class="table-wrap"><table><thead><tr><th>Dia</th><th>Concluídas</th><th>Estornadas</th><th>Natura</th><th>Outros</th><th>Valor</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td><td>${row.done}</td><td>${row.reversed}</td><td>${row.natura}</td><td>${row.outros}</td><td>${money(row.value)}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function openRoute(id) {
  const route = state.db.routes.find(item => item.id === id);
  if (!route) return;
  modal.innerHTML = `<article class="glass modal-card"><h2>${escapeHtml(route.recipient)}</h2><p class="muted">${new Date(route.createdAt).toLocaleString('pt-BR')}</p><p><b>Status:</b> ${route.status}</p><p><b>Bairro:</b> ${escapeHtml(route.district)}</p><p><b>Recebedor:</b> ${escapeHtml(route.receiver)}</p><p><b>Documento/Telefone:</b> ${escapeHtml(route.document)}</p><p><b>Categoria:</b> ${route.category} · <b>QR:</b> ${escapeHtml(route.qrName || 'não anexado')}</p><div class="actions"><button class="btn ghost" data-action="close-modal">Fechar</button><button class="btn danger" data-delete="${route.id}">Excluir rota</button></div></article>`;
  modal.setAttribute('aria-hidden', 'false');
}

function generatePdf() {
  if (typeof html2pdf === 'undefined') return alert('Biblioteca de PDF indisponível. Verifique a conexão e tente novamente.');
  const content = document.createElement('div');
  content.className = 'print-report';
  content.innerHTML = `<h1>GO Track Routes - Relatório de Faturamento</h1>${renderClose().replace(/<button[\s\S]*?<\/button>/g, '')}`;
  html2pdf().set({ margin: 10, filename: `GOTrack_Fechamento_${dateKey(new Date())}.pdf`, jsPDF: { unit: 'mm', format: 'a4' } }).from(content).save();
}

document.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'login-form') {
    state.user = { name: new FormData(event.target).get('name').trim(), loginAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.user));
    app.className = 'shell';
    render();
  }
  if (event.target.id === 'delivery-form') {
    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries());
    if (['recipient', 'district', 'receiver', 'document'].some(key => !String(values[key]).trim())) return alert('Preencha todos os campos obrigatórios.');
    state.db.routes.unshift({ id: uid(), recipient: values.recipient.trim(), district: values.district.trim(), receiver: values.receiver.trim(), document: values.document.trim(), category: values.category, status: values.status, qrName: values.qr?.name || '', createdAt: new Date().toISOString() });
    state.db = saveDb();
    state.tab = 'history';
    render();
  }
});

document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.tab) { state.tab = target.dataset.tab; render(); }
  if (target.dataset.action === 'logout') { localStorage.removeItem(SESSION_KEY); state.user = null; app.className = 'login'; render(); }
  if (target.dataset.openRoute) openRoute(target.dataset.openRoute);
  if (target.dataset.action === 'close-modal') modal.setAttribute('aria-hidden', 'true');
  if (target.dataset.delete) { state.db.routes = state.db.routes.filter(route => route.id !== target.dataset.delete); state.db = saveDb(); modal.setAttribute('aria-hidden', 'true'); render(); }
  if (target.dataset.period) { state.previousPeriod = target.dataset.period === 'previous'; render(); }
  if (target.dataset.action === 'pdf') generatePdf();
});

document.addEventListener('change', event => {
  if (event.target.name === 'qr') document.getElementById('file-name').textContent = event.target.files[0]?.name || 'PNG/JPG até 4 MB';
});

init();
