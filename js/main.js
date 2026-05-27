import { loadFromStorage, subscribe } from './localstorage.js';
import { R16_MATCHES, QF_MATCHES, SF_MATCHES, FINAL_MATCH, THIRD_MATCH } from './data.js';
import { resolveTeam } from './localstorage.js';
import { initEvents } from './event.js';
import { initModal } from './modal.js';
import { renderBracket } from './brackets.js';


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
