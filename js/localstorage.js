const STORAGE_KEY = 'wc2026_bracket_v1';

/**
 * @typedef {{ score1: number, score2: number, penWinner: string|null }} MatchResult
 * @typedef {{ [matchId: string]: { winner: string, loser: string, result: MatchResult } }} ResultsMap
 */

const state = {
  /** @type {ResultsMap} */
  results: {},
};

/** Lista de callbacks suscritos a cambios */
const listeners = [];

/** Suscribirse a cambios de estado */
export function subscribe(callback) {
  listeners.push(callback);
}

/** Notificar a todos los suscriptores */
function notify() {
  listeners.forEach(cb => cb(state));
}

/** Persistir en localStorage */
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.results));
}

/** Cargar desde localStorage */
export function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state.results = JSON.parse(raw);
    } catch {
      state.results = {};
    }
  }
}

/** Leer snapshot de estado actual (inmutable por convención) */
export function getState() {
  return state;
}

/**
 * Obtener el nombre del equipo participante en un match dado su ID.
 * Resuelve recursivamente los ganadores anteriores.
 * @param {string} matchId
 * @param {'t1'|'t2'} slot
 * @returns {{ name: string, flag: string } | null}
 */
export function resolveTeam(matchId, slot) {
  const allMatches = [...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, FINAL_MATCH, THIRD_MATCH];
  const match = allMatches.find(m => m.id === matchId);
  if (!match) return null;

  // R16: los equipos vienen de TEAMS directamente
  if (match.t1Key) {
    const key = slot === 't1' ? match.t1Key : match.t2Key;
    const team = TEAMS[key];
    return team ? { name: team.name, flag: team.flag } : null;
  }

  // Fases posteriores: el equipo viene del ganador/perdedor de una fase anterior
  const fromId = slot === 't1' ? match.fromIds[0] : match.fromIds[1];
  const result = state.results[fromId];
  if (!result) return null;

  if (match.isThirdPlace) {
    // Para el 3er puesto tomamos los PERDEDORES de las semis
    return { name: result.loser, flag: getFlagByName(result.loser) };
  }

  return { name: result.winner, flag: getFlagByName(result.winner) };
}

/** Helper: buscar bandera por nombre de equipo */
function getFlagByName(name) {
  const entry = Object.values(TEAMS).find(t => t.name === name);
  return entry ? entry.flag : '🏳️';
}

/**
 * Registrar el resultado de un partido.
 * @param {string} matchId
 * @param {string} team1Name
 * @param {string} team2Name
 * @param {number} score1
 * @param {number} score2
 * @param {string|null} penWinner  nombre del ganador por penales (si empate)
 */
export function setResult(matchId, team1Name, team2Name, score1, score2, penWinner = null) {
  let winner, loser;

  if (score1 > score2) {
    winner = team1Name;
    loser  = team2Name;
  } else if (score2 > score1) {
    winner = team2Name;
    loser  = team1Name;
  } else {
    // Empate → se decide por penales
    winner = penWinner || team1Name;
    loser  = penWinner === team1Name ? team2Name : team1Name;
  }

  state.results[matchId] = {
    winner,
    loser,
    result: { score1, score2, penWinner },
  };

  // Si un resultado posterior dependía de este match,
  // invalidamos los resultados que ya no son válidos en cascada.
  invalidateDependents(matchId);

  persist();
  notify();
}

/**
 * Invalidar resultados que dependían del matchId modificado.
 * Esto asegura consistencia si el usuario corrige un resultado.
 */
function invalidateDependents(changedId) {
  const allMatches = [...QF_MATCHES, ...SF_MATCHES, FINAL_MATCH, THIRD_MATCH];

  allMatches.forEach(match => {
    if (match.fromIds && match.fromIds.includes(changedId)) {
      // El equipo que pasó puede ya no ser el mismo — borrar resultado
      if (state.results[match.id]) {
        delete state.results[match.id];
        // Recursivo: si ese match también tiene dependientes
        invalidateDependents(match.id);
      }
    }
  });
}

/** Borrar todos los resultados */
export function resetBracket() {
  state.results = {};
  persist();
  notify();
}

function init() {
  // 1. Cargar estado guardado en localStorage
  loadFromStorage();

  // 2. Suscribir el render al store
  //    Cada vez que cambia el estado, se re-renderiza el bracket.
  //    Equivale a: useEffect(() => { renderBracket() }, [state])
  subscribe(() => renderBracket());

  // 3. Inicializar el modal (listeners del formulario)
  initModal();

  // 4. Inicializar delegación de eventos en el bracket
  initEvents();

  // 5. Primer render con el estado cargado
  renderBracket();

  console.info('⚽ Polla Mundialista FIFA 2026 — inicializado');
}

// Esperar a que el DOM esté listo antes de arrancar
document.addEventListener('DOMContentLoaded', init);
