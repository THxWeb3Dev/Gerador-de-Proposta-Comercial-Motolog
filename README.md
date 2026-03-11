# ⚡ MOTOLOG | Gerador de Propostas Automático

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge" alt="Status">
</div>

<br>

> **WebApp exclusivo** desenvolvido para otimizar, automatizar e padronizar o fluxo comercial da **MOTOLOG Soluções em Logística**. Transforma textos simples em propostas comerciais de alto padrão em formato PDF, prontas para envio a clientes B2B.

---

## 🎯 Sobre o Projeto

O **Gerador de Propostas MOTOLOG** foi criado para resolver a necessidade de agilidade no envio de orçamentos complexos. Com ele, o representante comercial pode colar um texto pré-formatado e o sistema renderiza, em tempo real, um documento executivo com layout *Clear Mode* (fundo claro, sombras suaves e tipografia moderna).

O sistema divide os tópicos automaticamente em blocos organizados ("Glass-Cards") e atribui ícones vetoriais corporativos de acordo com o contexto do assunto (Apresentação, Valores, Benefícios, etc.).

## ✨ Funcionalidades Principais

- **📄 Renderização em Tempo Real:** Conversão instantânea de texto (Markdown) para HTML formatado.
- **🎨 Design Clear Mode & Glassmorphism:** Interface limpa, responsiva e focada na legibilidade do cliente final.
- **🤖 Inteligência de Layout:** Identificação automática de títulos para geração de blocos textuais isolados com ícones corporativos (*Google Material Symbols*).
- **📅 Automação de Dados:** Cálculo automático de data de emissão e prazo de validade da proposta (10 dias).
- **🖨️ Exportação Nativa para PDF:** Geração de documento A4 em alta resolução (via `html2pdf.js`) pronto para download e envio.
- **💬 Integração Visual SVG:** Inserção dinâmica do logotipo do WhatsApp vetorizado ao lado de contatos comerciais para manter a alta definição.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído sem o uso de frameworks pesados, garantindo máxima performance e carregamento instantâneo diretamente no navegador:

* **HTML5:** Estrutura semântica do WebApp e do template A4.
* **CSS3:** Estilização com variáveis (Custom Properties), Flexbox e efeitos de *backdrop-filter* para o Glassmorphism.
* **JavaScript (Vanilla):** Manipulação do DOM, leitura dinâmica de arquivos locais e lógicas de renderização.
* **[Marked.js](https://marked.js.org/):** Biblioteca para conversão precisa de Markdown em HTML.
* **[html2pdf.js](https://ekoopmans.github.io/html2pdf.js/):** Motor de conversão visual do layout web para arquivo `.pdf`.

## 🚀 Como Executar

O projeto roda inteiramente no lado do cliente (Client-Side), não exigindo a configuração de servidores ou bancos de dados.

1. Faça o download dos arquivos para a sua máquina local.
2. Certifique-se de que os três arquivos (`index.html`, `style.css` e `script.js`) estão no mesmo diretório.
3. Dê um duplo clique no arquivo `index.html` para abri-lo em qualquer navegador moderno (Chrome, Edge, Safari, Firefox).
4. Insira a logo da MOTOLOG, o nome do cliente e cole o escopo da proposta na área de texto para gerar seu PDF.

---

## ⚖️ Licença e Direitos Autorais

> ⚠️ **TODOS OS DIREITOS ESTÃO ESTRITAMENTE RESERVADOS.**

Este é um software proprietário de uso exclusivo da **MOTOLOG Soluções em Logística**. 

**É terminantemente proibida** a cópia, clonagem, distribuição, modificação, engenharia reversa, reprodução total ou parcial, bem como a comercialização deste código-fonte, de sua interface (UI) ou de sua estrutura lógica, sob qualquer formato ou pretexto. O uso não autorizado constitui violação de propriedade intelectual e está sujeito às sanções legais cabíveis.

---

<div align="center">
  <b>Gabriel Oliveira</b> <br>
  Representante Comercial | <b>MOTOLOG Soluções em Logística</b><br>
  📍 <i>Fonseca, Niterói - RJ</i>
</div>
