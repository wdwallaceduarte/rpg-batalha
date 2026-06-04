/* ============================================================
   MÓDULO: tema.js
   Responsável por alternar entre modo escuro e claro.
   ============================================================ */

import { temaClaro, alternarTemaClaro } from './estado.js'

const botaoTema = document.getElementById('botaoTema')

function alternarTema() {
  const temaClaroAtivo = alternarTemaClaro()

  document.documentElement.classList.toggle('tema-claro', temaClaroAtivo)

  botaoTema.textContent = temaClaroAtivo ? '🌑 Modo Escuro' : '☀️ Modo Claro'
}

export function inicializarEventosTema() {
  botaoTema.addEventListener('click', alternarTema)
}
