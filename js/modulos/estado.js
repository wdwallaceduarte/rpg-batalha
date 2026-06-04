/* ============================================================
   MÓDULO: estado.js
   Centraliza todas as variáveis de estado da aplicação.
   Importado por todos os outros módulos que precisam
   ler ou modificar o estado.
   ============================================================ */
   //Lista de personagens cadastrado na batalha
export let listaPersonagens = []

//NUMERO DE TURNO ATUAL
export let turnoAtual = 1

//INDICE DO PERSONAGEM ATIVO NA ORDEM DE INICIATIVA
export let indicePersonagemAtivo = 0

//HISTORICO DE DANO POR PERSONAGEM POR TURNO
// Estrutura: { [idPersonagem]: { [numeroTurno]: valorDano } }
export let historicoDanos = {}

//CONTROLA SE O TEMA CLARO ESTA ATIVO
export let temaClaro = false

/* ============================================================
   FUNÇÕES DE ATUALIZAÇÃO DE ESTADO
   Módulos externos não modificam o estado diretamente —
   usam estas funções para garantir consistência.
   ============================================================ */
   export function definirListaPersonagens(novaLista) {
    listaPersonagens = novaLista
   }

   export function adicionarPersonagemNaLista(personagem) {
    listaPersonagens.push(personagem)
    listaPersonagens.sort(function (a, b) {
        return b.iniciativa - a.iniciativa
    })
   }

   export function removerPersonagemDaLista(idPersonagem) {
    listaPersonagens = listaPersonagens.filter(function (p) {
        return p.id !==idPersonagem
    })
   }

   export function atualizarIndiceAtivo(novoIndice) {
    indicePersonagemAtivo = novoIndice
   }

   export function incrementarIndiceAtivo() {
    indicePersonagemAtivo++
   }

   export function incrementarTurno() {
    turnoAtual++
   }

   export function reiniciarIndiceAtivo() {
    indicePersonagemAtivo = 0
   }

   export function definirHistoricoDanos(id, historico) {
    historicoDanos[id] = historico
   }

   export function removerHistoricoDanos(id) {
    delete historicoDanos[id]
   }

   export function alternarTemaClaro() {
    temaClaro = !temaClaro
    return temaClaro
   }
   