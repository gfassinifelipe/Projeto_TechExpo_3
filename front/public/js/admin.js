// Aguarda o carregamento completo do documento HTML
document.addEventListener('DOMContentLoaded', () => {
    // Elementos da interface do modal e da lista de itens
    const modal = document.getElementById('janela-modal');
    const modalItens = document.getElementById('janela-modal-itens');
    const fecharModal = document.getElementById('fechar');
    const fecharModalItens = document.getElementById('fechar-itens');
    const tituloModal = document.getElementById('titulo-modal');
    const formModal = document.getElementById('formulario-adicionar');
    const listaItens = document.getElementById('lista-itens');

    // Obtém o token de autorização do armazenamento local
    const token = localStorage.getItem('token');
    let acaoAtual = ''; // Variável para armazenar a ação atual do usuário

    // Função para abrir o modal com base no tipo de ação
    function abrirModal(tipo) {
        modal.classList.add('abrir');
        switch (tipo) {
            case 'AdicionarMarca':
                tituloModal.innerText = 'Adicionar Marca';
                document.getElementById('campo-url').style.display = 'block';
                document.getElementById('campo-desc').style.display = 'none';
                formModal.onsubmit = (e) => adicionarItem(e, 'marca');
                break;
            case 'AdicionarProduto':
                tituloModal.innerText = 'Adicionar Produto';
                document.getElementById('campo-url').style.display = 'none';
                document.getElementById('campo-desc').style.display = 'block';
                formModal.onsubmit = (e) => adicionarItem(e, 'produto');
                break;
            case 'AdicionarServico':
                tituloModal.innerText = 'Adicionar Serviço';
                document.getElementById('campo-url').style.display = 'none';
                document.getElementById('campo-desc').style.display = 'block';
                formModal.onsubmit = (e) => adicionarItem(e, 'servico');
                break;
            default:
                break;
        }
    }

    // Listener para fechar o modal principal
    fecharModal.addEventListener('click', () => {
        modal.classList.remove('abrir');
    });

    // Listener para fechar o modal de itens
    fecharModalItens.addEventListener('click', () => {
        modalItens.classList.remove('abrir');
    });

    // Função para mostrar as opções disponíveis para ação (Editar, Excluir)
    function mostrarOpcoes(acao) {
        acaoAtual = acao;
        document.getElementById('opcoes-container').style.display = 'block';
    }

    // Função assíncrona para carregar e exibir itens (marcas, produtos, serviços)
    async function mostrarItens(tipo) {
        let apiUrl = '';
        let titulo = '';
        switch (tipo) {
            case 'marcas':
                apiUrl = 'http://localhost:3002/marcas';
                titulo = 'Marcas';
                break;
            case 'produtos':
                apiUrl = 'http://localhost:3002/produtos';
                titulo = 'Produtos';
                break;
            case 'servicos':
                apiUrl = 'http://localhost:3002/mao-de-obra';
                titulo = 'Serviços';
                break;
        }
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Inclui o token de autorização no cabeçalho
                }
            });
            const data = await response.json();
            if (data.success) {
                listaItens.innerHTML = '';
                data.items.forEach(item => {
                    // Cria elementos HTML para cada item
                    const itemElem = document.createElement('div');
                    itemElem.classList.add('item');
                    itemElem.innerHTML = `
                        <div class="item-content">
                            <button onclick="selecionarItem('${item.id}', '${item.titulo}', '${item.desc}', '${item.img}', '${tipo}')">
                                <img src="${item.img}" alt="${item.titulo}">
                                <span>${item.titulo}</span>
                            </button>
                        </div>
                    `;
                    listaItens.appendChild(itemElem); // Adiciona o item à lista
                });
                // Atualiza o título do modal de itens e o exibe
                document.getElementById('titulo-modal-itens').innerText = `Selecione um ${titulo} para ${acaoAtual}`;
                modalItens.classList.add('abrir');
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    // Função assíncrona para selecionar um item para editar ou excluir
    async function selecionarItem(id, titulo, desc, img, tipo) {
        if (acaoAtual === 'Editar') {
            abrirModalEdicao(id, titulo, desc, img, tipo); // Abre o modal de edição
        } else if (acaoAtual === 'Excluir') {
            excluirItem(id, tipo); // Exclui o item
        }
    }

    // Função para abrir o modal de edição com os dados do item selecionado
    function abrirModalEdicao(id, titulo, desc, img, tipo) {
        modal.classList.add('abrir');
        tituloModal.innerText = 'Editar ' + tipo.charAt(0).toUpperCase() + tipo.slice(1);
        document.getElementById('titulo').value = titulo;
        document.getElementById('descricao').value = desc;
        document.getElementById('imagem').style.display = 'none'; // Esconde o campo de imagem
        formModal.onsubmit = (e) => editarItem(e, id, tipo);
    }

    // Função assíncrona para enviar os dados atualizados do item para edição
    async function editarItem(event, id, tipo) {
        event.preventDefault();
        
        const titulo = document.getElementById('titulo').value;
        const descricao = document.getElementById('descricao').value;

        let apiUrl = '';
        // Define a URL de edição com base no tipo de item
        if (tipo === 'marcas') apiUrl = `http://localhost:3002/editar-marca/${id}`;
        if (tipo === 'produtos') apiUrl = `http://localhost:3002/editar-produto/${id}`;
        if (tipo === 'servicos') apiUrl = `http://localhost:3002/editar-servico/${id}`;

        const bodyData = { titulo, desc: descricao };

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', // Tipo de conteúdo JSON
                    'Authorization': `Bearer ${token}` // Token de autorização
                },
                body: JSON.stringify(bodyData) // Converte dados para JSON e envia no corpo da requisição
            });
            const data = await response.json(); // Aguarda a resposta JSON do servidor
            if (data.success) {
                alert(data.message); // Exibe mensagem de sucesso
                modal.classList.remove('abrir'); // Fecha o modal de edição
                formModal.reset(); // Limpa o formulário
                location.reload(); // Recarrega a página para mostrar o item atualizado
            } else {
                alert('Erro ao editar item.'); // Exibe mensagem de erro
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    // Função para excluir um item
    async function excluirItem(id, tipo) {
        const token = localStorage.getItem('token'); // Obtém o token de autorização
        let apiUrl = '';
        // Define a URL de exclusão com base no tipo de item
        if (tipo === 'marcas') apiUrl = `http://localhost:3002/excluir-marca/${id}`;
        if (tipo === 'produtos') apiUrl = `http://localhost:3002/excluir-produto/${id}`;
        if (tipo === 'servicos') apiUrl = `http://localhost:3002/excluir-servico/${id}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Inclui o token de autorização no cabeçalho
                }
            });
            const data = await response.json(); // Aguarda a resposta JSON do servidor
            if (data.success) {
                alert(data.message); // Exibe mensagem de sucesso
                location.reload(); // Recarrega a página para atualizar a lista de itens
            } else {
                alert('Erro ao excluir item.'); // Exibe mensagem de erro
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    // Torna as funções globais para serem acessadas pelo HTML
    window.abrirModal = abrirModal;
    window.mostrarOpcoes = mostrarOpcoes;
    window.mostrarItens = mostrarItens;
    window.selecionarItem = selecionarItem;
});
