
/* ============================================================
   SEÇÃO 1 — SELEÇÃO DE ELEMENTOS
   Capturamos aqui todos os elementos do HTML que o JavaScript
   vai precisar ler ou manipular.
   ============================================================ */

// CAMPOS DE CADASTROS

const campoJogador = document.getElementById('campoJogador')
const campoPersonagem = document.getElementById('campoPersonagem')
const campoIniciativa = document.getElementById('campoIniciativa')
const campoPontosDeVida = document.getElementById('campoPontosDeVida')

// BOTÃO DE cadastro
const botaoAdicionarPersonagem = document.getElementById('botaoAdicionarPersonagem')

//CAMPOS DE BATALHA
let seletorAlvo = document.getElementById('seletorAlvo')
const campoDano = document.getElementById('campoDano')
const campoCura = document.getElementById('campoCura')

//BOTÕES DE BATALHA
const botaoAplicarDano = document.getElementById('botaoAplicarDano')
const botaoAplicarCura = document.getElementById('botaoAplicarCura')
const botaoProximoTurno = document.getElementById('botaoProximoTurno')

//AREA DE BATALHA
const corpoTabela = document.getElementById('corpoTabela')
const indicadorTurno = document.getElementById('indicadorTurno')
const tabelaBatalha = document.getElementById('tabelaBatalha')

//TEMA
const botaoTema = document.getElementById('botaoTema')

//CONTEINER DE NOTIFICAÇÕES
const toastContainer = document.getElementById('toastContainer')

/* ============================================================
SEÇÃO 2 — ESTADO DA APLICAÇÃO
Variáveis que guardam os dados enquanto a aplicação roda.
============================================================ */

//Lista de personagens cadastrado na batalha
let listaPersonagens = []

//NUMERO DE TURNO ATUAL
let turnoAtual = 1

//INDICE DO PERSONAGEM ATIVO NA ORDEM DE INICIATIVA
let indicePersonagemAtivo = 0

//HISTORICO DE DANO POR PERSONAGEM POR TURNO
// Estrutura: { [idPersonagem]: { [numeroTurno]: valorDano } }
let historicoDanos = {}

//CONTROLA SE O TEMA CLARO ESTA ATIVO
let temaClaro = false

/* ============================================================
   SEÇÃO 3 — COMUNICAÇÃO COM A API
   ============================================================ */

const URL_BASE = 'http://localhost:3000'

async function buscarPersonagensNaApi() {
  const resposta = await fetch(`${URL_BASE}/personagens`)
  return await resposta.json()
}

async function salvarPersonagemNaApi(personagem) {
  const resposta = await fetch(`${URL_BASE}/personagens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(personagem)
  })
  return await resposta.json()
}

async function atualizarPersonagemNaApi(id, dadosAtualizados) {
  const resposta = await fetch(`${URL_BASE}/personagens/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAtualizados)
  })
  return await resposta.json()
}

async function removerPersonagemDaApi(id) {
  await fetch(`${URL_BASE}/personagens/${id}`, {
    method: 'DELETE'
  })
}

/* ============================================================
   SEÇÃO 4 — NOTIFICAÇÕES TOAST
   ============================================================ */

function exibirToast(mensagem, tipo = 'info', duracao = 3000) {
  const toast = document.createElement('div')
  toast.className = `toast toast--${tipo}`

  const icones = {
    sucesso: '✅',
    erro: '❌',
    aviso: '⚠️',
    info: '💬'
  }

  toast.innerHTML = `
    <span>${icones[tipo] || '💬'}</span>
    <span>${mensagem}</span>
  `

  toastContainer.appendChild(toast)

  // A animação CSS cuida de tudo — só precisamos remover o elemento após terminar
  const duracaoTotal = duracao > 3000 ? 5700 : 3700
  setTimeout(function () {
    toast.remove()
  }, duracaoTotal)
}

/* ============================================================
   SEÇÃO 5 — FUNÇÕES DE RENDERIZAÇÃO
   ============================================================ */

function obterTurnosComDano() {
  const turnosEncontrados = new Set()

  listaPersonagens.forEach(function (personagem) {
    const danosDoPersonagem = historicoDanos[personagem.id] || {}
    Object.keys(danosDoPersonagem).forEach(function (turno) {
      turnosEncontrados.add(Number(turno))
    })
  })

  return Array.from(turnosEncontrados).sort(function (a, b) {
    return a - b
  })
}

function renderizarCabecalhoTabela(turnosComDano) {
  const linhaCabecalho = tabelaBatalha.querySelector('thead tr')
  linhaCabecalho.innerHTML = ''

  const colunas = ['Iniciativa', 'Jogador', 'Personagem']
  colunas.forEach(function (nome) {
    const th = document.createElement('th')
    th.className = 'tabela-batalha__cabecalho-celula'
    th.textContent = nome
    linhaCabecalho.appendChild(th)
  })

  turnosComDano.forEach(function (numeroTurno) {
    const th = document.createElement('th')
    th.className = 'tabela-batalha__cabecalho-celula'
    th.textContent = 'T' + numeroTurno
    linhaCabecalho.appendChild(th)
  })

  const colunasFinais = ['PV Máx.', 'PV Atual', 'Ações']
  colunasFinais.forEach(function (nome) {
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

  // Célula de iniciativa
  const tdIniciativa = document.createElement('td')
  tdIniciativa.className = 'tabela-batalha__celula'
  tdIniciativa.textContent = personagem.iniciativa
  linha.appendChild(tdIniciativa)

  // Célula de jogador
  const tdJogador = document.createElement('td')
  tdJogador.className = 'tabela-batalha__celula'
  tdJogador.textContent = personagem.jogador
  linha.appendChild(tdJogador)

  // Célula de personagem
  const tdPersonagem = document.createElement('td')
  tdPersonagem.className = 'tabela-batalha__celula'
  tdPersonagem.textContent = (estadoAtivo ? '⚔️ ' : '') + personagem.nome
  linha.appendChild(tdPersonagem)

  // Células de dano por turno
  turnosComDano.forEach(function (numeroTurno) {
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

  // Célula PV máximo
  const tdPvMaximo = document.createElement('td')
  tdPvMaximo.className = 'tabela-batalha__celula'
  tdPvMaximo.textContent = personagem.pvMaximo
  linha.appendChild(tdPvMaximo)

  // Célula PV atual
  const pvCritico = personagem.pvAtual <= Math.floor(personagem.pvMaximo * 0.25)
  const tdPvAtual = document.createElement('td')
  tdPvAtual.className = `tabela-batalha__celula ${pvCritico
    ? 'tabela-batalha__celula--pv-critico'
    : 'tabela-batalha__celula--pv-atual'}`
  tdPvAtual.textContent = personagem.pvAtual + (pvCritico ? ' ⚠️' : '')
  linha.appendChild(tdPvAtual)

  // Célula de ações
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

function renderizarTabela() {
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

function atualizarSeletorAlvo() {
  seletorAlvo = document.getElementById('seletorAlvo')
  const valorAtual = seletorAlvo.value

  seletorAlvo.innerHTML = '<option value="">— Selecione o alvo —</option>'

  listaPersonagens.forEach(function (personagem) {
    const opcao = document.createElement('option')
    opcao.value = personagem.id
    opcao.textContent = `${personagem.nome} (${personagem.jogador}) — PV: ${personagem.pvAtual}/${personagem.pvMaximo}`
    seletorAlvo.appendChild(opcao)
  })

  // Mantém o alvo selecionado após renderizar
  if (valorAtual) seletorAlvo.value = valorAtual
}

/* ============================================================
   SEÇÃO 6 — FUNÇÕES DE PERSONAGEM
   ============================================================ */

function validarCadastroPersonagem() {
  const nomeJogador = campoJogador.value.trim()
  const nomePersonagem = campoPersonagem.value.trim()
  const iniciativa = Number(campoIniciativa.value)
  const pontosDeVida = Number(campoPontosDeVida.value)

  if (!nomeJogador) {
    exibirToast('Por favor, informe o nome do jogador.', 'aviso')
    campoJogador.focus()
    return false
  }
  if (!nomePersonagem) {
    exibirToast('Por favor, informe o nome do personagem.', 'aviso')
    nomePersonagem.focus()
    return false
  }
  if (!campoIniciativa.value || isNaN(iniciativa)) {
    exibirToast('Por favor, informe um valor de iniciativa válido.', 'aviso')
    campoIniciativa.focus()
    return false
  }
  if (!campoPontosDeVida.value || isNaN(pontosDeVida) || pontosDeVida <= 0) {
    exibirToast('Por favor, informe um valor de PV válido e maior que zero.', 'aviso')
    pontosDeVida.focus()
    return false
  }

  return true
}

function criarObjetoPersonagem() {
  return {
    id: Date.now(),
    jogador: campoJogador.value.trim(),
    nome: campoPersonagem.value.trim(),
    iniciativa: Number(campoIniciativa.value),
    pvMaximo: Number(campoPontosDeVida.value),
    pvAtual: Number(campoPontosDeVida.value)
  }
}

function limparCamposCadastro() {
  campoJogador.value = ''
  campoPersonagem.value = ''
  campoIniciativa.value = ''
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

    historicoDanos[personagemSalvo.id] = {}

    listaPersonagens.push(personagemSalvo)
    listaPersonagens.sort(function (a, b) {
      return b.iniciativa - a.iniciativa
    })

    exibirToast(`${personagemSalvo.nome} entrou na batalha!`, 'sucesso')
    setTimeout(function () {
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

    listaPersonagens = listaPersonagens.filter(function (personagem) {
      return personagem.id !== idPersonagem
    })

    delete historicoDanos[idPersonagem]

    if (indicePersonagemAtivo >= listaPersonagens.length) {
      indicePersonagemAtivo = 0
    }

    exibirToast('Personagem removido da batalha.', 'aviso')
    renderizarTabela()

  } catch (erro) {
    console.error('Erro ao remover personagem:', erro)
    exibirToast('Não foi possível remover o personagem. Verifique o servidor.', 'erro')
  }
}

corpoTabela.addEventListener('click', function (evento) {
  const botaoClicado = evento.target.closest('.botao--excluir')
  if (!botaoClicado) return

  const idPersonagem = Number(botaoClicado.dataset.id)
  removerPersonagem(idPersonagem)
})

botaoAdicionarPersonagem.addEventListener('click', adicionarPersonagem)

/* ============================================================
   SEÇÃO 7 — FUNÇÕES DE BATALHA
   ============================================================ */

function obterPersonagemAtivo() {
  const idSelecionado = Number(seletorAlvo.value)
  return listaPersonagens.find(function (personagem) {
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
  const valorDano = Number(campoDano.value)
  const novoPv = Math.max(0, personagemAtivo.pvAtual - valorDano)
  const danoAnterior = historicoDanos[personagemAtivo.id][turnoAtual] || 0
  const novoDanoNoTurno = danoAnterior + valorDano

  try {
    const historicoDanoAtualizado = {
      ...historicoDanos[personagemAtivo.id],
      [turnoAtual]: novoDanoNoTurno
    }

    await atualizarPersonagemNaApi(personagemAtivo.id, {
      pvAtual: novoPv,
      historicoDanos: historicoDanoAtualizado
    })

    personagemAtivo.pvAtual = novoPv
    historicoDanos[personagemAtivo.id] = historicoDanoAtualizado

    exibirToast(`${valorDano} de dano em ${personagemAtivo.nome}!`, 'erro')
    renderizarTabela()
    campoDano.value = ''

    if (personagemAtivo.pvAtual === 0) {
      exibirToast(`${personagemAtivo.nome} chegou a 0 PV e está inconsciente!`, 'aviso', 5000)
    }

  } catch (erro) {
    console.error('Erro ao aplicar dano:', erro)
    exibirToast('Não foi possível aplicar o dano. Verifique o servidor.', 'erro')
  }
}

async function aplicarCura() {
  if (!validarAcaoBatalha(campoCura, 'a cura')) return

  const personagemAtivo = obterPersonagemAtivo()
  const valorCura = Number(campoCura.value)
  const novoPv = Math.min(personagemAtivo.pvMaximo, personagemAtivo.pvAtual + valorCura)

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

  indicePersonagemAtivo++

  if (indicePersonagemAtivo >= listaPersonagens.length) {
    indicePersonagemAtivo = 0
    turnoAtual++
  }

  renderizarTabela()
  exibirToast(`Sua vez ${listaPersonagens[indicePersonagemAtivo].nome}!`, 'info')
}

botaoAplicarDano.addEventListener('click', aplicarDano)
botaoAplicarCura.addEventListener('click', aplicarCura)
botaoProximoTurno.addEventListener('click', avancarTurno)

/* ============================================================
   SEÇÃO 8 — FUNÇÕES DE TEMA
   ============================================================ */

function alternarTema() {
  temaClaro = !temaClaro
  document.documentElement.classList.toggle('tema-claro', temaClaro)
  botaoTema.textContent = temaClaro ? '🌑 Modo Escuro' : '🌙 Modo Claro'
}

botaoTema.addEventListener('click', alternarTema)

/* ============================================================
   SEÇÃO 9 — INICIALIZAÇÃO
   ============================================================ */

async function inicializar() {
  try {
    const personagensSalvos = await buscarPersonagensNaApi()

    listaPersonagens = personagensSalvos.sort(function (a, b) {
      return b.iniciativa - a.iniciativa
    })

    listaPersonagens.forEach(function (personagem) {
      historicoDanos[personagem.id] = personagem.historicoDanos || {}
    })

    renderizarTabela()

  } catch (erro) {
    console.error('Erro ao carregar personagens:', erro)
    exibirToast('Erro ao carregar personagens. Verifique o servidor.', 'erro')
    renderizarTabela()
  }
}

inicializar()
