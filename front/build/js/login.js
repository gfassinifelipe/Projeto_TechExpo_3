document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formulario-de-login');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email_cliente = document.getElementById('email_cliente').value;
            const senha_cliente = document.getElementById('senha_cliente').value;

            fetch('http://localhost:3002/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email_cliente,
                    senha_cliente
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Login bem-sucedido') {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('nome_usuario', data.nome_cliente);
                        alert(data.message);
                        window.location.href = 'index.html';
                    } else {
                        alert(data.message);
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                });
        });
    } else {
        console.error('Elemento formulario-de-login não encontrado');
    }
});
