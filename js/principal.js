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
