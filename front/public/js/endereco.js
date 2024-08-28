// Obter o token de autorização do localStorage
const token = localStorage.getItem('token');

// Aguardar até que o documento HTML esteja completamente carregado
document.addEventListener('DOMContentLoaded', function () {
    // Realizar uma requisição GET para verificar o endereço do usuário
    fetch('http://localhost:3002/verificar-endereco', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Incluir o token de autorização no cabeçalho
            'Content-Type': 'application/json' // Especificar o tipo de conteúdo como JSON
        }
    })
    .then(response => {
        // Verificar se a resposta da requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        return response.json(); // Converter a resposta para JSON
    })
    .then(data => {
        // Se houver um endereço retornado na resposta
        if (data.endereco) {
            // Atualizar a interface com o endereço existente
            const enderecoContainer = document.getElementById('caixa-form');
            const enderecoSalvo = document.getElementById('endereco-salvo');
            const formContainer = document.getElementById('caixa-form-2');

            // Preencher o elemento com o endereço salvo
            enderecoSalvo.textContent = `${data.endereco.endereco}, ${data.endereco.numero}, ${data.endereco.bairro}, ${data.endereco.cidade}, ${data.endereco.estado}, ${data.endereco.cep}`;
            enderecoContainer.classList.remove('hidden'); // Mostrar o container do endereço salvo

            // Adicionar evento para editar o endereço
            document.getElementById('editar-endereco').addEventListener('click', () => {
                enderecoContainer.classList.add('hidden'); // Esconder o container do endereço salvo
                formContainer.classList.remove('hidden'); // Mostrar o formulário de edição

                // Preencher campos do formulário com os dados atuais do endereço
                document.getElementById('endereco').value = data.endereco.endereco;
                document.getElementById('complemento').value = data.endereco.complemento;
                document.getElementById('bairro').value = data.endereco.bairro;
                document.getElementById('numero').value = data.endereco.numero;
                document.getElementById('cidade').value = data.endereco.cidade;
                document.getElementById('estado').value = data.endereco.estado;
                document.getElementById('cep').value = data.endereco.cep;
            });

            // Adicionar evento para usar o endereço para obter rota
            document.getElementById('usar-endereco').addEventListener('click', () => {
                obterRotaMaisProxima(data.endereco); // Chamar função para obter rota no Google Maps
            });
        } else {
            // Se não houver endereço retornado, mostrar o formulário vazio para adicionar um novo endereço
            document.getElementById('caixa-form-2').classList.remove('hidden');
        }
    })
    .catch(error => {
        // Capturar e tratar erros ocorridos durante a requisição
        console.error('Erro ao verificar endereço:', error);
        mostrarMensagemBackEnd('Erro ao verificar endereço.', 'erro'); // Exibir mensagem de erro na interface
        document.getElementById('caixa-form-2').classList.remove('hidden'); // Mostrar o formulário vazio em caso de erro
    });
});

// Listener para o envio do formulário de endereço
document.getElementById('form-endereco').addEventListener('submit', function (event) {
    event.preventDefault(); // Impedir o envio padrão do formulário

    // Obter dados do formulário de endereço
    const enderecoData = {
        endereco: document.getElementById('endereco').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        numero: document.getElementById('numero').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        cep: document.getElementById('cep').value
    };

    // Realizar uma requisição POST para salvar o endereço
    fetch('http://localhost:3002/salvar-endereco', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Incluir o token de autorização no cabeçalho
            'Content-Type': 'application/json' // Especificar o tipo de conteúdo como JSON
        },
        body: JSON.stringify(enderecoData) // Enviar os dados do endereço no formato JSON
    })
    .then(response => {
        // Verificar se a resposta da requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        return response.json(); // Converter a resposta para JSON
    })
    .then(data => {
        mostrarMensagemBackEnd(data.mensagem, 'sucesso'); // Exibir mensagem de sucesso na interface
        setTimeout(() => {
            location.reload(); // Recarregar a página após um curto intervalo
        }, 1000); // 1000 milissegundos = 1 segundo
    })
    .catch(error => {
        // Capturar e tratar erros ocorridos durante a requisição
        console.error('Erro ao salvar endereço:', error);
        mostrarMensagemBackEnd('Erro ao salvar endereço.', 'erro'); // Exibir mensagem de erro na interface
    });
});

// Função para obter a rota mais próxima no Google Maps com base no endereço
function obterRotaMaisProxima(enderecoData) {
    const enderecoCompleto = `${enderecoData.endereco}, ${enderecoData.numero}, ${enderecoData.bairro}, ${enderecoData.cidade}, ${enderecoData.estado}, ${enderecoData.cep}`;
    window.location.href = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(enderecoCompleto)}&destination=Av.+Pres.+Kennedy,+410+-+Rebou%C3%A7as,+Curitiba+-+PR,+80220-200,+Brasil`;
}

// Função para mostrar mensagens de feedback na interface
function mostrarMensagemBackEnd(mensagem, tipo) {
    const caixaMensagem = document.createElement('div'); // Criar um novo elemento de mensagem
    caixaMensagem.className = `mensagem ${tipo}`; // Definir a classe de estilo da mensagem
    caixaMensagem.textContent = mensagem; // Definir o texto da mensagem
    document.body.appendChild(caixaMensagem); // Adicionar a mensagem ao corpo do documento
    setTimeout(() => {
        document.body.removeChild(caixaMensagem); // Remover a mensagem após 3 segundos (3000 milissegundos)
    }, 3000); // 3000 milissegundos = 3 segundos
}
