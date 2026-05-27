document.getElementById('bracket-root');

/** Combina todas las definiciones de partidos en un mapa id → label */
const MATCH_LABELS = {};
[...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, FINAL_MATCH, THIRD_MATCH].forEach(m => {
  MATCH_LABELS[m.id] = m.label;
});

/** Inicializar listeners (llamar una sola vez) */
export function initEvents() {
  bracketRoot.addEventListener('click', onBracketClick);
}

/**
 * Handler central para todos los clicks dentro del bracket.
 * Busca el match-slot o match-pair más cercano y abre el modal.
 */
function onBracketClick(event) {
  // Subir por el DOM hasta encontrar un slot o un par
  const slot = event.target.closest('.match-slot');
  if (!slot) return;

  const matchId = slot.dataset.matchId;
  if (!matchId) return;

  // No abrir modal en slots de equipos eliminados
  if (slot.classList.contains('match-slot--loser')) return;

  const label = MATCH_LABELS[matchId] || matchId;
  openModal(matchId, label);
}
