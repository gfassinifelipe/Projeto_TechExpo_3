document.addEventListener('DOMContentLoaded', function() {
    // Este trecho de código é executado quando a página HTML é completamente carregada

    // Preencher campos do formulário com dados salvos no localStorage, se existirem
    document.getElementById('nome_cliente').value = localStorage.getItem('nome_cliente') || '';
    document.getElementById('email_cliente').value = localStorage.getItem('email_cliente') || '';
    document.getElementById('senha_cliente').value = localStorage.getItem('senha_cliente') || '';
    document.getElementById('confirmar_senha_cliente').value = localStorage.getItem('senha_cliente') || '';
    document.getElementById('cpf_cliente').value = localStorage.getItem('cpf_cliente') || '';
    document.getElementById('telefone_cliente').value = localStorage.getItem('telefone_cliente') || '';
    document.getElementById('data_de_nascimento_cliente').value = localStorage.getItem('data_de_nascimento_cliente') || '';
});

// Listener para o envio do formulário de cadastro
document.getElementById('fomulario-de-cadastro').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio inicial do formulário

    // Obter valores dos campos do formulário
    var nome_cliente = document.getElementById('nome_cliente').value;
    var email_cliente = document.getElementById('email_cliente').value;
    var senha_cliente = document.getElementById('senha_cliente').value;
    var confirmarSenha = document.getElementById('confirmar_senha_cliente').value;
    var cpf_cliente = document.getElementById('cpf_cliente').value;
    var telefone_cliente = document.getElementById('telefone_cliente').value;
    var data_de_nascimento_cliente = document.getElementById('data_de_nascimento_cliente').value;

    // Verificar se as senhas coincidem
    if (senha_cliente !== confirmarSenha) {
        mostrarMensagemBackEnd('As senhas não coincidem!', 'erro');
        return;
    }

    // Verificar unicidade do CPF e do e-mail através de uma requisição POST
    fetch('http://localhost:3002/verificar-unicidade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cpf_cliente: cpf_cliente, email_cliente: email_cliente })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            mostrarMensagemBackEnd(data.message, 'erro'); // Exibir mensagem de erro se já existir um usuário com CPF ou e-mail cadastrados
        } else {
            // Se os dados forem únicos, enviar um código de verificação por e-mail
            fetch('http://localhost:3002/enviar-codigo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email_cliente: email_cliente })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Código de verificação enviado com sucesso') {
                    // Salvar dados no localStorage e redirecionar para a página de cadastro 2
                    localStorage.setItem('nome_cliente', nome_cliente);
                    localStorage.setItem('email_cliente', email_cliente);
                    localStorage.setItem('senha_cliente', senha_cliente);
                    localStorage.setItem('cpf_cliente', cpf_cliente);
                    localStorage.setItem('telefone_cliente', telefone_cliente);
                    localStorage.setItem('data_de_nascimento_cliente', data_de_nascimento_cliente);
                    window.location.href = 'paginaDeCadastro2.html';
                } else {
                    mostrarMensagemBackEnd(data.message, 'erro'); // Exibir mensagem de erro se houver problemas no envio do código de verificação
                }
            })
            .catch(error => {
                console.error('Erro ao enviar código de verificação:', error);
                mostrarMensagemBackEnd('Erro ao enviar código de verificação.', 'erro'); // Exibir mensagem de erro genérico se houver falha na requisição
            });
        }
    })
    .catch(error => {
        console.error('Erro ao verificar a unicidade dos dados:', error);
        mostrarMensagemBackEnd('Erro ao verificar a unicidade dos dados.', 'erro'); // Exibir mensagem de erro se houver falha na requisição de verificação de unicidade
    });
});

// Listener para formatar o CPF conforme é digitado
document.getElementById('cpf_cliente').addEventListener('input', function(event) {
    var value = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (value.length > 3) value = value.slice(0, 3) + '.' + value.slice(3); // Insere ponto após o terceiro dígito
    if (value.length > 7) value = value.slice(0, 7) + '.' + value.slice(7); // Insere ponto após o sétimo dígito
    if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11, 13); // Insere hífen após o décimo primeiro dígito
    event.target.value = value; // Atualiza o valor do campo de CPF
});

// Listener para formatar o telefone conforme é digitado
document.getElementById('telefone_cliente').addEventListener('input', function(event) {
    var value = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (value.length > 2) value = '(' + value.slice(0, 2) + ') ' + value.slice(2); // Formata código de área
    if (value.length > 8) value = value.slice(0, 10) + '-' + value.slice(10); // Insere hífen após o oitavo dígito
    event.target.value = value.slice(0, 15); // Atualiza o valor do campo de telefone limitando a 15 caracteres
});

// Função para alternar a visibilidade da senha
const alternarVisibilidadeSenha = (toggleId, inputId, eyeId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    const eye = document.getElementById(eyeId);

    toggle.addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text'; // Mostra a senha
            eye.classList.remove('config-olho');
            eye.classList.add('config-olho-2');
        } else {
            input.type = 'password'; // Esconde a senha
            eye.classList.remove('config-olho-2');
            eye.classList.add('config-olho');
        }
    });
};

// Ativar alternância de visibilidade para campo de senha e confirmar senha
alternarVisibilidadeSenha('toggle-senha', 'senha_cliente', 'eye-senha');
alternarVisibilidadeSenha('toggle-confirmar-senha', 'confirmar_senha_cliente', 'eye-confirmar-senha');

// Função para mostrar mensagem de feedback na interface
function mostrarMensagemBackEnd(mensagem, tipo) {
    const caixaMensagem = document.createElement('div'); // Cria um elemento de mensagem
    caixaMensagem.className = `mensagem ${tipo}`; // Define classes de estilo para a mensagem
    caixaMensagem.textContent = mensagem; // Define o texto da mensagem
    document.body.appendChild(caixaMensagem); // Adiciona a mensagem ao corpo do documento
    setTimeout(() => {
        document.body.removeChild(caixaMensagem); // Remove a mensagem após 1 segundo
    }, 1000);
}
