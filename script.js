document.addEventListener('DOMContentLoaded', () => {
    
    // Captura dos elementos Web
    const logoUpload = document.getElementById('logo-upload');
    const clientNameInput = document.getElementById('client-name');
    const proposalTextInput = document.getElementById('proposal-text');
    const btnGenerate = document.getElementById('btn-generate');

    const pdfLogo = document.getElementById('pdf-logo');
    const pdfClient = document.getElementById('pdf-client').querySelector('span');
    const pdfBodyContent = document.getElementById('pdf-body-content');
    const webPreviewContent = document.getElementById('web-preview-content');
    
    // Contêiner de Buffer para o PDF
    const printBufferContainer = document.getElementById('print-buffer-container');

    // SVG do WhatsApp vetorizado com alinhamento preciso
    const waSvgIcon = `<svg style="width: 1.2em; height: 1.2em; vertical-align: middle; margin-right: 5px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

    // Configuração Automática de Datas
    function initializeDates() {
        const today = new Date();
        const validDate = new Date(today);
        validDate.setDate(today.getDate() + 10); 
        const formatData = (date) => date.toLocaleDateString('pt-BR');
        document.getElementById('date-issue').innerText = `Emissão: ${formatData(today)}`;
        document.getElementById('date-validity').innerText = `Válido até: ${formatData(validDate)}`;
    }
    initializeDates();

    // Upload de Logo e persistência no Base64
    let currentLogoBase64 = '';
    logoUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentLogoBase64 = e.target.result;
                pdfLogo.src = currentLogoBase64;
                pdfLogo.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            currentLogoBase64 = '';
            pdfLogo.style.display = 'none';
            pdfLogo.src = '';
        }
    });

    // Atualização do Nome do Cliente
    clientNameInput.addEventListener('input', e => {
        pdfClient.textContent = e.target.value.trim() || 'Cliente';
    });

    // Motor Inteligente de Ícones
    function getIconForTitle(titleText) {
        const text = titleText.toLowerCase();
        if(text.includes('apresentação') || text.includes('desafio')) return 'campaign';
        if(text.includes('estrutura') || text.includes('operação')) return 'domain';
        if(text.includes('valor') || text.includes('investimento') || text.includes('tabela')) return 'payments';
        if(text.includes('flexibilidade') || text.includes('pagamento')) return 'handshake';
        if(text.includes('benefício') || text.includes('vantagem')) return 'verified';
        if(text.includes('conclusão') || text.includes('contato')) return 'support_agent';
        return 'label'; 
    }

    // Processamento do Texto com Sistema Anti-Falhas e Regex Fallback
    function processMarkdown(text) {
        let rawHtml = '';
        try {
            if (typeof marked !== 'undefined') {
                rawHtml = marked.parse ? marked.parse(text) : marked(text);
            } else {
                throw new Error("Marked CDN falhou");
            }
        } catch (error) {
            console.warn("Usando parser nativo de fallback.");
            rawHtml = text.replace(/^### (.*$)/gim, '<h3>$1</h3>')
                          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                          .replace(/^\* (.*$)/gim, '<li>$1</li>')
                          .split('\n\n').map(p => {
                              if(p.startsWith('<h') || p.startsWith('<li')) return p;
                              return `<p>${p}</p>`;
                          }).join('');
        }

        rawHtml = rawHtml.replace(/<strong>WhatsApp:<\/strong>/g, `<strong>${waSvgIcon}WhatsApp:</strong>`);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtml;
        let finalHtml = '';

        Array.from(tempDiv.children).forEach(child => {
            if (['H1', 'H2', 'H3'].includes(child.tagName)) {
                const iconName = getIconForTitle(child.innerText);
                child.innerHTML = `<span class="material-symbols-outlined">${iconName}</span> ` + child.innerHTML;
                child.className = 'pdf-section-title'; 
            }
            finalHtml += child.outerHTML;
        });
        
        return finalHtml;
    }

    // Listener de digitação atualiza apenas a Web View
    proposalTextInput.addEventListener('input', function(e) {
        const text = e.target.value;
        if (text.trim() === '') {
            pdfBodyContent.innerHTML = '<p style="color: #94a3b8; font-style: italic;">A formatação da proposta aparecerá aqui em tempo real. Cole o texto no painel ao lado.</p>';
        } else {
            pdfBodyContent.innerHTML = processMarkdown(text);
        }
    });

    // =========================================================================
    // O GERADOR DE PDF PERFEITO (Padrão Gamma)
    // =========================================================================
    btnGenerate.addEventListener('click', function() {
        if (typeof html2pdf === 'undefined') {
            alert("A biblioteca de PDF foi bloqueada pelo seu navegador ou conexão. Recarregue a página.");
            return;
        }

        const originalText = btnGenerate.innerHTML;
        btnGenerate.innerHTML = 'Processando Impressão... <span class="material-symbols-outlined" style="vertical-align: middle; margin-left: 5px;">hourglass_empty</span>';
        btnGenerate.disabled = true;

        // 1. Clona a estrutura perfeita da tela web
        const cloneDOM = webPreviewContent.cloneNode(true);
        
        // 2. Transfere o clone para o "Print Buffer" (Que é travado em 800px)
        printBufferContainer.innerHTML = ''; 
        printBufferContainer.appendChild(cloneDOM);

        // Configuração Nativa e Segura para o html2pdf
        const opt = {
            margin:       [15, 15, 20, 15], // Margens do papel A4 físico
            filename:     `Proposta_MOTOLOG_${clientNameInput.value || 'Cliente'}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: '#ffffff',
                windowWidth: 800 // Garante que a foto do canvas leia exatamente os 800px da div, sem cortar.
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak:    { 
                mode: ['css', 'legacy'], 
                // A regra mais importante: Ele empurra elementos inteiros para baixo em vez de cortar no meio
                avoid: ['.pdf-section-title', '.stats-card', 'table', 'tr', 'li', 'p'] 
            }
        };

        // 3. Manda gerar o PDF lendo APENAS a div de engenharia oculta, e não a tela visível.
        html2pdf().set(opt).from(printBufferContainer).save().then(() => {
            printBufferContainer.innerHTML = ''; // Limpa a memória após o sucesso
            btnGenerate.innerHTML = originalText;
            btnGenerate.disabled = false;
        }).catch(err => {
            alert("Ocorreu um erro ao gerar o documento. Tente novamente.");
            console.error(err);
            printBufferContainer.innerHTML = '';
            btnGenerate.innerHTML = originalText;
            btnGenerate.disabled = false;
        });
    });

});
