
# Target Avaliações - Documentação da Plataforma

Este documento fornece informações sobre as funcionalidades da plataforma Target Avaliações.

## Visão Geral das Funcionalidades

A plataforma inclui um painel administrativo abrangente com os seguintes recursos:

### 🧑‍💼 Painel Administrativo (Backoffice Interno):

* Área protegida com login exclusivo para membros da equipe da plataforma
* Lista de todos os restaurantes registrados com:
  * Nome do restaurante
  * Nome do gerente
  * Status do plano (ativo, expirado, teste, cancelado)
  * Número de garçons ativos
  * Total de avaliações e cliques
* Edição manual de dados do restaurante (nome, link de avaliação, plano)
* Visualizar lista de garçons com contagens de cliques individuais

### 🧾 Exportação e Relatórios:

* Exportar dados mensais em CSV:
  * Cliques por garçom
  * Ranking mensal
  * Evolução das avaliações
* Geração de PDF para envio automático aos proprietários de restaurantes

### 🧩 Acessibilidade:

* Textos com alto contraste e fontes acessíveis
* Suporte a leitores de tela (aria-labels em botões e gráficos)
* Responsividade completa: mobile, tablet, desktop

### ⚡ Performance:

* Carregamento rápido com cache local para dashboards
* Paginação em listas longas de garçons e avaliações
* Indexação de links e código QR para evitar duplicação

### 🔐 Segurança:

* Tokens únicos por garçom com data de expiração configurável
* Proteção contra spam/crawlers em links de redirecionamento
* Logs de acesso ao painel administrativo e para cada clique em links

### 📂 Backup:

* Backup automático diário de dados no Supabase Storage
* Opção de restauração manual via painel administrativo

## Como Acessar o Painel Administrativo

1. Crie um usuário administrador (obrigatório antes do primeiro login)
2. Acesse a página de login de administrador em: `/admin/login`
3. Insira seu e-mail e senha de administrador

## Criando Seu Primeiro Usuário Administrador

Para criar o primeiro usuário administrador, você precisa chamar a Edge Function create-admin com os seguintes parâmetros:

```json
{
  "email": "seu-email-admin@exemplo.com",
  "name": "Seu Nome",
  "adminKey": "sua-chave-de-criação-admin"
}
```

Você precisa definir a chave secreta `ADMIN_CREATION_KEY` nas configurações do seu projeto Supabase para proteger esse processo.

## Seções do Administrador

- **Dashboard**: Visão geral das métricas principais
- **Restaurantes**: Gerenciar todos os restaurantes
- **Exportações**: Gerar e baixar relatórios
- **Backups**: Gerenciar backups do sistema
- **Configurações**: Configurar parâmetros do sistema

## Navegador Recomendado

Para a melhor experiência, recomendamos usar a versão mais recente do Chrome, Firefox ou Safari.

## Suporte

Se precisar de assistência, entre em contato com a equipe de desenvolvimento em suporte@targetavaliacoes.com.
