/* ============================================================
   MÓDULO: renderizacao.js
   Responsável por desenhar e atualizar a interface.
   ============================================================ */

import {
  listaPersonagens,
  historicoDanos,
  indicePersonagemAtivo,
  turnoAtual
} from './estado.js'

const corpoTabela    = document.getElementById('corpoTabela')
const indicadorTurno = document.getElementById('indicadorTurno')
const tabelaBatalha  = document.getElementById('tabelaBatalha')
const seletorAlvo    = document.getElementById('seletorAlvo')

function obterTurnosComDano() {
  const turnosEncontrados = new Set()

  listaPersonagens.forEach(function(personagem) {
    const danosDoPersonagem = historicoDanos[personagem.id] || {}
    Object.keys(danosDoPersonagem).forEach(function(turno) {
      turnosEncontrados.add(Number(turno))
    })
  })

  return Array.from(turnosEncontrados).sort(function(a, b) {
    return a - b
  })
}

function renderizarCabecalhoTabela(turnosComDano) {
  const linhaCabecalho = tabelaBatalha.querySelector('thead tr')
  linhaCabecalho.innerHTML = ''

  const colunas = ['Iniciativa', 'Jogador', 'Personagem']
  colunas.forEach(function(nome) {
    const th = document.createElement('th')
    th.className = 'tabela-batalha__cabecalho-celula'
    th.textContent = nome
    linhaCabecalho.appendChild(th)
  })

  turnosComDano.forEach(function(numeroTurno) {
    const th = document.createElement('th')
    th.className = 'tabela-batalha__cabecalho-celula'
    th.textContent = 'T' + numeroTurno
    linhaCabecalho.appendChild(th)
  })

  const colunasFinais = ['PV Máx.', 'PV Atual', 'Ações']
  colunasFinais.forEach(function(nome) {
    const th = document.createElement('th')
    th.className = 'tabela-batalha__cabecalho-celula'
    th.textContent = nome
    linhaCabecalho.appendChild(th)
  })
}

function criarLinhaPersonagem(personagem, indice, turnosComDano) {
  const linha = document.createElement('tr')
  linha.className = 'tabela-batalha__linha'
  linha.dataset.id = personagem.id

  const estadoAtivo = (indice === indicePersonagemAtivo)
  if (estadoAtivo) {
    linha.classList.add('tabela-batalha__linha--ativa')
  }

  const tdIniciativa = document.createElement('td')
  tdIniciativa.className = 'tabela-batalha__celula'
  tdIniciativa.textContent = personagem.iniciativa
  linha.appendChild(tdIniciativa)

  const tdJogador = document.createElement('td')
  tdJogador.className = 'tabela-batalha__celula'
  tdJogador.textContent = personagem.jogador
  linha.appendChild(tdJogador)

  const tdPersonagem = document.createElement('td')
  tdPersonagem.className = 'tabela-batalha__celula'
  tdPersonagem.textContent = (estadoAtivo ? '⚔️ ' : '') + personagem.nome
  linha.appendChild(tdPersonagem)

  turnosComDano.forEach(function(numeroTurno) {
    const td = document.createElement('td')
    td.className = 'tabela-batalha__celula'
    const danoNoTurno = (historicoDanos[personagem.id] || {})[numeroTurno]

    if (danoNoTurno) {
      td.classList.add('tabela-batalha__celula--dano')
      td.textContent = danoNoTurno
    } else {
      td.style.textAlign = 'center'
      td.style.color = 'var(--cor-texto-secundario)'
      td.textContent = '—'
    }

    linha.appendChild(td)
  })

  const tdPvMaximo = document.createElement('td')
  tdPvMaximo.className = 'tabela-batalha__celula'
  tdPvMaximo.textContent = personagem.pvMaximo
  linha.appendChild(tdPvMaximo)

  const pvCritico = personagem.pvAtual <= Math.floor(personagem.pvMaximo * 0.25)
  const tdPvAtual = document.createElement('td')
  tdPvAtual.className = `tabela-batalha__celula ${pvCritico
    ? 'tabela-batalha__celula--pv-critico'
    : 'tabela-batalha__celula--pv-atual'}`
  tdPvAtual.textContent = personagem.pvAtual + (pvCritico ? ' ⚠️' : '')
  linha.appendChild(tdPvAtual)

  const tdAcoes = document.createElement('td')
  tdAcoes.className = 'tabela-batalha__celula'
  const botaoRemover = document.createElement('button')
  botaoRemover.className = 'botao botao--excluir'
  botaoRemover.dataset.id = personagem.id
  botaoRemover.textContent = '🗑️ Remover'
  tdAcoes.appendChild(botaoRemover)
  linha.appendChild(tdAcoes)

  return linha
}

export function atualizarSeletorAlvo() {
  const valorAtual = seletorAlvo.value
  seletorAlvo.innerHTML = '<option value="">— Selecione o alvo —</option>'

  listaPersonagens.forEach(function(personagem) {
    const opcao = document.createElement('option')
    opcao.value = personagem.id
    opcao.textContent = `${personagem.nome} (${personagem.jogador}) — PV: ${personagem.pvAtual}/${personagem.pvMaximo}`
    seletorAlvo.appendChild(opcao)
  })

  if (valorAtual) seletorAlvo.value = valorAtual
}

export function renderizarTabela() {
  indicadorTurno.textContent = 'Turno: ' + turnoAtual

  const turnosComDano = obterTurnosComDano()
  renderizarCabecalhoTabela(turnosComDano)

  corpoTabela.innerHTML = ''

  if (listaPersonagens.length === 0) {
    corpoTabela.innerHTML = `
      <tr>
        <td class="tabela-batalha__celula" colspan="7"
          style="text-align:center; color:var(--cor-texto-secundario);
                 font-style:italic; padding: 2rem;">
          Nenhum personagem cadastrado. Adicione aventureiros para começar!
        </td>
      </tr>
    `
    atualizarSeletorAlvo()
    return
  }

  listaPersonagens.forEach(function(personagem, indice) {
    const linha = criarLinhaPersonagem(personagem, indice, turnosComDano)
    corpoTabela.appendChild(linha)
  })

  atualizarSeletorAlvo()
}
