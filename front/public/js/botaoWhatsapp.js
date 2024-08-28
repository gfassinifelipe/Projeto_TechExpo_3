document.addEventListener('DOMContentLoaded', () => {
    // Evento para fechar o modal do WhatsApp ao clicar no botão de fechar
    document.getElementById('fechar-whatsapp').addEventListener('click', () => {
        const modal = document.getElementById('janela-modal-whatsapp');
        modal.classList.remove('abrir');
    });

    // Evento para fechar o modal de coleta de nome ao clicar no botão de fechar
    document.getElementById('fechar-nome').addEventListener('click', () => {
        const modalNome = document.getElementById('janela-modal-nome');
        modalNome.classList.remove('abrir');
    });

    // Evento para enviar o nome do usuário ao clicar no botão de enviar nome
    document.getElementById('enviar-nome').addEventListener('click', () => {
        const nomeUsuario = document.getElementById('nome-usuario').value;
        const numero = document.getElementById('nome-usuario').dataset.numero;
        abrirWhatsApp(numero, nomeUsuario); // Chama a função para abrir o WhatsApp com o nome do usuário
    });

    // Verifica se há um usuário logado ao carregar a página
    verificarUsuarioLogado();
});

// Função assíncrona para verificar se há um usuário logado usando token armazenado localmente
async function verificarUsuarioLogado() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('Nenhum token encontrado');
        return null;
    }

    try {
        const resposta = await fetch('http://localhost:3002/verificar-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token })
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            console.log('Token verificado com sucesso:', dados.nome_cliente);
            return dados.nome_cliente; // Retorna o nome do cliente logado
        } else {
            console.log('Falha ao verificar token');
            return null;
        }
    } catch (erro) {
        console.error('Erro ao verificar o token:', erro);
        return null;
    }
}

// Função para abrir o modal do WhatsApp
function abrirModalWhatsApp() {
    const modal = document.getElementById('janela-modal-whatsapp');
    modal.classList.add('abrir');
}

// Função para mostrar o modal de coleta de nome antes de abrir o WhatsApp
async function mostrarPromptNome(numero) {
    const nomeUsuario = await verificarUsuarioLogado();
    if (nomeUsuario) {
        abrirWhatsApp(numero, nomeUsuario); // Se o usuário estiver logado, abre o WhatsApp com o nome do usuário
    } else {
        const modalNome = document.getElementById('janela-modal-nome');
        modalNome.classList.add('abrir'); // Mostra o modal para coletar o nome do usuário
        document.getElementById('nome-usuario').dataset.numero = numero; // Armazena o número de telefone no dataset do elemento
    }
}

// Função para abrir o WhatsApp com o nome do usuário e mensagem padrão
function abrirWhatsApp(numero, nomeUsuario) {
    const mensagem = `Olá, sou ${nomeUsuario} e vim do site da Casa do Microondas`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank'); // Abre o WhatsApp em uma nova aba com a mensagem pré-definida

    const modalNome = document.getElementById('janela-modal-nome');
    modalNome.classList.remove('abrir'); // Fecha o modal de coleta de nome após abrir o WhatsApp
}
