# Backlog do Projeto — Sistema de Gerenciamento de Pedidos de Restaurante

Este backlog foi derivado exclusivamente da especificação técnica oficial (`spec.md`).

---

## 1. Requisitos Funcionais (RF)

### Módulo: Landing Page (Pré-Login)
- [ ] **RF-01**: A landing page deve exibir uma sequência de slides automáticos e rotativos destacando pratos do cardápio. (Prioridade: Alta)
- [ ] **RF-02**: Cada slide deve conter imagem, nome e breve descrição do prato em destaque. (Prioridade: Alta)
- [ ] **RF-03**: A landing page deve possuir botões de acesso para "Fazer Pedido" (redireciona para login de cliente/mesa) e "Área do Funcionário" (redireciona para login de funcionário). (Prioridade: Alta)
- [ ] **RF-04**: O cardápio completo deve estar visível na landing page com nome, descrição, preço, imagem e indicador de disponibilidade de cada prato. (Prioridade: Alta)

### Módulo: Autenticação e Contas
- [ ] **RF-05**: O sistema deve possuir tela de login separada para Clientes (mesas) e Funcionários. (Prioridade: Alta)
- [ ] **RF-06**: Cada mesa do restaurante terá um login próprio, criado exclusivamente pelo Gerente. Não haverá auto-cadastro de clientes. (Prioridade: Alta)
- [ ] **RF-07**: O login de mesa será composto por identificador da mesa (ex: "Mesa 05") e senha definida pelo Gerente. (Prioridade: Alta)
- [ ] **RF-08**: Funcionários devem fazer login com usuário e senha cadastrados pelo Gerente. (Prioridade: Alta)
- [ ] **RF-09**: O sistema deve diferenciar o perfil do usuário após o login e redirecionar para a dashboard correspondente. (Prioridade: Alta)
- [ ] **RF-10**: Gerentes devem ter acesso a uma tela de gerenciamento de contas de mesas, podendo criar, editar (nome da mesa, senha) e inativar/reativar contas. (Prioridade: Alta)
- [ ] **RF-11**: Gerentes devem ter acesso a uma tela de gerenciamento de contas de funcionários, podendo criar, editar (nome, usuário, senha, perfil) e inativar/reativar contas. (Prioridade: Alta)

### Módulo: Cardápio e Pedidos
- [ ] **RF-12**: O cliente deve visualizar o cardápio completo com nome, descrição, preço, imagem e status de disponibilidade de cada prato. (Prioridade: Alta)
- [ ] **RF-13**: O sistema deve calcular automaticamente a disponibilidade de cada prato com base nos ingredientes necessários e na quantidade em estoque. (Prioridade: Alta)
- [ ] **RF-14**: Pratos indisponíveis devem aparecer no cardápio com indicador visual claro (ex: cinza, badge "Indisponível") e não podem ser adicionados ao carrinho. (Prioridade: Alta)
- [ ] **RF-15**: O cliente deve poder selecionar pratos disponíveis, definir quantidades e adicionar ao carrinho. (Prioridade: Alta)
- [ ] **RF-16**: O cliente só pode finalizar um pedido se estiver logado com uma conta de mesa válida. (Prioridade: Alta)
- [ ] **RF-17**: Ao confirmar um pedido, o sistema deve reduzir automaticamente do estoque a quantidade de ingredientes consumidos. (Prioridade: Alta)
- [ ] **RF-18**: O cliente deve ter acesso a um histórico dos pedidos realizados por sua mesa, com data/hora, itens, quantidades e valor total. (Prioridade: Média)
- [ ] **RF-19**: Funcionários devem visualizar todos os pedidos ativos em tempo real, com detalhes da mesa, itens, status e valor total. (Prioridade: Alta)
- [ ] **RF-20**: Funcionários devem poder atualizar o status dos pedidos ("Recebido", "Em preparo", "Pronto", "Entregue", "Cancelado"). (Prioridade: Alta)

### Módulo: Estoque
- [ ] **RF-21**: Gerentes devem ter uma tela de controle de estoque listando todos os ingredientes com nome e quantidade atual. (Prioridade: Alta)
- [ ] **RF-22**: Gerentes devem poder adicionar novos ingredientes ao estoque (nome, unidade de medida, quantidade inicial). (Prioridade: Alta)
- [ ] **RF-23**: Gerentes devem poder editar a quantidade de cada ingrediente no estoque (entrada manual de reposição ou ajuste). (Prioridade: Alta)
- [ ] **RF-24**: Ao cadastrar ou editar um prato, o Gerente deve informar quais ingredientes ele consome e em que quantidade por unidade servida. (Prioridade: Alta)
- [ ] **RF-25**: Clientes e Atendentes não devem ter acesso à tela de estoque ou às quantidades de ingredientes. (Prioridade: Alta)

### Módulo: Chamados e Comunicação
- [ ] **RF-26**: O cliente deve possuir um botão "Chamar Funcionário" visível em qualquer tela do sistema. (Prioridade: Alta)
- [ ] **RF-27**: Ao clicar em "Chamar Funcionário", o cliente deve informar uma justificativa em campo de texto (ex: "Mesa 5 precisa de água", "Erro no pedido"). (Prioridade: Alta)
- [ ] **RF-28**: Funcionários devem ter uma dashboard de "Chamados" listando todas as solicitações pendentes com hora, identificação da mesa e justificativa. (Prioridade: Alta)
- [ ] **RF-29**: A dashboard de chamados deve emitir um som de notificação ao receber uma nova solicitação. (Prioridade: Alta)
- [ ] **RF-30**: Na primeira visita à dashboard de chamados, deve haver um botão "Ativar Notificações Sonoras" para contornar a restrição de autoplay dos navegadores. (Prioridade: Alta)
- [ ] **RF-31**: Funcionários devem poder marcar um chamado como "Atendido", removendo-o da lista de pendentes. (Prioridade: Média)

### Módulo: Faturamento
- [ ] **RF-32**: O sistema deve calcular e exibir o faturamento total do mês atual em uma dashboard exclusiva para Gerentes. (Prioridade: Alta)
- [ ] **RF-33**: A dashboard de faturamento deve permitir filtrar por período (dia, semana, mês). (Prioridade: Média)
- [ ] **RF-34**: A dashboard deve exibir métricas como: total faturado, quantidade de pedidos, ticket médio e pratos mais vendidos. (Prioridade: Média)
- [ ] **RF-35**: Pedidos com status "Cancelado" não devem ser considerados no cálculo de faturamento. (Prioridade: Alta)
- [ ] **RF-36**: Atendentes e Clientes não devem ter acesso à dashboard de faturamento. (Prioridade: Alta)

### Módulo: Gerenciamento de Cardápio
- [ ] **RF-37**: Gerentes devem poder adicionar novos pratos ao cardápio (nome, descrição, preço, imagem, ingredientes necessários, flag de destaque para slides). (Prioridade: Alta)
- [ ] **RF-38**: Gerentes devem poder editar pratos existentes. (Prioridade: Alta)
- [ ] **RF-39**: Gerentes devem poder remover pratos do cardápio. (Prioridade: Alta)
- [ ] **RF-40**: Pratos marcados como "destaque" aparecerão nos slides da landing page. (Prioridade: Alta)

### Módulo: Backup e Exportação
- [ ] **RF-41**: O Gerente deve poder exportar todos os dados do sistema (pedidos, estoque, contas, cardápio, faturamento) para um arquivo JSON. (Prioridade: Alta)
- [ ] **RF-42**: O Gerente deve poder importar dados de um arquivo JSON previamente exportado, restaurando o estado do sistema. (Prioridade: Alta)

---

## 2. Requisitos Não-Funcionais (RNF)

- [ ] **RNF-01**: A interface deve utilizar paleta de cores que remetam a gastronomia e fome: tons de laranja, vermelho, amarelo e marrom.
- [ ] **RNF-02**: O sistema deve ser totalmente responsivo, funcionando corretamente em desktops, tablets e smartphones.
- [ ] **RNF-03**: O tempo de carregamento inicial da landing page não deve exceder 3 segundos em conexão média.
- [ ] **RNF-04**: O sistema deve operar inteiramente no front-end, utilizando `localStorage` como mecanismo de persistência de dados.
- [ ] **RNF-05**: A interface deve ser intuitiva, permitindo que um novo usuário complete um pedido em no máximo 5 interações após o login.
- [ ] **RNF-06**: Os slides da landing page devem alternar automaticamente a cada 5 segundos, com opção de navegação manual.
- [ ] **RNF-07**: A interface deve priorizar UI/UX corporativo, limpo e minimalista, com hierarquia visual clara, espaçamento generoso, tipografia legível e ausência de elementos desnecessários.

---

## 3. Regras de Negócio (RN)

- [ ] **RN-01**: Um prato só pode ser adicionado ao carrinho e pedido se estiver com status "Disponível".
- [ ] **RN-02**: A disponibilidade de um prato é calculada automaticamente: `disponível = estoque_do_ingrediente / quantidade_necessária_por_prato` para cada ingrediente. Se algum ingrediente estiver abaixo do necessário, o prato fica indisponível.
- [ ] **RN-03**: Ao confirmar um pedido, o sistema debita do estoque a quantidade de cada ingrediente multiplicada pela quantidade de pratos pedidos.
- [ ] **RN-04**: Pedidos com status "Cancelado" não entram no cálculo de faturamento e não geram débito de estoque (se o estoque já foi debitado, deve ser estornado).
- [ ] **RN-05**: Apenas usuários com perfil "Gerente" podem criar, editar e remover pratos; criar, editar e inativar contas de mesas; criar, editar e inativar contas de funcionários; visualizar faturamento; e gerenciar estoque.
- [ ] **RN-06**: Atendentes podem visualizar pedidos, atualizar status de pedidos, visualizar chamados e marcar chamados como atendidos.
- [ ] **RN-07**: Clientes (mesas) só podem visualizar o próprio histórico de pedidos e fazer novos pedidos.
- [ ] **RN-08**: O faturamento mensal é calculated como a soma do valor total de todos os pedidos finalizados (status "Entregue") dentro do período selecionado.
- [ ] **RN-09**: O ticket médio é calculado como `faturamento_total / quantidade_de_pedidos_finalizados`.
- [ ] **RN-10**: Cada mesa possui exatamente uma conta de login, criada e gerenciada pelo Gerente.
