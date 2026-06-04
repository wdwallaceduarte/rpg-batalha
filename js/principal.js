/*
   ============================================================
   principal.js — Ponto de entrada da aplicação
   
   Responsabilidade: importar módulos e inicializar a aplicação.
   Toda a lógica está nos módulos em js/modulos/.
   ============================================================ 
*/

import { definirListaPersonagens, definirHistoricoDanos } from './modulos/estado.js'
import { buscarPersonagensNaApi } from './modulos/api.js'
import { exibirToast } from './modulos/toast.js'
import { renderizarTabela } from './modulos/renderizacao.js'
import { inicializarEventosPersonagem } from './modulos/personagem.js'
import { inicializarEventosBatalha } from './modulos/batalha.js'
import { inicializarEventosTema } from './modulos/tema.js'

async function inicializar() {
  try {
    const personagensSalvos = await buscarPersonagensNaApi()

    const personagensOrdenados = personagensSalvos.sort(function (a, b) {
      return b.iniciativa - a.iniciativa
    })

    definirListaPersonagens(personagensOrdenados)

    personagensOrdenados.forEach(function (personagem) {
      definirHistoricoDanos(personagem.id, personagem.historicoDanos || {})
    })

    renderizarTabela()

  } catch (erro) {
    console.error('Erro ao carregar personagens:', erro)
    exibirToast('Erro ao carregar personagens. Verifique o servidor.', 'erro')
    renderizarTabela()
  }
}

// Inicializa eventos de todos os módulos
inicializarEventosPersonagem()
inicializarEventosBatalha()
inicializarEventosTema()

// Inicializa a aplicação
inicializar()
