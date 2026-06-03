import { resolveTeam, setResult } from './store.js';


const backdrop      = document.getElementById('modal-backdrop');
const closeBtn      = document.getElementById('modal-close');
const cancelBtn     = document.getElementById('modal-cancel');
const confirmBtn    = document.getElementById('modal-confirm');
const matchLabel    = document.getElementById('modal-match-label');
const team1NameEl   = document.getElementById('modal-team1-name');
const team2NameEl   = document.getElementById('modal-team2-name');
const score1Input   = document.getElementById('modal-score1');
const score2Input   = document.getElementById('modal-score2');
const penSection    = document.getElementById('modal-penalty-section');
const penBtn1       = document.getElementById('btn-pen-t1');
const penBtn2       = document.getElementById('btn-pen-t2');
const modalCard     = document.querySelector('.modal-card');

/* ── Estado local del modal ── */
let activeMatchId  = null;
let team1Name      = '';
let team2Name      = '';
let selectedPenWinner = null;

/* ── API pública ── */

/** Inicializa listeners del modal (llamar una sola vez) */
export function initModal() {
  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  confirmBtn.addEventListener('click', handleConfirm);
  backdrop.addEventListener('click', onBackdropClick);

  score1Input.addEventListener('input', onScoreChange);
  score2Input.addEventListener('input', onScoreChange);

  penBtn1.addEventListener('click', () => selectPenWinner(team1Name, penBtn1, penBtn2));
  penBtn2.addEventListener('click', () => selectPenWinner(team2Name, penBtn2, penBtn1));
}

/**
 * Abrir el modal para un partido dado.
 * @param {string} matchId
 * @param {string} matchLabel  etiqueta visual (ej. "Partido 1", "Cuartos A")
 */
export function openModal(matchId, labelText) {
  const t1 = resolveTeam(matchId, 't1');
  const t2 = resolveTeam(matchId, 't2');

  // No abrir si algún equipo no está resuelto aún
  if (!t1 || !t2) return;

  activeMatchId  = matchId;
  team1Name      = t1.name;
  team2Name      = t2.name;
  selectedPenWinner = null;

  // Rellenar el modal con los datos del partido
  matchLabel.textContent    = `Partido ${labelText}`;
  team1NameEl.textContent   = `${t1.flag} ${t1.name}`;
  team2NameEl.textContent   = `${t2.flag} ${t2.name}`;
  penBtn1.textContent       = t1.name;
  penBtn2.textContent       = t2.name;
  score1Input.value         = '0';
  score2Input.value         = '0';

  // Ocultar sección de penales inicialmente
  penSection.style.display = 'none';
  penBtn1.classList.remove('is-selected');
  penBtn2.classList.remove('is-selected');

  // Animar apertura
  backdrop.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('is-open');
  score1Input.focus();
}

/* ── Manejadores internos ── */

function close() {
  backdrop.classList.remove('is-open');
  backdrop.setAttribute('aria-hidden', 'true');
  activeMatchId = null;
}

function onBackdropClick(e) {
  if (e.target === backdrop) close();
}

function onScoreChange() {
  const s1 = parseInt(score1Input.value) || 0;
  const s2 = parseInt(score2Input.value) || 0;

  // Mostrar sección de penales si hay empate
  const isDrawn = s1 === s2;
  penSection.style.display = isDrawn ? 'block' : 'none';

  if (!isDrawn) {
    selectedPenWinner = null;
    penBtn1.classList.remove('is-selected');
    penBtn2.classList.remove('is-selected');
  }
}

function selectPenWinner(name, activeBtn, otherBtn) {
  selectedPenWinner = name;
  activeBtn.classList.add('is-selected');
  otherBtn.classList.remove('is-selected');
}

function handleConfirm() {
  const s1 = parseInt(score1Input.value) || 0;
  const s2 = parseInt(score2Input.value) || 0;
  const isDrawn = s1 === s2;

  // Validar: si hay empate, debe elegirse ganador por penales
  if (isDrawn && !selectedPenWinner) {
    shakeModal();
    penSection.style.display = 'block';
    penBtn1.focus();
    return;
  }

  // Guardar en el store
  setResult(activeMatchId, team1Name, team2Name, s1, s2, isDrawn ? selectedPenWinner : null);
  close();
}

function shakeModal() {
  modalCard.classList.remove('shake');
  // Forzar reflow para reiniciar la animación
  void modalCard.offsetWidth;
  modalCard.classList.add('shake');
  modalCard.addEventListener('animationend', () => {
    modalCard.classList.remove('shake');
  }, { once: true });
}