DROP SCHEMA IF EXISTS cmo;
CREATE SCHEMA cmo;
USE cmo;

-- Estrutura da tabela admin
DROP TABLE IF EXISTS admin;
CREATE TABLE adm (
  PRIMARY KEY (id_adm),
  id_adm int NOT NULL AUTO_INCREMENT,
  nome_adm varchar(200) NOT NULL,
  email_adm varchar(200) NOT NULL,
  senha_adm varchar(30) NOT NULL
);

-- Estrutura da tabela cliente
DROP TABLE IF EXISTS cliente;
CREATE TABLE cliente (
  PRIMARY KEY (id_cliente),
  id_cliente int NOT NULL AUTO_INCREMENT,
  nome_cliente varchar(200) NOT NULL,
  cpf_cliente varchar(14) NOT NULL,
  telefone_cliente varchar(20) NOT NULL,
  data_de_nascimento_cliente date NOT NULL,
  email_cliente varchar(200) NOT NULL,
  senha_cliente varchar(30) NOT NULL,
  id_endereco int
);

-- Estrutura da tabela endereco
DROP TABLE IF EXISTS endereco;
CREATE TABLE endereco (
  PRIMARY KEY (id_endereco),
  id_endereco int NOT NULL AUTO_INCREMENT,
  endereco varchar(300) NOT NULL,
  complemento varchar(100),
  bairro varchar(100) NOT NULL,
  numero varchar(10) NOT NULL,
  cidade varchar(100) NOT NULL,
  estado varchar(60) NOT NULL,
  cep varchar(10) NOT NULL,
  observacao varchar(200),
  id_loja int,
  id_cliente int
);

-- Estrutura da tabela loja
DROP TABLE IF EXISTS loja;
CREATE TABLE loja (
  PRIMARY KEY (id_loja),
  id_loja int NOT NULL AUTO_INCREMENT,
  telefone_loja varchar(20) NOT NULL,
  id_endereco int NOT NULL
);

-- Estrutura da tabela mao_de_obra
DROP TABLE IF EXISTS mao_de_obra;
CREATE TABLE mao_de_obra (
  PRIMARY KEY (id_mao_de_obra),
  id_mao_de_obra int NOT NULL AUTO_INCREMENT,
  titulo_mao_de_obra varchar(200),
  img_mao_de_obra varchar(100),
  desc_mao_de_obra varchar(500)
);

-- Estrutura da tabela marcas
DROP TABLE IF EXISTS marcas;
CREATE TABLE marcas (
  PRIMARY KEY (id_marcas),
  id_marcas int NOT NULL AUTO_INCREMENT,
  titulo_marca varchar(100) NOT NULL,
  img_marca varchar(100),
  url_marca varchar(100)
);

-- Estrutura da tabela produto
DROP TABLE IF EXISTS produto;
CREATE TABLE produto (
  PRIMARY KEY (id_produto),
  id_produto int NOT NULL AUTO_INCREMENT,
  titulo_produto varchar(100) NOT NULL,
  img_produto varchar(100) NOT NULL,
  desc_produto varchar(200) NOT NULL
);



-- FOREIGN KEYS

ALTER TABLE cliente
  ADD CONSTRAINT FK_cliente_endereco FOREIGN KEY (id_endereco) REFERENCES endereco (id_endereco);

ALTER TABLE endereco
  ADD CONSTRAINT FK_endereco_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente),
  ADD CONSTRAINT FK_endereco_loja FOREIGN KEY (id_loja) REFERENCES loja (id_loja);

ALTER TABLE loja
  ADD CONSTRAINT FK_loja_endereco FOREIGN KEY (id_endereco) REFERENCES endereco (id_endereco);



-- INSERTS NECESSÁRIOS

INSERT INTO marcas (titulo_marca, img_marca, url_marca) VALUES
('Brastemp', 'img_marcas/brastemp_logo.png', 'https://www.brastemp.com.br'),
('CCE', 'img_marcas/cce_logo.png', 'https://www.cce.com.br'),
('Consul', 'img_marcas/consul_logo.png', 'https://www.consul.com.br'),
('Electrolux', 'img_marcas/electrolux_logo.png', 'https://www.electrolux.com.br'),
('Fischer', 'img_marcas/fischer_logo.png', 'https://www.fischer.com.br'),
('LG', 'img_marcas/lg_logo.png', 'https://www.lg.com/br'),
('Midea', 'img_marcas/midea_logo.png', 'https://www.midea.com.br'),
('Panasonic', 'img_marcas/panasonic_logo.png', 'https://www.panasonic.com/br'),
('Philco', 'img_marcas/philco_logo.png', 'https://www.philco.com.br'),
('Samsung', 'img_marcas/samsung_logo.png', 'https://www.samsung.com/br'),
('Sanyo', 'img_marcas/sanyo_logo.png', 'https://www.sanyo.com.br'),
('Sharp', 'img_marcas/sharp_logo.png', 'https://www.sharp.com.br');

INSERT INTO adm (nome_adm, email_adm, senha_adm) VALUES
('Administrador', 'administrador@cmo.com.br', 'uniandrade2024');

INSERT INTO mao_de_obra (titulo_mao_de_obra, img_mao_de_obra, desc_mao_de_obra)
VALUES
('Reparo de Resistência de Microondas', 'img_mao_de_obra/mao_de_obra_1.png', 'Substituição e reparo da resistência interna do microondas para garantir o aquecimento correto dos alimentos.'),
('Troca de Placa Eletrônica de Air Fryer', 'img_mao_de_obra/mao_de_obra_2.png', 'Serviço de substituição da placa eletrônica danificada da Air Fryer para restaurar seu funcionamento.'),
('Reparo de Sistema de Ignição de Cooktop', 'img_mao_de_obra/mao_de_obra_3.png', 'Correção de falhas no sistema de ignição de cooktops, garantindo a segurança e eficiência do aparelho.'),
('Manutenção de Timer de Forno Elétrico', 'img_mao_de_obra/mao_de_obra_4.png', 'Ajuste e reparo do timer de fornos elétricos para garantir a precisão no tempo de cozimento.'),
('Substituição de Porta de Microondas', 'img_mao_de_obra/mao_de_obra_5.png', 'Troca de portas danificadas de microondas, incluindo vedação e alinhamento correto.'),
('Reparo de Motor de Air Fryer', 'img_mao_de_obra/mao_de_obra_6.png', 'Serviço de manutenção e substituição do motor interno de Air Fryer para restaurar sua eficiência.'),
('Ajuste de Chama de Cooktop', 'img_mao_de_obra/mao_de_obra_7.png', 'Regulagem da intensidade da chama de cooktops, assegurando um funcionamento seguro e eficiente.'),
('Troca de Elemento de Aquecimento de Forno Elétrico', 'img_mao_de_obra/mao_de_obra_8.png', 'Substituição do elemento de aquecimento do forno elétrico para garantir o cozimento uniforme dos alimentos.'),
('Reparo de Painel de Controle de Microondas', 'img_mao_de_obra/mao_de_obra_9.png', 'Serviço de reparo do painel de controle do microondas, incluindo botões e display digital.'),
('Limpeza Profunda de Air Fryer', 'img_mao_de_obra/mao_de_obra_10.png', 'Serviço de limpeza completa da Air Fryer, removendo resíduos de alimentos e gordura acumulada para manter a higiene e desempenho do aparelho.');

INSERT INTO produto (titulo_produto, img_produto, desc_produto)
VALUES
('Air Fryer', 'img_produtos/airfryer.png', 'Temos suporte para concerto de Air Fryer'),
('Cooktop', 'img_produtos/cooktop.png', 'Temos suporte para concerto de Cooktop'),
('Microondas', 'img_produtos/microondas.png', 'Temos suporte para concerto de Microondas'),
('Forno Elétrico', 'img_produtos/fornoeletrico.png', 'Temos suporte para concerto de Forno Elétrico');
