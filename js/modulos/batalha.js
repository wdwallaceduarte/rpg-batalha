/* ============================================================
   MÓDULO: batalha.js
   Responsável pelo controle de dano, cura e turnos.
   ============================================================ */

import {
  listaPersonagens,
  historicoDanos,
  indicePersonagemAtivo,
  turnoAtual,
  incrementarIndiceAtivo,
  incrementarTurno,
  reiniciarIndiceAtivo,
  definirHistoricoDanos
} from './estado.js'

import { atualizarPersonagemNaApi } from './api.js'
import { exibirToast } from './toast.js'
import { renderizarTabela } from './renderizacao.js'

const campoDano       = document.getElementById('campoDano')
const campoCura       = document.getElementById('campoCura')
const botaoAplicarDano  = document.getElementById('botaoAplicarDano')
const botaoAplicarCura  = document.getElementById('botaoAplicarCura')
const botaoProximoTurno = document.getElementById('botaoProximoTurno')
const seletorAlvo       = document.getElementById('seletorAlvo')

function obterPersonagemAtivo() {
  const idSelecionado = Number(seletorAlvo.value)
  return listaPersonagens.find(function(personagem) {
    return personagem.id === idSelecionado
  })
}

function validarAcaoBatalha(campoValor, nomeCampo) {
  if (listaPersonagens.length === 0) {
    exibirToast('Nenhum personagem no campo de batalha!', 'aviso')
    return false
  }

  if (!seletorAlvo.value) {
    exibirToast('Selecione um alvo antes de continuar.', 'aviso')
    seletorAlvo.focus()
    return false
  }

  const valor = Number(campoValor.value)
  if (!campoValor.value || isNaN(valor) || valor <= 0) {
    exibirToast('Por favor, informe um valor válido para ' + nomeCampo + '.', 'aviso')
    campoValor.focus()
    return false
  }

  return true
}

async function aplicarDano() {
  if (!validarAcaoBatalha(campoDano, 'o dano')) return

  const personagemAtivo = obterPersonagemAtivo()
  const valorDano       = Number(campoDano.value)
  const novoPv          = Math.max(0, personagemAtivo.pvAtual - valorDano)
  const danoAnterior    = historicoDanos[personagemAtivo.id][turnoAtual] || 0
  const novoDanoNoTurno = danoAnterior + valorDano

  try {
    const historicoDanoAtualizado = {
      ...historicoDanos[personagemAtivo.id],
      [turnoAtual]: novoDanoNoTurno
    }

    await atualizarPersonagemNaApi(personagemAtivo.id, {
      pvAtual:        novoPv,
      historicoDanos: historicoDanoAtualizado
    })

    personagemAtivo.pvAtual = novoPv
    definirHistoricoDanos(personagemAtivo.id, historicoDanoAtualizado)

    exibirToast(`${valorDano} de dano em ${personagemAtivo.nome}!`, 'erro')
    renderizarTabela()
    campoDano.value = ''

    if (personagemAtivo.pvAtual === 0) {
      exibirToast(
        `${personagemAtivo.nome} chegou a 0 PV e está inconsciente!`,
        'aviso',
        5000
      )
    }

  } catch (erro) {
    console.error('Erro ao aplicar dano:', erro)
    exibirToast('Não foi possível aplicar o dano. Verifique o servidor.', 'erro')
  }
}

async function aplicarCura() {
  if (!validarAcaoBatalha(campoCura, 'a cura')) return

  const personagemAtivo = obterPersonagemAtivo()
  const valorCura       = Number(campoCura.value)
  const novoPv          = Math.min(
    personagemAtivo.pvMaximo,
    personagemAtivo.pvAtual + valorCura
  )

  try {
    await atualizarPersonagemNaApi(personagemAtivo.id, {
      pvAtual: novoPv
    })

    personagemAtivo.pvAtual = novoPv

    exibirToast(`${valorCura} de cura em ${personagemAtivo.nome}!`, 'sucesso')
    renderizarTabela()
    campoCura.value = ''

  } catch (erro) {
    console.error('Erro ao aplicar cura:', erro)
    exibirToast('Não foi possível aplicar a cura. Verifique o servidor.', 'erro')
  }
}

function avancarTurno() {
  if (listaPersonagens.length === 0) {
    exibirToast('Nenhum personagem cadastrado na batalha!', 'aviso')
    return
  }

  incrementarIndiceAtivo()

  if (indicePersonagemAtivo >= listaPersonagens.length) {
    reiniciarIndiceAtivo()
    incrementarTurno()
  }

  renderizarTabela()
  exibirToast(`Vez de ${listaPersonagens[indicePersonagemAtivo].nome}!`, 'info')
}

export function inicializarEventosBatalha() {
  botaoAplicarDano.addEventListener('click', aplicarDano)
  botaoAplicarCura.addEventListener('click', aplicarCura)
  botaoProximoTurno.addEventListener('click', avancarTurno)
}
