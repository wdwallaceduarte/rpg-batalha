/* ============================================================
   SEÇÃO 1 — SELEÇÃO DE ELEMENTOS
   Capturamos aqui todos os elementos do HTML que o JavaScript
   vai precisar ler ou manipular.
   ============================================================ */

// CAMPOS DE CADASTROS

const campoJogador = document.getElementById('campoJogador')
const campoPersonagem = document.getElementById('campoPersonagem')
const campoIniciativa = document.getElementById('campoIniciativa')
const campoPortosDeVida = document.getElementById('campoPortosDeVida')

// BOTÃO DE cadastro
const botaoAdcionarPersonagem = document.getElementById('botaoAdcionarPersonagem')

//CAMPOS DE BATALHA
const campoDano = document.getElementById('campoDano')
const campoCura = document.getElementById('campoCura')

//BOTÕES DE BALHATA
const botaoAplicarDano = document.getElementById('botaoAplicarDano')
const botaoAplicarCura = document.getElementById('botaoAplicarCura')
const botaoProximoTurno = document.getElementById('botaoProximoTurno')

//AREA DE BATALHA
const corpoTabela = document.getElementById('corpoTabela')
const indicadorTruno = document.getElementById('indicadorTruno')
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
let historicoDano = {}

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

    listaPersonagens.forEach(function (PERSONAGEM) {
        const danosDoPersonagem = historicoDanos[personagem.id] || {}
        Objeto.keys(danosDoPersonagem).forEach(function (turno) {
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

function criaLinhaPersonagem(personagem, indice, turnosComDano) {
    const linha = document.createElement('tr')
    linha.className = 'tabela-batalha__linha'
    linha.dataset.id = personagem.id

    const estadoAtivo = (indice === indicePersonagemAtivo)
    if (estadoAtivo) {
        linha.classList.add('tabela-batalha__linha--ativa')
    }

    //CELULA DE INICIATIVA
    linha.innerHTML = + `
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
    <td class="tabela-batalha__celula>
        ${estaAtivo ? '⚔️ ' : ''}${personagem.nome}
    </td>
    `

    //CELULA DE DANO POR TURNO
    turnosComDano.forEach(function (numeroTurno) {
        const danoNoTurno = (historicoDano[personagem.id] || {})[numeroTurno]
        const celula = document.createElement('td')
        celula.className = 'tabela-batalha__celula'

        if (danoNoTurno) {
            celula.classList.add('tabela__celula--dano')
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
            ${personagem.pvAtual}${pvCritico ? ' ⚠️' : ''}
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
