// Espera até que o documento HTML esteja completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Obtém o formulário de login da página pelo seu ID
    const formularioDeLogin = document.getElementById('formulario-de-login');

    // Verifica se o formulário existe na página
    if (formularioDeLogin) {
        // Adiciona um ouvinte de evento para o envio do formulário de login
        formularioDeLogin.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão do formulário

            // Obtém os valores inseridos pelo usuário nos campos de email e senha
            const emailCliente = document.getElementById('email_cliente').value;
            const senhaCliente = document.getElementById('senha_cliente').value;

            // Realiza uma requisição POST para o servidor localhost na rota '/login'
            fetch('http://localhost:3002/login', {
                method: 'POST', // Método POST para enviar dados seguros
                headers: {
                    'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
                },
                body: JSON.stringify({ // Converte os dados para o formato JSON
                    email_cliente: emailCliente, // Envia o email do cliente
                    senha_cliente: senhaCliente // Envia a senha do cliente
                })
            })
            .then(response => response.json()) // Converte a resposta para JSON
            .then(data => {
                if (data.message === 'Login bem-sucedido') { // Se o login foi bem-sucedido
                    localStorage.setItem('token', data.token); // Armazena o token de autenticação no localStorage
                    localStorage.setItem('nome_usuario', data.nome_cliente); // Armazena o nome do usuário no localStorage
                    localStorage.setItem('isAdmin', data.isAdmin); // Armazena o status de admin no localStorage
                    mostrarMensagemBackEnd(data.message, 'sucesso'); // Mostra mensagem de sucesso
                    setTimeout(() => {
                        window.location.href = 'index.html'; // Redireciona para a página principal após 2 segundos
                    }, 2000);
                } else {
                    mostrarMensagemBackEnd(data.message, 'erro'); // Mostra mensagem de erro de login
                }
            })
            .catch(error => {
                console.error('Erro:', error); // Exibe erro no console em caso de falha na requisição
                mostrarMensagemBackEnd('Erro ao fazer login.', 'erro'); // Mostra mensagem de erro na interface
            });
        });

        // Adiciona um ouvinte de evento para o link 'Esqueci minha senha'
        document.getElementById('esqueci-senha').addEventListener('click', () => {
            const emailCliente = document.getElementById('email_cliente').value; // Obtém o email do cliente

            if (!emailCliente) { // Se o campo de email estiver vazio
                mostrarMensagemBackEnd('Por favor, insira seu email.', 'erro'); // Mostra mensagem de erro na interface
                return;
            }

            // Realiza uma requisição POST para enviar um email de recuperação de senha
            fetch('http://localhost:3002/esqueci-senha', {
                method: 'POST', // Método POST para enviar dados seguros
                headers: {
                    'Content-Type': 'application/json' // Define o tipo de conteúdo como JSON
                },
                body: JSON.stringify({ email_cliente: emailCliente }) // Envia o email do cliente no formato JSON
            })
            .then(response => response.json()) // Converte a resposta para JSON
            .then(data => {
                mostrarMensagemBackEnd(data.message, data.success ? 'sucesso' : 'erro'); // Mostra mensagem de sucesso ou erro
            })
            .catch(error => {
                console.error('Erro ao enviar email de recuperação de senha:', error); // Exibe erro no console em caso de falha na requisição
                mostrarMensagemBackEnd('Erro ao enviar email de recuperação de senha.', 'erro'); // Mostra mensagem de erro na interface
            });
        });
    } else {
        console.error('Elemento formulario-de-login não encontrado'); // Exibe mensagem de erro no console se o formulário não for encontrado
    }
});

// Função para mostrar mensagens de feedback na interface
function mostrarMensagemBackEnd(mensagem, tipo) {
    const caixaMensagem = document.createElement('div'); // Cria um novo elemento de mensagem
    caixaMensagem.className = `mensagem ${tipo}`; // Define a classe de estilo da mensagem
    caixaMensagem.textContent = mensagem; // Define o texto da mensagem
    document.body.appendChild(caixaMensagem); // Adiciona a mensagem ao corpo do documento
    setTimeout(() => {
        document.body.removeChild(caixaMensagem); // Remove a mensagem após 3 segundos (3000 milissegundos)
    }, 3000); // 3000 milissegundos = 3 segundos
}
