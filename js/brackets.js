import { R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCH, THIRD_MATCH } from './data.js';
import { getState, resolveTeam } from './store.js';
import { initEvents } from './event.js';

const colR16   = document.getElementById('col-r16');
const colQF    = document.getElementById('col-qf');
const colSF    = document.getElementById('col-sf');
const colFinal = document.getElementById('col-final');
const colThird = document.getElementById('col-third');

const connR16QF = document.getElementById('conn-r16-qf');
const connQFSF  = document.getElementById('conn-qf-sf');
const connSFFin = document.getElementById('conn-sf-fin');

/**
 * Punto de entrada: re-renderiza todo el bracket.
 * Llamado cada vez que el store notifica un cambio.
 */
export function renderBracket() {
  const { results } = getState();

  renderColumn(colR16,   R16_MATCHES,   results, 'm', 8);
  renderColumn(colQF,    QF_MATCHES,    results, 'q', 4);
  renderColumn(colSF,    SF_MATCHES,    results, 's', 2);
  renderFinal(colFinal,  FINAL_MATCH,   results);
  renderThird(colThird,  THIRD_MATCH,   results);

  renderConnectors(connR16QF, 8);
  renderConnectors(connQFSF,  4);
  renderConnectorsFinal(connSFFin);
}

/* ── RENDER DE UNA COLUMNA ── */
/**
 * @param {HTMLElement} container
 * @param {Array} matches
 * @param {Object} results
 * @param {string} prefix  prefijo del id del match
 * @param {number} totalPairs  total de pares en la fase (para calcular espacio)
 */
function renderColumn(container, matches, results, prefix, totalPairs) {
  container.innerHTML = '';
  // Altura total disponible (aprox): 40px * totalPairs * 2 slots + gaps
  // Distribuimos el espacio entre pares con margin-bottom.
  const gapPx = totalPairs <= 4 ? 24 : totalPairs <= 2 ? 60 : 8;

  matches.forEach((match, idx) => {
    const pair = buildMatchPair(match, results);
    pair.style.marginBottom = idx < matches.length - 1 ? `${gapPx}px` : '0';
    container.appendChild(pair);
  });
}

/* ── CONSTRUCCIÓN DE UN PAR DE SLOTS ── */
function buildMatchPair(match, results, extraClass = '') {
  const pair = document.createElement('div');
  pair.classList.add('match-pair');
  if (extraClass) pair.classList.add(extraClass);
  pair.dataset.matchId = match.id;

  const t1 = resolveTeam(match.id, 't1');
  const t2 = resolveTeam(match.id, 't2');
  const res = results[match.id];

  pair.appendChild(buildSlot(match, 't1', t1, res, match.label));
  pair.appendChild(buildSlot(match, 't2', t2, res, ''));

  return pair;
}

/**
 * Construye un slot individual (una fila del partido).
 */
function buildSlot(match, slotKey, team, result, label) {
  const slot = document.createElement('div');
  slot.classList.add('match-slot');
  slot.dataset.matchId  = match.id;
  slot.dataset.slotKey  = slotKey;

  const teamName = team?.name || null;
  const teamFlag = team?.flag || '';

  // Estado del slot
  if (!team) {
    slot.classList.add('match-slot--empty');
  } else if (result) {
    const isWinner = result.winner === teamName;
    slot.classList.add(isWinner ? 'match-slot--winner' : 'match-slot--loser');
  }

  // Número de partido (solo en el primer slot)
  const numEl = document.createElement('span');
  numEl.classList.add('slot-number');
  numEl.textContent = label;

  // Bandera
  const flagEl = document.createElement('span');
  flagEl.classList.add('slot-flag');
  flagEl.textContent = teamFlag;
  flagEl.setAttribute('aria-hidden', 'true');

  // Nombre
  const nameEl = document.createElement('span');
  nameEl.classList.add('slot-name', ...(team ? [] : ['slot-name--placeholder']));
  nameEl.textContent = team ? teamName : 'Por definir';

  // Marcador
  const scoreEl = document.createElement('span');
  scoreEl.classList.add('slot-score');
  if (result) {
    const score = slotKey === 't1' ? result.result.score1 : result.result.score2;
    scoreEl.textContent = score;
  }

  // Badge penales
  if (result?.result.penWinner === teamName && result.result.score1 === result.result.score2) {
    const pen = document.createElement('span');
    pen.classList.add('slot-pen-badge');
    pen.textContent = 'PEN';
    slot.appendChild(numEl);
    slot.appendChild(flagEl);
    slot.appendChild(nameEl);
    slot.appendChild(scoreEl);
    slot.appendChild(pen);
    return slot;
  }

  slot.appendChild(numEl);
  slot.appendChild(flagEl);
  slot.appendChild(nameEl);
  slot.appendChild(scoreEl);

  return slot;
}

/* ── FINAL ── */
function renderFinal(container, match, results) {
  container.innerHTML = '';
  const pair = buildMatchPair(match, results, 'match-pair--final');
  container.appendChild(pair);
}

/* ── TERCER PUESTO ── */
  function renderThird(container, match, results) {
    container.innerHTML = '';
    const pair = buildMatchPair(match, results, 'match-pair--third');
    container.appendChild(pair);
  }

/* ── CONECTORES SVG ── */
/**
 * Genera conectores visuales entre columnas.
 * Cada conector une dos pares de la fase anterior con un par de la fase siguiente.
 * @param {HTMLElement} container
 * @param {number} pairsCount  número de pares en la fase ORIGEN (izquierda)
 */


function renderConnectors(container, pairsCount) {
  container.innerHTML = '';
  const groups = pairsCount / 2; // número de conectores (cada uno une 2 pares)

  for (let i = 0; i < groups; i++) {
    const group = document.createElement('div');
    group.style.cssText = `
      display: flex; flex-direction: column; flex: 1;
      justify-content: space-around;
      margin-top: ${pairsCount === 8 ? '0' : '0'}px;
    `;

    // Brazo superior
    const armTop = document.createElement('div');
    armTop.style.cssText = `
      flex: 1;
      border-top: 1px solid rgba(255,255,255,0.10);
      border-right: 1px solid rgba(255,255,255,0.10);
      border-radius: 0 4px 0 0;
    `;

    // Brazo inferior
    const armBot = document.createElement('div');
    armBot.style.cssText = `
      flex: 1;
      border-bottom: 1px solid rgba(255,255,255,0.10);
      border-right: 1px solid rgba(255,255,255,0.10);
      border-radius: 0 0 4px 0;
    `;

    group.appendChild(armTop);
    group.appendChild(armBot);
    container.appendChild(group);
  }
}