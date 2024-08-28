document.addEventListener('DOMContentLoaded', () => {
    const registerToken = document.getElementById('token-de-registro');
    const loginToken = document.getElementById('login-token');
    const botaoLogin = document.querySelector('.botao-login img');
    const botaoLogout = document.getElementById('botao-sair');
    const userNameSpan = document.getElementById('nome-de-usuario');

    // Gerar um token anti-bot
    function generateToken() {
        return btoa(Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36));
    }

    // Definir tokens nos campos ocultos
    if (registerToken) {
        registerToken.value = generateToken();
    }

    if (loginToken) {
        loginToken.value = generateToken();
    }

    // Verificar se o usuário está logado
    async function verificarToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Nenhum token encontrado');
            return null;
        }

        const response = await fetch('http://localhost:3002/verificar-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token verificado com sucesso:', data.nome_cliente);
            return data.nome_cliente;
        } else {
            console.log('Falha ao verificar token');
            return null;
        }
    }

    function atualizarBotaoLogin(nomeUsuario) {
        if (nomeUsuario) {
            console.log('Usuário logado:', nomeUsuario);
            botaoLogin.style.display = 'none';
            userNameSpan.textContent = nomeUsuario;
            userNameSpan.style.display = 'inline';
            botaoLogout.style.display = 'inline';
        } else {
            console.log('Nenhum usuário logado');
            botaoLogin.style.display = 'inline';
            userNameSpan.style.display = 'none';
            botaoLogout.style.display = 'none';
        }
    }

    async function inicializar() {
        const nomeUsuario = await verificarToken();
        atualizarBotaoLogin(nomeUsuario);

        // Adicionar evento de logout
        if (botaoLogout) {
            botaoLogout.addEventListener('click', () => {
                localStorage.removeItem('token');
                atualizarBotaoLogin(null);
                window.location.href = 'index.html';
            });
        }
    }

    inicializar();
});
