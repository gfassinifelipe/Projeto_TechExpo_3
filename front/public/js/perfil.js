// Aguarda até que o documento HTML esteja completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Obtém elementos do formulário e tokens do localStorage
    const salvarAlteracoesForm = document.getElementById('formulario-de-perfil');
    const excluirContaButton = document.getElementById('excluir-conta');
    const atualizarSenhaForm = document.getElementById('formulario-de-senha');
    const token = localStorage.getItem('token');

    // Função para alternar a visibilidade da senha
    function toggleSenhaVisibility(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);

        toggle.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text'; // Mostra a senha
                toggle.innerHTML = '<i class="fas fa-eye-slash"></i>'; // Altera o ícone para olho fechado
            } else {
                input.type = 'password'; // Esconde a senha
                toggle.innerHTML = '<i class="fas fa-eye"></i>'; // Altera o ícone para olho aberto
            }
        });
    }

    // Aplica a função toggleSenhaVisibility para os campos de senha nos formulários
    toggleSenhaVisibility('toggle-senha-atual', 'senha_atual');
    toggleSenhaVisibility('toggle-nova-senha', 'nova_senha_cliente');
    toggleSenhaVisibility('toggle-confirmar-nova-senha', 'confirmar_nova_senha_cliente');

    // Função para obter e exibir o perfil do usuário
    async function obterPerfil() {
        try {
            const response = await fetch('http://localhost:3002/obter-perfil', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token de autenticação
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) { // Se a requisição for bem-sucedida
                    // Preenche os campos do formulário com os dados do perfil obtidos
                    document.getElementById('nome_cliente').value = data.cliente.nome_cliente;
                    document.getElementById('cpf_cliente').value = data.cliente.cpf_cliente;
                    document.getElementById('email_cliente').value = data.cliente.email_cliente;
                    document.getElementById('telefone_cliente').value = data.cliente.telefone_cliente;

                    // Formata e preenche a data de nascimento
                    const dataNascimento = new Date(data.cliente.data_de_nascimento_cliente);
                    const formattedDate = dataNascimento.toLocaleDateString('pt-BR');
                    document.getElementById('data_de_nascimento_cliente').value = formattedDate;
                }
            } else {
                console.error('Erro ao obter perfil'); // Exibe erro no console em caso de falha na requisição
            }
        } catch (error) {
            console.error('Erro ao obter perfil:', error); // Exibe erro no console em caso de erro na função
        }
    }

    // Função para salvar as alterações no perfil do usuário
    async function salvarAlteracoes(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Obtém os valores dos campos de nome e telefone do formulário
        const nome_cliente = document.getElementById('nome_cliente').value;
        const telefone_cliente = document.getElementById('telefone_cliente').value;

        // Valida o formato do telefone utilizando uma expressão regular
        const telefoneRegex = /^\(\d{2}\) \d \d{4}-\d{4}$/;
        if (!telefoneRegex.test(telefone_cliente)) {
            alert('Telefone deve estar no formato (xx) x xxxx-xxxx'); // Exibe mensagem de erro se o formato do telefone estiver incorreto
            return;
        }

        try {
            // Envia uma requisição POST para atualizar o perfil do usuário no servidor
            const response = await fetch('http://localhost:3002/atualizar-perfil', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token de autenticação
                },
                body: JSON.stringify({
                    nome_cliente,
                    telefone_cliente
                })
            });

            if (response.ok) {
                const data = await response.json(); // Converte a resposta para JSON
                alert(data.message); // Exibe mensagem de sucesso ou erro
            } else {
                console.error('Erro ao salvar alterações'); // Exibe erro no console em caso de falha na requisição
            }
        } catch (error) {
            console.error('Erro ao salvar alterações:', error); // Exibe erro no console em caso de erro na função
        }
    }

    // Função para atualizar a senha do usuário
    async function atualizarSenha(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        // Obtém os valores dos campos de senha atual, nova senha e confirmação de nova senha
        const senha_atual = document.getElementById('senha_atual').value;
        const nova_senha_cliente = document.getElementById('nova_senha_cliente').value;
        const confirmar_nova_senha_cliente = document.getElementById('confirmar_nova_senha_cliente').value;

        // Validações das senhas
        if (nova_senha_cliente === '') {
            alert('A nova senha não pode ser vazia!'); // Exibe mensagem de erro se a nova senha estiver vazia
            return;
        }

        if (nova_senha_cliente !== confirmar_nova_senha_cliente) {
            alert('As novas senhas não coincidem!'); // Exibe mensagem de erro se as novas senhas não coincidirem
            return;
        }

        try {
            // Envia uma requisição POST para atualizar a senha do usuário no servidor
            const response = await fetch('http://localhost:3002/atualizar-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token de autenticação
                },
                body: JSON.stringify({
                    senha_atual,
                    nova_senha_cliente
                })
            });

            if (response.ok) {
                const data = await response.json(); // Converte a resposta para JSON
                alert(data.message); // Exibe mensagem de sucesso ou erro
            } else {
                console.error('Erro ao atualizar senha'); // Exibe erro no console em caso de falha na requisição
            }
        } catch (error) {
            console.error('Erro ao atualizar senha:', error); // Exibe erro no console em caso de erro na função
        }
    }

    // Função para excluir a conta do usuário
    async function excluirConta() {
        // Exibe um alerta de confirmação antes de prosseguir com a exclusão da conta
        if (!confirm('Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
            return; // Cancela a operação se o usuário não confirmar
        }

        try {
            // Envia uma requisição DELETE para excluir a conta do usuário no servidor
            const response = await fetch('http://localhost:3002/excluir-conta', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token de autenticação
                }
            });

            if (response.ok) {
                const data = await response.json(); // Converte a resposta para JSON
                alert(data.message); // Exibe mensagem de sucesso ou erro
                if (data.success) {
                    localStorage.removeItem('token'); // Remove o token do localStorage
                    window.location.href = 'index.html'; // Redireciona para a página inicial após a exclusão da conta
                }
            } else {
                console.error('Erro ao excluir conta'); // Exibe erro no console em caso de falha na requisição
            }
        } catch (error) {
            console.error('Erro ao excluir conta:', error); // Exibe erro no console em caso de erro na função
        }
    }

    obterPerfil(); // Chama a função para obter o perfil do usuário ao carregar a página

    // Adiciona ouvintes de evento para os formulários e botões relevantes
    if (salvarAlteracoesForm) {
        salvarAlteracoesForm.addEventListener('submit', salvarAlteracoes); // Salva as alterações de perfil ao enviar o formulário
    }

    if (atualizarSenhaForm) {
        atualizarSenhaForm.addEventListener('submit', atualizarSenha); // Atualiza a senha ao enviar o formulário de atualização de senha
    }

    if (excluirContaButton) {
        excluirContaButton.addEventListener('click', excluirConta); // Exclui a conta ao clicar no botão de exclusão
    }
});
