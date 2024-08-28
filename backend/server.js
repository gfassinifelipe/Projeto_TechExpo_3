const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2024',
    database: 'cmo'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao tentar se conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Back-end conectado ao banco de dados');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'casadomicroondas.ofc@gmail.com',
        pass: 'xkir nrox cwks urkr'
    }
});

// Função para gerar código de verificação
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000);

// Objeto para armazenar códigos de verificação temporários
let tempVerificationCodes = {}; // Para armazenar os códigos temporários

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Rota para verificar se a API está funcionando
app.get('/', (req, res) => {
    res.send('API está funcionando');
});

// Rota para enviar código de verificação
app.post('/enviar-codigo', (req, res) => {
    const { email_cliente, cpf_cliente } = req.body;

    // Consulta SQL para verificar unicidade de CPF ou e-mail
    const sqlVerificar = 'SELECT * FROM cliente WHERE cpf_cliente = ? OR email_cliente = ?';
    db.query(sqlVerificar, [cpf_cliente, email_cliente], (err, results) => {
        if (err) {
            console.error('Erro ao verificar unicidade:', err);
            res.status(500).json({ message: 'Erro ao verificar unicidade' });
        } else if (results.length > 0) {
            // Verifica se CPF ou e-mail já estão cadastrados
            let message = '';
            if (results[0].cpf_cliente === cpf_cliente) {
                message = 'CPF já cadastrado.';
            } else if (results[0].email_cliente === email_cliente) {
                message = 'Email já cadastrado.';
            }
            res.status(409).json({ message });
        } else {
            // Gera um código de verificação
            const codigo_verificacao = generateVerificationCode();
            // Armazena o código de verificação temporariamente associado ao e-mail do cliente
            tempVerificationCodes[email_cliente] = {
                code: codigo_verificacao,
                expiry: Date.now() + 60000 // 1 minuto
            };

            // Configurações do e-mail a ser enviado
            const mailOptions = {
                from: 'casadomicroondas.ofc@gmail.com',
                to: email_cliente,
                subject: 'Código de Verificação',
                text: `Seu código de verificação é: ${codigo_verificacao}`
            };

            // Envia o e-mail com o código de verificação
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erro ao enviar e-mail:', error);
                    res.status(500).json({ message: 'Erro ao enviar e-mail' });
                } else {
                    console.log('E-mail enviado:', info.response);
                    res.status(200).json({ message: 'Código de verificação enviado com sucesso' });
                }
            });
        }
    });
});

// Rota para verificar código de verificação e registrar usuário
app.post('/verificar-codigo', (req, res) => {
    const { email_cliente, codigo_verificacao, nome_cliente, senha_cliente, cpf_cliente, telefone_cliente, data_de_nascimento_cliente } = req.body;

    // Verifica se há um código de verificação armazenado para o e-mail fornecido
    const storedCode = tempVerificationCodes[email_cliente];

    // Verifica a validade do código de verificação
    if (!storedCode || storedCode.code !== parseInt(codigo_verificacao) || storedCode.expiry < Date.now()) {
        return res.status(400).json({ message: 'Código de verificação inválido ou expirado' });
    }

    // SQL para inserir novo cliente no banco de dados
    const sql = 'INSERT INTO cliente (nome_cliente, email_cliente, senha_cliente, cpf_cliente, telefone_cliente, data_de_nascimento_cliente) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nome_cliente, email_cliente, senha_cliente, cpf_cliente, telefone_cliente, data_de_nascimento_cliente], (err, result) => {
        if (err) {
            console.error('Erro ao registrar usuário:', err);
            res.status(500).json({ message: 'Erro ao registrar usuário' });
        } else {
            res.status(200).json({ message: 'Usuário registrado com sucesso' });
        }
    });
});

// interceptor para verificar token de autenticação JWT
function verificarTokenAutenticacao(req, res, next) {
    // Obtém o cabeçalho de autorização
    const authHeader = req.headers['authorization'];
    // Extrai o token do cabeçalho
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token recebido:', token);
    
    // Verifica se o token foi fornecido
    if (!token) {
        return res.status(400).json({ message: 'Token não fornecido' });
    }

    // Verifica a validade do token utilizando JWT
    jwt.verify(token, 'seu-token-autenticador', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido' });
        }
        // Se o token for válido, adiciona o ID e o e-mail do usuário ao objeto de requisição (req)
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        next(); // Chama o próximo interceptor ou rota
    });
}

// Rota para verificar unicidade de CPF e Email
app.post('/verificar-unicidade', (req, res) => {
    const { cpf_cliente, email_cliente } = req.body;
    console.log('Verificando unicidade para CPF:', cpf_cliente, 'e Email:', email_cliente);

    // SQL para buscar clientes com o mesmo CPF ou Email no banco de dados
    const sql = 'SELECT * FROM cliente WHERE cpf_cliente = ? OR email_cliente = ?';
    db.query(sql, [cpf_cliente, email_cliente], (err, results) => {
        if (err) {
            console.error('Erro ao verificar unicidade:', err);
            res.status(500).json({ success: false, message: 'Erro ao verificar unicidade' });
        } else if (results.length > 0) {
            let message = '';
            // Verifica se CPF ou Email já estão cadastrados
            if (results[0].cpf_cliente === cpf_cliente) {
                message = 'CPF já cadastrado.';
            } else if (results[0].email_cliente === email_cliente) {
                message = 'Email já cadastrado.';
            }
            res.status(409).json({ success: false, message });
        } else {
            // Caso CPF e Email não estejam cadastrados, retorna sucesso
            res.status(200).json({ success: true, message: 'CPF e email disponíveis' });
        }
    });
});

// Rota para verificar endereço do cliente autenticado
app.get('/verificar-endereco', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId; // Obtém o ID do usuário autenticado a partir do interceptor verificarTokenAutenticacao

    // SQL para buscar o endereço associado ao ID do cliente no banco de dados
    const sql = 'SELECT * FROM endereco WHERE id_cliente = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao verificar endereço:', err);
            res.status(500).json({ message: 'Erro ao verificar endereço' });
        } else if (results.length > 0) {
            // Se um endereço for encontrado, retorna o endereço
            res.status(200).json({ endereco: results[0] });
        } else {
            // Caso nenhum endereço seja encontrado, retorna status 404
            res.status(404).json({ message: 'Endereço não encontrado' });
        }
    });
});

// Rota para salvar endereço do cliente autenticado
app.post('/salvar-endereco', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId; // Obtém o ID do usuário autenticado a partir do interceptor verificarTokenAutenticacao
    const { endereco, complemento, bairro, numero, cidade, estado, cep, observacao } = req.body;

    // SQL para inserir um novo endereço no banco de dados
    const sqlInsert = 'INSERT INTO endereco (endereco, complemento, bairro, numero, cidade, estado, cep, observacao, id_cliente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sqlInsert, [endereco, complemento, bairro, numero, cidade, estado, cep, observacao, userId], (err, result) => {
        if (err) {
            console.error('Erro ao salvar endereço:', err);
            res.status(500).json({ message: 'Erro ao salvar endereço' });
        } else {
            const enderecoId = result.insertId;

            // Atualiza o cliente com o ID do endereço inserido
            const sqlUpdateCliente = 'UPDATE cliente SET id_endereco = ? WHERE id_cliente = ?';
            db.query(sqlUpdateCliente, [enderecoId, userId], (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar cliente com endereço:', err);
                    res.status(500).json({ message: 'Erro ao atualizar cliente com endereço' });
                } else {
                    res.status(200).json({ message: 'Endereço salvo com sucesso' });
                }
            });
        }
    });
});

// Rota para cadastro de novo cliente
app.post('/cadastro', (req, res) => {
    const { nome_cliente, email_cliente, senha_cliente, cpf_cliente, telefone_cliente, data_de_nascimento_cliente } = req.body;

    // Verifica se o CPF ou Email já estão cadastrados no banco de dados
    const sqlVerificar = 'SELECT * FROM cliente WHERE cpf_cliente = ? OR email_cliente = ?';
    db.query(sqlVerificar, [cpf_cliente, email_cliente], (err, results) => {
        if (err) {
            console.error('Erro ao verificar unicidade:', err);
            res.status(500).json({ message: 'Erro ao verificar unicidade' });
        } else if (results.length > 0) {
            let message = '';
            // Define mensagem de erro adequada se CPF ou Email já estiverem cadastrados
            if (results[0].cpf_cliente === cpf_cliente) {
                message = 'CPF já cadastrado.';
            } else if (results[0].email_cliente === email_cliente) {
                message = 'Email já cadastrado.';
            }
            res.status(409).json({ message });
        } else {
            // Insere novo cliente no banco de dados
            const sql = 'INSERT INTO cliente (nome_cliente, email_cliente, senha_cliente, cpf_cliente, telefone_cliente, data_de_nascimento_cliente) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sql, [nome_cliente, email_cliente, senha_cliente, cpf_cliente, telefone_cliente, data_de_nascimento_cliente], (err, result) => {
                if (err) {
                    console.error('Erro ao registrar usuário:', err);
                    res.status(500).json({ message: 'Erro ao registrar usuário' });
                } else {
                    // Gera um token JWT para o novo usuário registrado
                    const token = jwt.sign({ id: result.insertId, nome: nome_cliente, email: email_cliente }, 'seu-token-autenticador', { expiresIn: '1h' });
                    res.status(200).json({ message: 'Usuário registrado com sucesso', token });
                }
            });
        }
    });
});

// Rota para login de administrador ou cliente
app.post('/login', (req, res) => {
    const { email_cliente, senha_cliente } = req.body;

    // Verifica se é admin
    const sqlAdmin = 'SELECT id_adm, nome_adm, email_adm FROM adm WHERE email_adm = ? AND senha_adm = ?';
    db.query(sqlAdmin, [email_cliente, senha_cliente], (err, adminResults) => {
        if (err) {
            console.error('Erro ao fazer login (admin):', err);
            res.status(500).json({ message: 'Erro ao fazer login' });
        } else if (adminResults.length > 0) {
            const admin = adminResults[0];
            const token = jwt.sign({ id: admin.id_adm, email: admin.email_adm }, 'seu-token-autenticador', { expiresIn: '1h' });
            res.status(200).json({ message: 'Login bem-sucedido', token, nome_cliente: admin.nome_adm, isAdmin: true });
        } else {
            // Verifica se é cliente
            const sqlCliente = 'SELECT id_cliente, nome_cliente, email_cliente FROM cliente WHERE email_cliente = ? AND senha_cliente = ?';
            db.query(sqlCliente, [email_cliente, senha_cliente], (err, clientResults) => {
                if (err) {
                    console.error('Erro ao fazer login (cliente):', err);
                    res.status(500).json({ message: 'Erro ao fazer login' });
                } else if (clientResults.length > 0) {
                    const cliente = clientResults[0];
                    const token = jwt.sign({ id: cliente.id_cliente, email: cliente.email_cliente }, 'seu-token-autenticador', { expiresIn: '1h' });
                    res.status(200).json({ message: 'Login bem-sucedido', token, nome_cliente: cliente.nome_cliente, isAdmin: false });
                } else {
                    res.status(401).json({ message: 'Credenciais inválidas' });
                }
            });
        }
    });
});

// Rota para recuperação de senha
app.post('/esqueci-senha', (req, res) => {
    const { email_cliente } = req.body;

    // Consulta a senha do cliente baseado no email fornecido
    const sql = 'SELECT senha_cliente FROM cliente WHERE email_cliente = ?';
    db.query(sql, [email_cliente], (err, results) => {
        if (err) {
            console.error('Erro ao buscar senha:', err);
            res.status(500).json({ success: false, message: 'Erro ao buscar senha' });
        } else if (results.length > 0) {
            const senhaCliente = results[0].senha_cliente;

            // Configurações para enviar a senha por email
            const mailOptions = {
                from: 'casadomicroondas.ofc@gmail.com',
                to: email_cliente,
                subject: 'Recuperação de Senha',
                text: `Sua senha é: ${senhaCliente}`
            };

            // Envio do email com a senha
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erro ao enviar e-mail:', error);
                    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail' });
                } else {
                    console.log('E-mail enviado:', info.response);
                    res.status(200).json({ success: true, message: 'Senha enviada para seu email' });
                }
            });
        } else {
            // Caso o email não exista no banco de dados
            res.status(404).json({
                success: false,
                message: 'Email não existe no nosso banco de dados. Verifique o email inserido e tente novamente'
            });
        }
    });
});

// Rota para verificar token de autenticação
app.post('/verificar-token', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId;
    const userEmail = req.userEmail;

    // Verifica se é admin
    const sqlAdmin = 'SELECT nome_adm FROM adm WHERE email_adm = ?';
    db.query(sqlAdmin, [userEmail], (err, adminResults) => {
        if (err) {
            console.error('Erro ao verificar token:', err);
            res.status(500).json({ message: 'Erro ao verificar token' });
        } else if (adminResults.length > 0) {
            // Se for admin, retorna o nome e define isAdmin como true
            res.status(200).json({ nome_cliente: adminResults[0].nome_adm, isAdmin: true });
        } else {
            // Se não for admin, busca o nome do cliente baseado no userId
            const sql = 'SELECT nome_cliente FROM cliente WHERE id_cliente = ?';
            db.query(sql, [userId], (err, results) => {
                if (err) {
                    console.error('Erro ao verificar token:', err);
                    res.status(500).json({ message: 'Erro ao verificar token' });
                } else if (results.length > 0) {
                    // Retorna o nome do cliente e define isAdmin como false
                    res.status(200).json({ nome_cliente: results[0].nome_cliente, isAdmin: false });
                } else {
                    // Se o userId não corresponder a nenhum cliente, retorna erro 401
                    res.status(401).json({ message: 'Usuário não encontrado' });
                }
            });
        }
    });
});

// Rota para obter perfil do cliente
app.get('/obter-perfil', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId;
    const sql = 'SELECT nome_cliente, cpf_cliente, email_cliente, telefone_cliente, data_de_nascimento_cliente FROM cliente WHERE id_cliente = ?';

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao obter perfil:', err);
            res.status(500).json({ success: false, message: 'Erro ao obter perfil' });
        } else {
            // Se a consulta for bem-sucedida, retorna os dados do cliente
            res.status(200).json({ success: true, cliente: results[0] });
        }
    });
});

// Rota para atualizar perfil do cliente
app.post('/atualizar-perfil', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId;
    const { nome_cliente, telefone_cliente, senha_cliente } = req.body;
    const sql = 'UPDATE cliente SET nome_cliente = ?, telefone_cliente = ?, senha_cliente = ? WHERE id_cliente = ?';

    db.query(sql, [nome_cliente, telefone_cliente, senha_cliente, userId], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar perfil:', err);
            res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
        } else {
            res.status(200).json({ success: true, message: 'Perfil atualizado com sucesso' });
        }
    });
});

// Rota para atualizar senha do cliente
app.post('/atualizar-senha', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId;
    const { senha_atual, nova_senha_cliente } = req.body;

    // Primeiro, verificar se a senha atual está correta
    const sqlVerificarSenha = 'SELECT senha_cliente FROM cliente WHERE id_cliente = ?';
    db.query(sqlVerificarSenha, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao verificar senha atual:', err);
            return res.status(500).json({ message: 'Erro ao verificar senha atual' });
        }

        if (results.length > 0 && results[0].senha_cliente === senha_atual) {
            // Se a senha atual estiver correta, atualizar para a nova senha
            const sqlAtualizarSenha = 'UPDATE cliente SET senha_cliente = ? WHERE id_cliente = ?';
            db.query(sqlAtualizarSenha, [nova_senha_cliente, userId], (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar senha:', err);
                    return res.status(500).json({ message: 'Erro ao atualizar senha' });
                }

                return res.status(200).json({ message: 'Senha atualizada com sucesso' });
            });
        } else {
            return res.status(400).json({ message: 'Senha atual incorreta' });
        }
    });
});

// Rota para excluir conta do cliente
app.delete('/excluir-conta', verificarTokenAutenticacao, (req, res) => {
    const userId = req.userId;
    const sqlEndereco = 'DELETE FROM endereco WHERE id_cliente = ?';
    const sqlCliente = 'DELETE FROM cliente WHERE id_cliente = ?';

    db.query(sqlEndereco, [userId], (err, result) => {
        if (err) {
            console.error('Erro ao excluir endereço:', err);
            res.status(500).json({ success: false, message: 'Erro ao excluir endereço' });
        } else {
            // Após excluir o endereço, exclui o cliente
            db.query(sqlCliente, [userId], (err, result) => {
                if (err) {
                    console.error('Erro ao excluir conta:', err);
                    res.status(500).json({ success: false, message: 'Erro ao excluir conta' });
                } else {
                    res.status(200).json({ success: true, message: 'Conta excluída com sucesso' });
                }
            });
        }
    });
});

// interceptor para verificar permissão de administrador
const checkAdminPermission = (req, res, next) => {
    // Verifica se o email do usuário é o administrador autorizado
    if (req.userEmail !== 'administrador@cmo.com.br') {
        return res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
    }
    next(); // Passa para o próximo interceptor ou rota se o usuário for administrador
};

// Rota para obter todas as marcas
app.get('/marcas', (req, res) => {
    const sql = 'SELECT id_marcas AS id, titulo_marca AS titulo, img_marca AS img, url_marca AS `desc` FROM marcas';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao obter marcas:', err);
            res.status(500).json({ success: false, message: 'Erro ao obter marcas' });
        } else {
            res.status(200).json({ success: true, items: results });
        }
    });
});

// Rota para obter todos os produtos
app.get('/produtos', (req, res) => {
    const sql = 'SELECT id_produto AS id, titulo_produto AS titulo, img_produto AS img, desc_produto AS `desc` FROM produto';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao obter produtos:', err);
            res.status(500).json({ success: false, message: 'Erro ao obter produtos' });
        } else {
            res.status(200).json({ success: true, items: results });
        }
    });
});

// Rota para obter todos os serviços de mão de obra
app.get('/mao-de-obra', (req, res) => {
    const sql = 'SELECT id_mao_de_obra AS id, titulo_mao_de_obra AS titulo, img_mao_de_obra AS img, desc_mao_de_obra AS `desc` FROM mao_de_obra';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao obter mão de obra:', err);
            res.status(500).json({ success: false, message: 'Erro ao obter mão de obra' });
        } else {
            res.status(200).json({ success: true, items: results });
        }
    });
});

// Rota para adicionar uma nova marca (requer autenticação e permissão de administrador)
app.post('/adicionar-marca', verificarTokenAutenticacao, checkAdminPermission, (req, res) => {
    const { titulo, img, url } = req.body;
    const sql = 'INSERT INTO marcas (titulo_marca, img_marca, url_marca) VALUES (?, ?, ?)';
    db.query(sql, [titulo, img, url], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar marca:', err);
            res.status(500).json({ success: false, message: 'Erro ao adicionar marca' });
        } else {
            res.status(200).json({ success: true, message: 'Marca adicionada com sucesso' });
        }
    });
});

// Rota para adicionar um novo produto (requer autenticação e permissão de administrador)
app.post('/adicionar-produto', verificarTokenAutenticacao, checkAdminPermission, (req, res) => {
    const { titulo, img, desc } = req.body;
    const sql = 'INSERT INTO produto (titulo_produto, img_produto, desc_produto) VALUES (?, ?, ?)';
    db.query(sql, [titulo, img, desc], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar produto:', err);
            res.status(500).json({ success: false, message: 'Erro ao adicionar produto' });
        } else {
            res.status(200).json({ success: true, message: 'Produto adicionado com sucesso' });
        }
    });
});

// Rota para adicionar um novo serviço (requer autenticação e permissão de administrador)
app.post('/adicionar-servico', verificarTokenAutenticacao, checkAdminPermission, (req, res) => {
    const { titulo, img, desc } = req.body;
    const sql = 'INSERT INTO mao_de_obra (titulo_mao_de_obra, img_mao_de_obra, desc_mao_de_obra) VALUES (?, ?, ?)';
    db.query(sql, [titulo, img, desc], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar serviço:', err);
            res.status(500).json({ success: false, message: 'Erro ao adicionar serviço' });
        } else {
            res.status(200).json({ success: true, message: 'Serviço adicionado com sucesso' });
        }
    });
});

// Rota para upload de imagem
app.post('/upload-imagem', upload.single('imagem'), (req, res) => {
    // Verifica se foi enviada uma imagem
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Erro ao fazer upload da imagem' });
    }
    // Retorna o caminho da imagem após o upload bem-sucedido
    res.status(200).json({ success: true, message: 'Imagem uploadada com sucesso', path: req.file.path });
});

app.listen(3002, () => {
    console.log('Servidor rodando na porta 3002');
});
