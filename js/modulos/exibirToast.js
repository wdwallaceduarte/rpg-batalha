export function exibirToast(mensagem, tipo = 'info', duracao = 3000) {
  const toast = document.createElement('div')
  toast.className = `toast toast--${tipo}`

  const icones = {
    sucesso: '✅',
    erro:    '❌',
    aviso:   '⚠️',
    info:    '💬'
  }

  toast.innerHTML = `
    <span>${icones[tipo] || '💬'}</span>
    <span>${mensagem}</span>
  `

  toastContainer.appendChild(toast)

  // A animação CSS cuida de tudo — só precisamos remover o elemento após terminar
  const duracaoTotal = duracao > 3000 ? 5700 : 3700
  setTimeout(function() {
    toast.remove()
  }, duracaoTotal)
}