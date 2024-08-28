// Espera até que o documento HTML esteja completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    // Preenche o campo de email com dados armazenados no localStorage, se disponível
    document.getElementById('email_cliente').textContent = localStorage.getItem('email_cliente') || '';

    // Adiciona um ouvinte de evento para o botão 'Reenviar Código'
    document.getElementById('reenviar-codigo').addEventListener('click', function() {
        var email_cliente = localStorage.getItem('email_cliente'); // Obtém o email do localStorage

        // Faz uma requisição para enviar o código de verificação ao email do cliente
        fetch('http://localhost:3002/enviar-codigo', {
            method: 'POST', // Método POST para enviar dados
            headers: {
                'Content-Type': 'application/json' // Tipo de conteúdo JSON
            },
            body: JSON.stringify({ email_cliente: email_cliente }) // Corpo da requisição em formato JSON
        })
        .then(response => response.json()) // Converte a resposta para JSON
        .then(dados => {
            mostrarMensagemBackEnd(dados.message, 'sucesso'); // Mostra uma mensagem de sucesso na tela
        })
        .catch(erro => {
            console.error('Erro ao reenviar código de verificação:', erro); // Exibe um erro no console em caso de falha na requisição
            mostrarMensagemBackEnd('Erro ao reenviar código de verificação.', 'erro'); // Mostra uma mensagem de erro na tela
        });
    });

    // Adiciona um ouvinte de evento para o formulário de verificação
    document.getElementById('formulario-de-verificacao').addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        var codigo_verificacao = document.getElementById('codigo_verificacao').value; // Obtém o código de verificação do formulário

        // Faz uma requisição para verificar o código de verificação e registrar o usuário
        fetch('http://localhost:3002/verificar-codigo', {
            method: 'POST', // Método POST para enviar dados
            headers: {
                'Content-Type': 'application/json' // Tipo de conteúdo JSON
            },
            body: JSON.stringify({
                email_cliente: localStorage.getItem('email_cliente'), // Obtém o email do localStorage
                codigo_verificacao: codigo_verificacao, // Envia o código de verificação digitado
                nome_cliente: localStorage.getItem('nome_cliente'), // Obtém o nome do cliente do localStorage
                senha_cliente: localStorage.getItem('senha_cliente'), // Obtém a senha do cliente do localStorage
                cpf_cliente: localStorage.getItem('cpf_cliente'), // Obtém o CPF do cliente do localStorage
                telefone_cliente: localStorage.getItem('telefone_cliente'), // Obtém o telefone do cliente do localStorage
                data_de_nascimento_cliente: localStorage.getItem('data_de_nascimento_cliente') // Obtém a data de nascimento do cliente do localStorage
            })
        })
        .then(response => response.json()) // Converte a resposta para JSON
        .then(dados => {
            // Se o servidor retornar 'Usuário registrado com sucesso'
            if (dados.message === 'Usuário registrado com sucesso') {
                mostrarMensagemBackEnd('Usuário registrado com sucesso', 'sucesso'); // Mostra mensagem de sucesso na tela
                localStorage.clear(); // Limpa todos os dados do localStorage
                setTimeout(() => {
                    window.location.href = 'paginaDeLogin.html'; // Redireciona para a página de login após 1 segundo
                }, 1000);
            } else {
                mostrarMensagemBackEnd(dados.message, 'erro'); // Mostra mensagem de erro na tela
            }
        })
        .catch(erro => {
            console.error('Erro ao verificar código de verificação:', erro); // Exibe um erro no console em caso de falha na requisição
            mostrarMensagemBackEnd('Erro ao verificar código de verificação.', 'erro'); // Mostra mensagem de erro na tela
        });
    });

    // Adiciona um ouvinte de evento para o botão 'Voltar ao Cadastro'
    document.getElementById('voltar-cadastro').addEventListener('click', function() {
        window.location.href = 'paginaDeCadastro.html'; // Redireciona para a página de cadastro ao clicar
    });
});

// Função para mostrar mensagens na tela
function mostrarMensagemBackEnd(mensagem, tipo) {
    const caixaMensagem = document.createElement('div'); // Cria um novo elemento <div>
    caixaMensagem.className = `mensagem ${tipo}`; // Define a classe da mensagem com base no tipo (sucesso ou erro)
    caixaMensagem.textContent = mensagem; // Define o texto da mensagem

    document.body.appendChild(caixaMensagem); // Adiciona a mensagem ao corpo do documento HTML

    setTimeout(() => {
        document.body.removeChild(caixaMensagem); // Remove a mensagem após 1 segundo
    }, 1000);
}
