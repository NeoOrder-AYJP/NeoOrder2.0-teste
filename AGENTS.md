# AGENTS.md — Diretrizes e Regras de Desenvolvimento

Este documento define as regras fundamentais que todos os agentes e desenvolvedores devem seguir ao trabalhar neste repositório.

## Fonte de Verdade e Regras Invioláveis

1. **`spec.md` é a autoridade máxima e fonte de verdade do projeto.**
2. **As telas fornecidas no diretório `telas/` são a referência visual oficial do sistema.**
3. **Não devem ser criados requisitos novos.** Não introduza funcionalidades adicionais não especificadas.
4. **Não devem ser removidos requisitos existentes.** Todos os requisitos funcionais e não-funcionais devem ser atendidos integralmente.
5. **Não devem ser alteradas regras de negócio.** As regras RN-01 a RN-10 devem ser seguidas estritamente.
6. **Não devem ser alteradas permissões.** A hierarquia e matriz de permissões definidas na `spec.md` devem ser mantidas rigorosamente.
7. **Não devem ser alterados os fluxos definidos sem autorização explícita.** Os fluxos de tela para Clientes, Atendentes e Gerentes devem corresponder aos especificados.
8. **A implementação deve manter o escopo estritamente definido.**
9. **O código deve possuir excelente organização, modularidade e qualidade técnica.**
10. **Quaisquer alterações devem permanecer totalmente compatíveis com a especificação.**

## Diretrizes de Design & UI/UX

- Seguir o design system "Culinary Operations System" documentado nas referências visuais (`DESIGN.md`).
- Paleta de cores: Laranja terracota (`#E05326` / `#AB2F00`), Marrom expresso (`#29150E` / `#75584E`), Amarelo âmbar (`#F59E0B`), Creme aquecido (`#FAF7F2`).
- Tipografia: **Plus Jakarta Sans**.
- Ícone: **Google Material Symbols Outlined** ou Font Awesome.
- Responsividade: Compatível com Mobile, Tablet e Desktop.

## Tecnologias Permitidas

- Estrutura: HTML5 semântico
- Estilização: CSS3 / Tailwind CSS (conforme utilizado nas referências)
- Lógica: JavaScript Vanilla (ES6+)
- Persistência: `localStorage` (JSON)
- Não adicionar backend, Java, bancos de dados externos ou frameworks adicionais.
