document.addEventListener('DOMContentLoaded', () => {
    // Seleção de elementos do DOM
    const tokenRegistro = document.getElementById('token-de-registro');
    const tokenLogin = document.getElementById('login-token');
    const botaoLogin = document.querySelector('.botao-login img');
    const iconeMenu = document.getElementById('menu-icon');
    const conteudoMenu = document.getElementById('menu-content');
    const spanNomeUsuario = document.getElementById('nome-de-usuario');
    const menuUsuario = document.getElementById('usuario-menu');
    const botaoLogout = document.getElementById('logout-button');

    // Função para gerar um token aleatório codificado em base64
    function gerarToken() {
        return btoa(Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36));
    }

    // Atribuir token de registro se existir
    if (tokenRegistro) {
        tokenRegistro.value = gerarToken();
    }

    // Atribuir token de login se existir
    if (tokenLogin) {
        tokenLogin.value = gerarToken();
    }

    // Função assíncrona para verificar se há um token válido armazenado localmente
    async function verificarToken() {
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
                return dados;
            } else {
                console.log('Falha ao verificar token');
                return null;
            }
        } catch (erro) {
            console.error('Erro ao verificar o token:', erro);
            return null;
        }
    }

    // Função para atualizar a interface com base no estado do login
    function atualizarBotaoLogin(dadosUsuario) {
        if (dadosUsuario) {
            console.log('Usuário logado:', dadosUsuario.nome_cliente);
            botaoLogin.style.display = 'none'; // Esconde botão de login
            spanNomeUsuario.textContent = dadosUsuario.nome_cliente; // Exibe nome do usuário logado
            menuUsuario.style.display = 'flex'; // Exibe menu do usuário

            if (dadosUsuario.isAdmin) { // Se o usuário for administrador, adiciona link para o painel de administração
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.textContent = 'Painel de Administração';
                conteudoMenu.prepend(adminLink); // Insere o link no início do menu
            }
        } else {
            console.log('Nenhum usuário logado');
            botaoLogin.style.display = 'inline'; // Exibe botão de login
            spanNomeUsuario.style.display = 'none'; // Esconde nome do usuário
            menuUsuario.style.display = 'none'; // Esconde menu do usuário
        }
    }

    // Função assíncrona para inicializar o script
    async function inicializar() {
        const dadosUsuario = await verificarToken(); // Verifica se há um usuário logado
        atualizarBotaoLogin(dadosUsuario); // Atualiza a interface com base no estado do usuário logado

        // Evento de clique no botão de logout
        if (botaoLogout) {
            botaoLogout.addEventListener('click', () => {
                localStorage.removeItem('token'); // Remove o token armazenado localmente
                atualizarBotaoLogin(null); // Atualiza a interface para indicar que nenhum usuário está logado
                window.location.href = 'index.html'; // Redireciona para a página inicial
            });
        }

        // Evento de clique no ícone do menu
        if (iconeMenu) {
            iconeMenu.addEventListener('click', (event) => {
                event.stopPropagation();
                conteudoMenu.classList.toggle('show'); // Alterna a exibição do menu ao clicar no ícone
            });

            // Evento para fechar o menu ao clicar fora dele
            window.addEventListener('click', function(event) {
                if (!event.target.closest('.menu-icon') && !event.target.closest('.menu-content')) {
                    conteudoMenu.classList.remove('show');
                }
            });
        }
    }

    // Inicializa o script quando o DOM estiver completamente carregado
    inicializar();
});
