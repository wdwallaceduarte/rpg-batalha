/* ============================================================
   MÓDULO: api.js (Refatorado para localStorage)
   ============================================================ */

const CHAVE_STORAGE = 'rpg_batalha_personagens'

// Função auxiliar para ler os dados convertidos do localStorage
function lerDoStorage() {
  const dados = localStorage.getItem(CHAVE_STORAGE)
  return dados ? JSON.parse(dados) : []
}

// Função auxiliar para gravar o array atualizado no localStorage
function salvarNoStorage(lista) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista))
}

/* ============================================================
   FUNÇÕES PÚBLICAS (Mantemos o async/await para não quebrar 
   a assinatura de código dos outros módulos)
   ============================================================ */

export async function buscarPersonagensNaApi() {
  return lerDoStorage()
}

export async function salvarPersonagemNaApi(novoPersonagem) {
  const lista = lerDoStorage()
  lista.push(novoPersonagem)
  salvarNoStorage(lista)
  return novoPersonagem
}

export async function atualizarPersonagemNaApi(id, dadosAtualizados) {
  const lista = lerDoStorage()
  const indice = lista.findIndex(personagem => personagem.id === id)

  if (indice !== -1) {
    lista[indice] = { ...lista[indice], ...dadosAtualizados }
    salvarNoStorage(lista)
    return lista[indice]
  }

  throw new Error('Personagem não encontrado para atualização.')
}

export async function removerPersonagemDaApi(id) {
  const lista = lerDoStorage()
  const listaFiltrada = lista.filter(personagem => personagem.id !== id)
  salvarNoStorage(listaFiltrada)
}