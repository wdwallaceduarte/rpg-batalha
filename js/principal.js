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
const campoDano = document.getElementById('campoDano')
const campoCura = document.getElementById('campoCura')

//BOTÕES DE BALHATA
const botaoAplicarDano = document.getElementById('botaoAplicarDano')
const botaoAplicarCura = document.getElementById('botaoAplicarCura')
const botaoProximoTurno = document.getElementById('botaoProximoTurno')

//AREA DE BATALHA
const corpoTabela = document.getElementById('corpoTabela')
const indicadorTurno = document.getElementById('indicadorTurno')
const tabelaBatalha = document.getElementById('tabelaBatalha')

//TEMA
const botaoTema = document.getElementById('botaoTema')

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
SEÇÃO 3 — FUNÇÕES DE RENDERIZAÇÃO
Responsáveis por desenhar e atualizar a interface.
============================================================ */

/*
    *Coleta todos os números de turno que possuem;
    * Pelo menos um registro de dano no historico.
*/

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

/* 
    *Atualiza o cabeçalho da tabela com as colunas
    de turno geradas dinamicamente.
 */

function renderizarCabecalhoTabela(turnosComDano) {
    const linhaCabecalho = tabelaBatalha.querySelector('thead tr')

    linhaCabecalho.innerHTML = `
        <th class="tabela-batalha__cabecalho-celula">Iniciativa</th>
        <th class="tabela-batalha__cabecalho-celula">Jogador</th>
        <th class="tabela-batalha__cabecalho-celula">Personagem</th>
        `

    turnosComDano.forEach(function (numeroTurno) {
        const celula = document.createElement('th')
        celula.className = 'tabela-batalha__cabecalho-celula'
        celula.textContent = 'T' + numeroTurno
        linhaCabecalho.appendChild(celula)
    })

    linhaCabecalho.innerHTML += `
        <th class="tabela-batalha__cabecalho-celula">PV Máx.</th>
        <th class="tabela-batalha__cabecalho-celula">PV Atual</th>
        <th class="tabela-batalha__cabecalho-celula">Ações</th>
    `
}

/* Cria e retorna uma linha <tr> completa
para um personagem especifico. */

function criarLinhaPersonagem(personagem, indice, turnosComDano) {
    const linha = document.createElement('tr')
    linha.className = 'tabela-batalha__linha'
    linha.dataset.id = personagem.id

    const estadoAtivo = (indice === indicePersonagemAtivo)
    if (estadoAtivo) {
        linha.classList.add('tabela-batalha__linha--ativa')
    }

    //CELULA DE INICIATIVA
    linha.innerHTML = `
        <td class="tabela-batalha__celula">
            ${personagem.iniciativa}    
        </td>
    `
    //CELULA DE JOGADOR
    linha.innerHTML += `
        <td class="tabela-batalha__celula">
            ${personagem.jogador}
        </td>
    `

    //CELULA DE PERSONAGEM (MCOM INCONE SE AITVO)
    linha.innerHTML += `
    <td class="tabela-batalha__celula">
        ${estadoAtivo ? '⚔️ ' : ''}${personagem.nome}
    </td>
    `

    //CELULA DE DANO POR TURNO
    turnosComDano.forEach(function (numeroTurno) {
        const danoNoTurno = (historicoDanos[personagem.id] || {})[numeroTurno]
        const celula = document.createElement('td')
        celula.className = 'tabela-batalha__celula'

        if (danoNoTurno) {
            celula.classList.add('tabela-batalha__celula--dano')
            celula.textContent = danoNoTurno
        } else {
            celula.style.textAlign = 'center'
            celula.style.color = 'var(--cor-texto-secundario)'
            celula.textContent = '—'
        }

        linha.appendChild(celula)
    })

    //CELULA PV MAXIMO
    linha.innerHTML += `
        <td class="tabela-batalha__celula">
            ${personagem.pvMaximo}
        </td>
    `
    //CELULA PV ATUAL (VERMELHO SE CRITICO)
    const pvCritico = personagem.pvAtual <= Math.floor(personagem.pvMaximo * 0.25)
    linha.innerHTML += `
        <td class="tabela-batalha__celula ${pvCritico
            ? 'tabela-batalha__celula--pv-critico'
            : 'tabela-batalha__celula--pv-atual'}">
            ${personagem.pvAtual}${pvCritico ? ' ❌' : ''}
        </td>
    `
    // Célula de ações
    linha.innerHTML += `
    <td class="tabela-batalha__celula">
      <button
        class="botao botao--excluir"
        data-id="${personagem.id}">
        🗑️ Remover
      </button>
    </td>
  `;

    return linha;
}

/**
 * Função principal de renderização.
 * Reconstrói toda a tabela com base no estado atual.
 */
function renderizarTabela() {
    // Atualiza o indicador de turno
    indicadorTurno.textContent = 'Turno: ' + turnoAtual

    // Coleta os turnos que têm dano registrado
    const turnosComDano = obterTurnosComDano()

    // Redesenha o cabeçalho
    renderizarCabecalhoTabela(turnosComDano)

    // Limpa o corpo da tabela
    corpoTabela.innerHTML = ''

    if (listaPersonagens.length === 0) {
        corpoTabela.innerHTML = `
      <tr>
        <td
          class="tabela-batalha__celula"
          colspan="7"
          style="text-align:center; color:var(--cor-texto-secundario); font-style:italic; padding: 2rem;">
          Nenhum personagem cadastrado. Adicione aventureiros para começar!
        </td>
      </tr>
    `
        return;
    }

    // Cria e insere uma linha para cada personagem
    listaPersonagens.forEach(function (personagem, indice) {
        const linha = criarLinhaPersonagem(personagem, indice, turnosComDano);
        corpoTabela.appendChild(linha);
    })

}

/* ============================================================
   SEÇÃO 4 — FUNÇÕES DE PERSONAGEM
   Responsáveis por adicionar e remover personagens da batalha.
   ============================================================ */

/**
 * Valida os campos do formulario de cadastro.
 * Retorna true se tudo estiiver correto, falso caso contratio.
 */

function validarCadastroPersonagem() {
    const nomeJogador = campoJogador.value.trim()
    const nomePersonagem = campoPersonagem.value.trim()
    const iniciativa = Number(campoIniciativa.value)
    const pontosDeVida = Number(campoPontosDeVida.value)

    if (!nomeJogador) {
        alert('Por favor, informe o noome do jogador.')
        campoJogador.focus()
        return false
    }

    if (!nomePersonagem) {
        alert('Por favor, informe o nome do personagem.')
        campoPersonagem.focus()
        return false
    }

    if (!campoIniciativa.value || isNaN(iniciativa)) {
        alert('Por favor, informe um valor de iniciativa válido.')
        campoIniciativa.focus()
        return false
    }

    if (!campoPontosDeVida.value || isNaN(pontosDeVida) || pontosDeVida <= 0) {
        alert('Por favor, informe um valor de PV válido e maior que zero.')
        campoPontosDeVida.focus()
        return false
    }

    return true
}

/* 
    Cria um objeto personagem com os dados do formulário.
 */

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

/* 
Limpa todos os campos do formulário de cadastro.
*/

function limparCamposCadastro() {
    campoJogador.value = ''
    campoPersonagem.value = ''
    campoIniciativa.value = ''
    campoPontosDeVida.value = ''
    campoJogador.focus()

}

/** 
* Adiciona um personagem à batalha.
* Ordena a lista por iniciativa (maior primeiro).
*/

function adicionarPersonagem() {
    if (!validarCadastroPersonagem()) return

    const novoPersonagem = criarObjetoPersonagem()


    //Inicializa o histórico de danos deste personagem
    historicoDanos[novoPersonagem.id] = {}  
    listaPersonagens.push(novoPersonagem)
    listaPersonagens.sort(function (a, b) {
        return b.iniciativa - a.iniciativa
    })

    limparCamposCadastro()
    renderizarTabela()
}

/* 
Remove um personagem da batalha pelo seu id.
*/

function removerPersonagem(idPersonagem) {
    const confirmacao = confirm('Deseja realmente remover este personagem da batalha?')
    if (!confirmacao) return

    listaPersonagens = listaPersonagens.filter(function (personagem) {
        return personagem.id !== idPersonagem
    })

    delete historicoDanos[idPersonagem]

    //Ajusta o índice ativo se necessário
    if (indicePersonagemAtivo >= listaPersonagens.length) {
        indicePersonagemAtivo = 0
    }

    renderizarTabela()
}

/** 
 * Deteccta cliques nos botões de remover dentro da tabala.
 * Usamos delegação de eventos para capturar botões criados diinamicamente.
  */
corpoTabela.addEventListener('click', function (evento) {
    const botaoClicado = evento.target.closest('.botao--excluir')
    if (!botaoClicado) return

    const idPersonagem = Number(botaoClicado.dataset.id)
    removerPersonagem(idPersonagem)
})

//Conecta o botão de eadcionar à função
botaoAdicionarPersonagem.addEventListener('click', adicionarPersonagem)

/* ============================================================
   SEÇÃO 5 — FUNÇÕES DE BATALHA
   Responsáveis pelo controle de dano, cura e turnos.
   ============================================================ */

/* 
* Retorna o personagem atualmente ativo na ordem de iniciativa
*/

function obterPersonagemAtivo() {
    return listaPersonagens[indicePersonagemAtivo]
}

/*
 * Valida se existe um personagem ativo e um valor numérico Válido
 no campo informado.
 */

function validarAcaoBatalha(campoValor, nomeCampo) {
    if (listaPersonagens.length === 0) {
        alert('Nenhum personagem no campo de batalha!')
        return false
    }

    const valor = Number(campoValor.value)

    if (!campoValor.value || isNaN(valor) || valor <= 0) {
        alert('Por favor, informe um valor válido para ' + nomeCampo + '.')
        campoValor.focus()
        return false
    }

    return true
}

/**
 * Aplica dano ao personagem atualmente ativo.
 * Registra o dano no histórico do tuno atual.
 */

function aplicarDano() {
    if (!validarAcaoBatalha(campoDano, 'o dano')) return

    const personagemAtivo = obterPersonagemAtivo()
    const valorDano = Number(campoDano.value)

    //Subtrair o dano dos PV, sem deixar baixar a zero
    personagemAtivo.pvAtual = Math.max(0, personagemAtivo.pvAtual - valorDano)

    //Registrar no historico - acumula se já houver dano neste turno
    const danoAnterior = historicoDanos[personagemAtivo.id][turnoAtual] || 0
    historicoDanos[personagemAtivo.id][turnoAtual] = danoAnterior + valorDano

    campoDano.value = ''
    renderizarTabela()

    //Avisar se o personagem chegou a zero
    if (personagemAtivo.pvAtual === 0) {
        alert(personagemAtivo.nome + 'chegou a 0 PV e está inconsciente!')
    }
}

/**
 * Aplica cura ao personagem atualmente ativo.
 * PV não pode sultrapassar o valor máximo.
 */

function aplicarCura() {
    if (!validarAcaoBatalha(campoCura, 'a cura')) return

    const personagemAtivo = obterPersonagemAtivo()
    const valorCura = Number(campoCura.value)

    //Soma a cura nos PV, sem ultrapassar o máximo
    personagemAtivo.pvAtual = Math.min(
        personagemAtivo.pvMaximo,
        personagemAtivo.pvAtual + valorCura
    )

    campoCura.value = ''
    renderizarTabela()
}

/**
 * 
 * avançar para o próximo personagem na ordem de iniciativa.
 * Quando todos jogaram, incrementa o número do turno.
 */

function avancarTurno() {
    if (listaPersonagens.length === 0) {
        alert('Nenhum personagem cadastrado na batalha!')
        return
    }

    indicePersonagemAtivo++

    //Se passou do último personagem, volta ao primeiro e avança o turno
    if (indicePersonagemAtivo >= listaPersonagens.length) {
        indicePersonagemAtivo = 0
        turnoAtual++
    }

    renderizarTabela()
}

//Conecta os botões de batalha às suas funções
botaoAplicarDano.addEventListener('click', aplicarDano)
botaoAplicarCura.addEventListener('click', aplicarCura)
botaoProximoTurno.addEventListener('click', avancarTurno)

/* ============================================================
   SEÇÃO 6 — FUNÇÕES DE TEMA
   Responsável por alternar entre modo escuro e claro.
   ============================================================ */

   /*
     Alterna entre o tema escuro eo tema claro.
   */
function alternarTema() {
    temaClaro = !temaClaro

    document.documentElement.classList.toggle('tema-claro', temaClaro)

    botaoTema.textContent = temaClaro ? '🌑 Modo Escuro' : '🌙  Modo Claro'
}

//Conecta o botão de tema à sua função 
botaoTema.addEventListener('click', alternarTema)

/* ============================================================
   SEÇÃO 7 — INICIALIZAÇÃO
   Ponto de entrada da aplicação — executa ao carregar a página.
   ============================================================ */

   /* 
     Inicializa a aplicação.
   */

     function inicializar() {
        renderizarTabela()
     }

     inicializar()



