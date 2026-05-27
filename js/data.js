/** Equipos clasificados (representativos). Ampliar con los 48 reales. */
export const TEAMS = {
  '1A': { name: 'Argentina',     flag: '🇦🇷', group: 'A' },
  '2A': { name: 'Perú',          flag: '🇵🇪', group: 'A' },
  '1B': { name: 'Ecuador',       flag: '🇪🇨', group: 'B' },
  '2B': { name: 'Colombia',      flag: '🇨🇴', group: 'B' },
  '1C': { name: 'Brasil',        flag: '🇧🇷', group: 'C' },
  '2C': { name: 'Paraguay',      flag: '🇵🇾', group: 'C' },
  '1D': { name: 'Uruguay',       flag: '🇺🇾', group: 'D' },
  '2D': { name: 'Chile',         flag: '🇨🇱', group: 'D' },
  '1E': { name: 'Francia',       flag: '🇫🇷', group: 'E' },
  '2E': { name: 'Alemania',      flag: '🇩🇪', group: 'E' },
  '1F': { name: 'España',        flag: '🇪🇸', group: 'F' },
  '2F': { name: 'Portugal',      flag: '🇵🇹', group: 'F' },
  '1G': { name: 'Marruecos',     flag: '🇲🇦', group: 'G' },
  '2G': { name: 'Senegal',       flag: '🇸🇳', group: 'G' },
  '1H': { name: 'USA',           flag: '🇺🇸', group: 'H' },
  '2H': { name: 'México',        flag: '🇲🇽', group: 'H' },
};

/**
 * Definición de los 8 partidos de Octavos de Final.
 * t1Key / t2Key referencian claves de TEAMS.
 */
export const R16_MATCHES = [
  { id: 'm1', label: '1', t1Key: '1C', t2Key: '2D' },
  { id: 'm2', label: '2', t1Key: '1A', t2Key: '2B' },
  { id: 'm3', label: '3', t1Key: '1B', t2Key: '2A' },
  { id: 'm4', label: '4', t1Key: '1D', t2Key: '2C' },
  { id: 'm5', label: '5', t1Key: '1E', t2Key: '2F' },
  { id: 'm6', label: '6', t1Key: '1G', t2Key: '2H' },
  { id: 'm7', label: '7', t1Key: '1F', t2Key: '2E' },
  { id: 'm8', label: '8', t1Key: '1H', t2Key: '2G' },
];

/**
 * Cuartos de Final: cada partido toma a los ganadores de dos R16.
 * fromIds[0] = equipo arriba, fromIds[1] = equipo abajo.
 */
export const QF_MATCHES = [
  { id: 'qA', label: 'A', fromIds: ['m1', 'm2'] },
  { id: 'qB', label: 'B', fromIds: ['m3', 'm4'] },
  { id: 'qC', label: 'C', fromIds: ['m5', 'm6'] },
  { id: 'qD', label: 'D', fromIds: ['m7', 'm8'] },
];

/** Semifinales */
export const SF_MATCHES = [
  { id: 'sI',  label: 'I',  fromIds: ['qA', 'qB'] },
  { id: 'sII', label: 'II', fromIds: ['qC', 'qD'] },
];

/** Final y tercer puesto */
export const FINAL_MATCH  = { id: 'final', label: 'Final',     fromIds: ['sI', 'sII'] };
export const THIRD_MATCH  = { id: 'third', label: '3er Puesto', fromIds: ['sI', 'sII'], isThirdPlace: true };