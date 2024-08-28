document.getElementById('fomulario-de-cadastro').addEventListener('submit', (e) => {
    e.preventDefault();

    const nome_cliente = document.getElementById('nome_cliente').value;
    const email_cliente = document.getElementById('email_cliente').value;
    const senha_cliente = document.getElementById('senha_cliente').value;
    const cpf_cliente = document.getElementById('cpf_cliente').value;
    const telefone_cliente = document.getElementById('telefone_cliente').value;
    const data_de_nascimento_cliente = document.getElementById('data_de_nascimento_cliente').value;
    const token = document.getElementById('token-de-registro').value;

    fetch('http://localhost:3002/cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome_cliente,
            email_cliente,
            senha_cliente,
            cpf_cliente,
            telefone_cliente,
            data_de_nascimento_cliente,
            token
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById('fomulario-de-cadastro').addEventListener('submit', function(event) {
    var senha = document.getElementById('senha_cliente').value;
    var confirmarSenha = document.getElementById('confirmar_senha_cliente').value;
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        event.preventDefault();
    }
});

document.getElementById('cpf_cliente').addEventListener('input', function(event) {
    var value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3) + '.' + value.slice(3);
    if (value.length > 7) value = value.slice(0, 7) + '.' + value.slice(7);
    if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11, 13);
    event.target.value = value;
});

document.getElementById('telefone_cliente').addEventListener('input', function(event) {
    var value = event.target.value.replace(/\D/g, '');
    if (value.length > 2) value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
    if (value.length > 10) value = value.slice(0, 9) + '-' + value.slice(9);
    event.target.value = value;
});