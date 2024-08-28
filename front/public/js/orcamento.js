document.addEventListener('DOMContentLoaded', function() {
    // Verifica se há um usuário logado para decidir exibir ou não o campo de nome
    const nomeUsuario = document.getElementById('nome-de-usuario').innerText;
    if (nomeUsuario) {
        document.getElementById('nome-container').style.display = 'none'; // Esconde o campo de nome se o usuário estiver logado
    }
});

document.getElementById('enviar-orcamento').addEventListener('click', function() {
    // Captura os valores dos campos do formulário
    const produto = document.getElementById('produto').value;
    const problema = document.getElementById('problema').value;
    const marca = document.getElementById('marca').value;
    const loja = document.getElementById('loja').value;
    let nomeUsuario = document.getElementById('nome-de-usuario').innerText;
    
    // Exibe no console os dados capturados
    console.log('Produto:', produto);
    console.log('Problema:', problema);
    console.log('Marca:', marca);
    console.log('Loja:', loja);
    console.log('Nome do usuário:', nomeUsuario);
    
    // Monta a mensagem para enviar via WhatsApp
    const mensagem = `Olá, sou ${nomeUsuario} e vim do site da Casa do Microondas\n\n` +
                     `Meu ${produto} da marca ${marca} está enfrentando o seguinte problema:\n\n${problema}\n\n` +
                     `Queria saber como funciona a oficina de vocês e qual o preço em média desse reparo?`;

    console.log('Mensagem:', mensagem);

    // Abre uma nova janela do WhatsApp com a mensagem gerada
    window.open(`https://wa.me/${loja}?text=${encodeURIComponent(mensagem)}`, '_blank');
});

// Função para abrir o modal de orçamento
function abrirModalOrcamento() {
    console.log('Abrir modal orçamento');
    const nomeUsuario = document.getElementById('nome-de-usuario').innerText;
    if (nomeUsuario) {
        document.getElementById('nome-container').style.display = 'none'; // Esconde o campo de nome se o usuário estiver logado
    } else {
        document.getElementById('nome-container').style.display = 'block'; // Exibe o campo de nome se não houver usuário logado
    }
    document.getElementById('janela-modal-orcamento').style.display = 'block'; // Exibe o modal de orçamento
}

// Evento para fechar o modal de orçamento
document.getElementById('fechar-orcamento').addEventListener('click', function() {
    console.log('Fechar modal orçamento');
    document.getElementById('janela-modal-orcamento').style.display = 'none'; // Esconde o modal de orçamento ao clicar no botão de fechar
});
