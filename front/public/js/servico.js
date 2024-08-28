// Aguarda até que o documento HTML esteja completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Obtém o token de autenticação do localStorage
    const token = localStorage.getItem('token');

    // Função para carregar dados de uma URL específica e exibi-los na página
    const carregarDados = async (url, containerId, isAdmin) => {
        try {
            // Faz uma requisição GET para obter os dados da URL especificada
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Envia o token de autenticação na requisição
                }
            });

            // Converte a resposta para JSON
            const data = await response.json();

            // Se a requisição for bem-sucedida e retornar 'success'
            if (data.success) {
                // Obtém o elemento container onde os itens serão inseridos
                const container = document.getElementById(containerId);

                // Itera sobre os itens recebidos e cria elementos HTML para cada um
                data.items.forEach(item => {
                    const itemElem = document.createElement('div'); // Cria um novo elemento <div>
                    itemElem.classList.add('item'); // Adiciona a classe 'item' ao elemento

                    // Define o conteúdo HTML do elemento com base nos dados do item
                    itemElem.innerHTML = `
                        <button onclick="abrirModal('${item.titulo}', '${item.desc}', '${item.img}')">
                            <img src="${item.img}" alt="${item.titulo}">
                            <span>${item.titulo}</span>
                        </button>
                    `;

                    // Adiciona o elemento criado ao container principal
                    container.appendChild(itemElem);
                });

                // Se o usuário for um administrador, exibe o botão de adicionar novos itens
                if (isAdmin) {
                    document.getElementById(`adicionar-${containerId}`).style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error); // Exibe um erro no console caso ocorra algum problema
        }
    };

    // Função para verificar se o usuário é um administrador
    const verificarAdmin = async () => {
        try {
            // Faz uma requisição POST para verificar se o token é de um administrador
            const response = await fetch('http://localhost:3002/verificar-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Envia o token de autenticação na requisição
                }
            });

            // Converte a resposta para JSON
            const data = await response.json();

            // Retorna true se o usuário for um administrador, caso contrário, retorna false
            return data.isAdmin;
        } catch (error) {
            console.error('Erro ao verificar admin:', error); // Exibe um erro no console caso ocorra algum problema
            return false; // Retorna falso em caso de erro na verificação
        }
    };

    // Após verificar se o usuário é administrador, carrega dados de diferentes URLs
    verificarAdmin().then(isAdmin => {
        carregarDados('http://localhost:3002/marcas', 'marcas-wrapper', isAdmin); // Carrega marcas se o usuário for administrador
        carregarDados('http://localhost:3002/produtos', 'produtos-wrapper', isAdmin); // Carrega produtos se o usuário for administrador
        carregarDados('http://localhost:3002/mao-de-obra', 'servicos-wrapper', isAdmin); // Carrega serviços se o usuário for administrador
    });

    // Seleciona todos os botões com a classe 'botao-adicionar' e adiciona ouvintes de evento
    const botoesAdicionar = document.querySelectorAll('.botao-adicionar');
    botoesAdicionar.forEach(button => {
        button.addEventListener('click', () => {
            const tipo = button.id.split('-')[1]; // Obtém o tipo de item a ser adicionado
            console.log(`Adicionar novo ${tipo}`); // Exibe uma mensagem no console ao clicar no botão
        });
    });
});

// Função para abrir um modal com título, descrição e imagem específicos
function abrirModal(titulo, descricao, imagem) {
    const modal = document.getElementById('janela-modal'); // Obtém o elemento do modal
    document.getElementById('titulo-modal').innerText = titulo; // Define o título do modal
    document.getElementById('descricao-modal').innerHTML = descricao; // Define a descrição do modal
    document.getElementById('imagem-modal').src = imagem; // Define a imagem do modal
    modal.classList.add('abrir'); // Adiciona a classe 'abrir' para exibir o modal
}

// Função para abrir uma URL em uma nova aba
function abrirURL(url) {
    window.open(url, '_blank'); // Abre a URL especificada em uma nova aba
}

// Adiciona um ouvinte de evento para fechar o modal ao clicar no elemento com ID 'fechar'
document.getElementById('fechar').addEventListener('click', () => {
    const modal = document.getElementById('janela-modal'); // Obtém o elemento do modal
    modal.classList.remove('abrir'); // Remove a classe 'abrir' para fechar o modal
});

// Função para alternar a visibilidade do conteúdo em um container específico
function toggleContent(containerId, headerElem) {
    const content = document.getElementById(containerId); // Obtém o elemento do conteúdo a ser alternado
    const icon = headerElem.querySelector('i'); // Obtém o ícone associado ao cabeçalho

    // Verifica o estado atual de exibição do conteúdo e altera conforme necessário
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block'; // Exibe o conteúdo se estiver oculto
        icon.classList.remove('fa-chevron-down'); // Altera o ícone para indicar estado 'aberto'
        icon.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none'; // Oculta o conteúdo se estiver visível
        icon.classList.remove('fa-chevron-up'); // Altera o ícone para indicar estado 'fechado'
        icon.classList.add('fa-chevron-down');
    }
}
