// Captura dos elementos
const logoUpload = document.getElementById('logo-upload');
const clientNameInput = document.getElementById('client-name');
const proposalTextInput = document.getElementById('proposal-text');
const btnGenerate = document.getElementById('btn-generate');

const pdfLogo = document.getElementById('pdf-logo');
const pdfClient = document.getElementById('pdf-client').querySelector('span');
const pdfBodyContent = document.getElementById('pdf-body-content');
const pdfElement = document.getElementById('pdf-content');

// Logotipo oficial do WhatsApp em código vetorial puro (SVG)
const waSvgIcon = `<svg class="whatsapp-contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

// 1. Configurar Datas e Validade
function setupDates() {
    const today = new Date();
    const validDate = new Date(today);
    validDate.setDate(today.getDate() + 10); 
    const formatDate = (date) => date.toLocaleDateString('pt-BR');
    document.getElementById('date-issue').innerText = `Emissão: ${formatDate(today)}`;
    document.getElementById('date-validity').innerText = `Válido até: ${formatDate(validDate)}`;
}
setupDates();

// 2. Lógica para carregar a Logo
logoUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            pdfLogo.src = e.target.result;
            pdfLogo.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        pdfLogo.style.display = 'none';
        pdfLogo.src = '';
    }
});

// 3. Atualizar Nome do Cliente
clientNameInput.addEventListener('input', e => {
    pdfClient.textContent = e.target.value.trim() || 'Cliente';
});

// 4. Renderizar Texto e Formatar Cards (COM SISTEMA ANTI-FALHAS)
proposalTextInput.addEventListener('input', function(e) {
    const markdownText = e.target.value;
    
    if (markdownText.trim() === '') {
        pdfBodyContent.innerHTML = '<p class="placeholder-text">Cole o texto ao lado. Os Glass-Cards serão gerados automaticamente aqui...</p>';
        return;
    }

    let rawHtml = '';
    
    // Tratativa de Erro: Garante que o marked rode independente da versão carregada
    try {
        if (typeof marked.parse === 'function') {
            rawHtml = marked.parse(markdownText);
        } else if (typeof marked === 'function') {
            rawHtml = marked(markdownText);
        } else {
            throw new Error("Biblioteca Marked.js não encontrada.");
        }
    } catch (error) {
        console.error("Erro de leitura do texto:", error);
        pdfBodyContent.innerHTML = `<p style="color: red; padding: 20px;"><strong>Erro do Sistema:</strong> Falha ao processar o texto. Verifique sua conexão ou recarregue a página (Ctrl + F5).</p>`;
        return;
    }

    // Aplica o ícone do WhatsApp
    rawHtml = rawHtml.replace(/<strong>WhatsApp:<\/strong>/g, `<strong>${waSvgIcon}WhatsApp:</strong>`);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;
    
    let finalHtml = '';
    let currentCardContent = '';
    
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

    Array.from(tempDiv.children).forEach(child => {
        if (['H1', 'H2', 'H3'].includes(child.tagName)) {
            if (currentCardContent !== '') {
                finalHtml += `<div class="pdf-glass-card">${currentCardContent}</div>`;
                currentCardContent = '';
            }
            const iconName = getIconForTitle(child.innerText);
            child.innerHTML = `<span class="material-symbols-outlined">${iconName}</span> ` + child.innerHTML;
            currentCardContent += child.outerHTML;
        } else {
            currentCardContent += child.outerHTML;
        }
    });
    
    if (currentCardContent !== '') {
        finalHtml += `<div class="pdf-glass-card">${currentCardContent}</div>`;
    }
    
    pdfBodyContent.innerHTML = finalHtml;
});

// 5. Motor de Exportação Definitivo (Usa a técnica de CLONE Rígido)
btnGenerate.addEventListener('click', function() {
    
    const originalText = btnGenerate.innerHTML;
    btnGenerate.innerHTML = 'Gerando Documento Perfeito... <span class="material-symbols-outlined" style="vertical-align: middle; font-size: 1.1em; margin-left: 5px;">hourglass_empty</span>';
    btnGenerate.disabled = true;

    const opt = {
        margin:       [15, 15, 15, 15], 
        filename:     `Proposta_MOTOLOG_${clientNameInput.value || 'Cliente'}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            windowWidth: 800, 
            onclone: function(clonedDoc) {
                const elementToPrint = clonedDoc.getElementById('pdf-content');
                if(elementToPrint) {
                    elementToPrint.classList.add('pdf-strict-export');
                }
            }
        }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { 
            mode: ['css', 'legacy'], 
            avoid: ['.pdf-glass-card', '.stats-card', 'tr', 'h1', 'h2'] 
        }
    };

    html2pdf().set(opt).from(pdfElement).save().then(() => {
        btnGenerate.innerHTML = originalText;
        btnGenerate.disabled = false;
    });
});
    });
    
    if (currentCardContent !== '') {
        finalHtml += `<div class="pdf-glass-card">${currentCardContent}</div>`;
    }
    
    pdfBodyContent.innerHTML = finalHtml;
});

// 5. Motor de Exportação Definitivo (Usa a técnica de CLONE Rígido)
btnGenerate.addEventListener('click', function() {
    
    const originalText = btnGenerate.innerHTML;
    btnGenerate.innerHTML = 'Gerando Documento Perfeito... <span class="material-symbols-outlined" style="vertical-align: middle; font-size: 1.1em; margin-left: 5px;">hourglass_empty</span>';
    btnGenerate.disabled = true;

    const opt = {
        margin:       [15, 15, 15, 15], 
        filename:     `Proposta_MOTOLOG_${clientNameInput.value || 'Cliente'}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            windowWidth: 800, 
            onclone: function(clonedDoc) {
                const elementToPrint = clonedDoc.getElementById('pdf-content');
                if(elementToPrint) {
                    elementToPrint.classList.add('pdf-strict-export');
                }
            }
        }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { 
            mode: ['css', 'legacy'], 
            avoid: ['.pdf-glass-card', '.stats-card', 'tr', 'h1', 'h2'] 
        }
    };

    html2pdf().set(opt).from(pdfElement).save().then(() => {
        btnGenerate.innerHTML = originalText;
        btnGenerate.disabled = false;
    });
});

