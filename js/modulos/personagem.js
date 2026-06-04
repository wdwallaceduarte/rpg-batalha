/* ============================================================
   MÓDULO: personagem.js
   Responsável por adicionar e remover personagens da batalha.
   ============================================================ */

import {
  listaPersonagens,
  historicoDanos,
  indicePersonagemAtivo,
  adicionarPersonagemNaLista,
  removerPersonagemDaLista,
  definirHistoricoDanos,
  removerHistoricoDanos,
  reiniciarIndiceAtivo
} from './estado.js'

import {
  salvarPersonagemNaApi,
  removerPersonagemDaApi
} from './api.js'

import { exibirToast } from './toast.js'
import { renderizarTabela } from './renderizacao.js'

const campoJogador             = document.getElementById('campoJogador')
const campoPersonagem          = document.getElementById('campoPersonagem')
const campoIniciativa          = document.getElementById('campoIniciativa')
const campoPontosDeVida        = document.getElementById('campoPontosDeVida')
const botaoAdicionarPersonagem = document.getElementById('botaoAdicionarPersonagem')
const corpoTabela              = document.getElementById('corpoTabela')

function validarCadastroPersonagem() {
  const nomeJogador    = campoJogador.value.trim()
  const nomePersonagem = campoPersonagem.value.trim()
  const iniciativa     = Number(campoIniciativa.value)
  const pontosDeVida   = Number(campoPontosDeVida.value)

  if (!nomeJogador) {
    exibirToast('Por favor, informe o nome do jogador.', 'aviso')
    campoJogador.focus()
    return false
  }
  if (!nomePersonagem) {
    exibirToast('Por favor, informe o nome do personagem.', 'aviso')
    campoPersonagem.focus()
    return false
  }
  if (!campoIniciativa.value || isNaN(iniciativa)) {
    exibirToast('Por favor, informe um valor de iniciativa válido.', 'aviso')
    campoIniciativa.focus()
    return false
  }
  if (!campoPontosDeVida.value || isNaN(pontosDeVida) || pontosDeVida <= 0) {
    exibirToast('Por favor, informe um valor de PV válido e maior que zero.', 'aviso')
    campoPontosDeVida.focus()
    return false
  }

  return true
}

function criarObjetoPersonagem() {
  return {
    id:         Date.now(),
    jogador:    campoJogador.value.trim(),
    nome:       campoPersonagem.value.trim(),
    iniciativa: Number(campoIniciativa.value),
    pvMaximo:   Number(campoPontosDeVida.value),
    pvAtual:    Number(campoPontosDeVida.value)
  }
}

function limparCamposCadastro() {
  campoJogador.value      = ''
  campoPersonagem.value   = ''
  campoIniciativa.value   = ''
  campoPontosDeVida.value = ''
  campoJogador.focus()
}

async function adicionarPersonagem() {
  if (!validarCadastroPersonagem()) return

  const novoPersonagem = criarObjetoPersonagem()

  try {
    const personagemSalvo = await salvarPersonagemNaApi({
      ...novoPersonagem,
      historicoDanos: {}
    })

    definirHistoricoDanos(personagemSalvo.id, {})
    adicionarPersonagemNaLista(personagemSalvo)

    exibirToast(`${personagemSalvo.nome} entrou na batalha!`, 'sucesso')
    setTimeout(function() {
      limparCamposCadastro()
      renderizarTabela()
    }, 50)

  } catch (erro) {
    console.error('Erro ao adicionar personagem:', erro)
    exibirToast('Não foi possível salvar o personagem. Verifique o servidor.', 'erro')
  }
}

async function removerPersonagem(idPersonagem) {
  const confirmacao = confirm('Deseja realmente remover este personagem da batalha?')
  if (!confirmacao) return

  try {
    await removerPersonagemDaApi(idPersonagem)

    removerPersonagemDaLista(idPersonagem)
    removerHistoricoDanos(idPersonagem)

    if (indicePersonagemAtivo >= listaPersonagens.length) {
      reiniciarIndiceAtivo()
    }

    exibirToast('Personagem removido da batalha.', 'aviso')
    renderizarTabela()

  } catch (erro) {
    console.error('Erro ao remover personagem:', erro)
    exibirToast('Não foi possível remover o personagem. Verifique o servidor.', 'erro')
  }
}

export function inicializarEventosPersonagem() {
  botaoAdicionarPersonagem.addEventListener('click', adicionarPersonagem)

  corpoTabela.addEventListener('click', function(evento) {
    const botaoClicado = evento.target.closest('.botao--excluir')
    if (!botaoClicado) return

    const idPersonagem = Number(botaoClicado.dataset.id)
    removerPersonagem(idPersonagem)
  })
}
