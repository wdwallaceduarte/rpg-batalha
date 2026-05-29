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

/* ============================================================
   SEÇÃO 4 — FUNÇÕES DE PERSONAGEM
   Responsáveis por adicionar e remover personagens da batalha.
   ============================================================ */

/**
 * Valida os campos do formulario de cadastro.
 * Retorna true se tudo estiiver correto, falso caso contratio.
 */

function validarCadastroPersonagem() {
    const nomeJogador = campoJogador.ariaValueMax.trim()
    const nomePersonagem = campoPersonagem.ariaValueMax.trim()
    const iniciativa = Number(campoIniciativa.value)
    const pontosDeVida = Number(campoPontosDeVida)

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

    function cirarObjetoPersonagem() {
        return {
            id: Data.now(),
            jogador: campoJogador.value.trim(),
            nome: campoPersonagem.value.trim(),
            iniciativa: Number(campoIniciativa.value),
            pvMaximo: Number(campoPontosDeVida.value),
            pvAtual: Number(campoPontosDeVida)
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
        campoJogador.focus() = ''

    }

    /** 
    * Adiciona um personagem à batalha.
    * Ordena a lista por iniciativa (maior primeiro).
    */

    function adcionarPersonagem() {
        if (!validarCadastroPersonagem()) return

        const novoPersonagem = cirarObjetoPersonagem


        //Inicializa o histórico de danos deste personagem
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

        delete historicoDano[idPersonagem]

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
     botaoAdcionarPersonagem.addEventListener('click', adcionarPersonagem)