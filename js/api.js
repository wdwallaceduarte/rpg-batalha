const URL_BASE = 'http://localhost:3000'

export async function buscarPersonagensNaApi() {
  const resposta = await fetch(`${URL_BASE}/personagens`)
  return await resposta.json()
}

export async function salvarPersonagemNaApi(personagem) {
  const resposta = await fetch(`${URL_BASE}/personagens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(personagem)
  })
  return await resposta.json()
}

export async function atualizarPersonagemNaApi(id, dadosAtualizados) {
  const resposta = await fetch(`${URL_BASE}/personagens/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAtualizados)
  })
  return await resposta.json()
}

export async function removerPersonagemDaApi(id) {
  await fetch(`${URL_BASE}/personagens/${id}`, {
    method: 'DELETE'
  })
}