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
