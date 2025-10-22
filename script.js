/**
 * CHECKOUT MERCADO PAGO - INTEGRAÇÃO COMPLETA
 * 
 * Este arquivo contém toda a lógica de integração com a API do Mercado Pago
 * para processamento de pagamentos via cartão de crédito e PIX.
 * 
 * Documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-configuration
 */

// Configuração do Mercado Pago
// IMPORTANTE: Substitua 'YOUR_PUBLIC_KEY' pela sua chave pública do Mercado Pago
const MERCADOPAGO_PUBLIC_KEY = 'YOUR_PUBLICs_KEYss'; // Chave pública do Mercado Pago

// Inicialização do SDK do Mercado Pago
let mercadopago;
let cardForm;

/**
 * Inicialização da aplicação quando o DOM estiver carregado
 * Configura o SDK do Mercado Pago e prepara os event listeners
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando integração com Mercado Pago...');
    
    // Verifica se a chave pública foi configurada
    if (MERCADOPAGO_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        showMessage('Erro: Configure sua chave pública do Mercado Pago no arquivo script.js', 'error');
        return;
    }
    
    // Inicializa o SDK do Mercado Pago
    initializeMercadoPago();
    
    // Configura os event listeners do formulário
    setupEventListeners();
    
    // Configura a máscara para CEP
    setupZipCodeMask();
});

/**
 * Inicializa o SDK do Mercado Pago
 * Configura a instância do Mercado Pago com a chave pública
 */
function initializeMercadoPago() {
    try {
        // Inicializa o Mercado Pago com a chave pública
        mercadopago = new MercadoPago(MERCADOPAGO_PUBLIC_KEY, {
            locale: 'pt-BR' // Define o idioma como português brasileiro
        });
        
        console.log('SDK do Mercado Pago inicializado com sucesso');
        
        // Inicializa o formulário de cartão
        initializeCardForm();
        
    } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error);
        showMessage('Erro ao inicializar o sistema de pagamento. Tente novamente.', 'error');
    }
}

/**
 * Inicializa o formulário de cartão do Mercado Pago
 * Cria os campos de cartão de crédito de forma segura
 */
function initializeCardForm() {
    try {
        // Configura os campos do formulário de cartão
        cardForm = mercadopago.cardForm({
            amount: "99.90", // Valor do produto (em reais)
            iframe: true, // Usa iframe para maior segurança
            form: {
                id: "card-form-container", // Container onde o formulário será inserido
                cardNumber: {
                    id: "form-checkout__cardNumber",
                    placeholder: "Número do cartão"
                },
                expirationDate: {
                    id: "form-checkout__expirationDate",
                    placeholder: "MM/AA"
                },
                securityCode: {
                    id: "form-checkout__securityCode",
                    placeholder: "Código de segurança"
                },
                cardholderName: {
                    id: "form-checkout__cardholderName",
                    placeholder: "Nome no cartão"
                },
                issuer: {
                    id: "form-checkout__issuer",
                    placeholder: "Banco emissor"
                },
                installments: {
                    id: "form-checkout__installments",
                    placeholder: "Parcelas"
                },
                identificationType: {
                    id: "form-checkout__identificationType",
                    placeholder: "Tipo de documento"
                },
                identificationNumber: {
                    id: "form-checkout__identificationNumber",
                    placeholder: "Número do documento"
                },
                cardholderEmail: {
                    id: "form-checkout__cardholderEmail",
                    placeholder: "E-mail"
                }
            },
            callbacks: {
                onFormMounted: error => {
                    if (error) {
                        console.error('Erro ao montar formulário de cartão:', error);
                        showMessage('Erro ao carregar formulário de pagamento.', 'error');
                    } else {
                        console.log('Formulário de cartão montado com sucesso');
                    }
                },
                onSubmit: event => {
                    // Previne o envio padrão do formulário
                    event.preventDefault();
                    
                    // Processa o pagamento com cartão
                    processCardPayment();
                },
                onFetching: (resource) => {
                    console.log('Buscando recursos:', resource);
                }
            }
        });
        
    } catch (error) {
        console.error('Erro ao inicializar formulário de cartão:', error);
        showMessage('Erro ao configurar formulário de pagamento.', 'error');
    }
}

/**
 * Configura todos os event listeners do formulário
 * Gerencia a interação do usuário com os campos e botões
 */
function setupEventListeners() {
    // Event listener para mudança de método de pagamento
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Event listener para o formulário principal
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.addEventListener('submit', handleFormSubmit);
    
    // Event listener para validação em tempo real
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

/**
 * Gerencia a mudança de método de pagamento
 * Mostra/esconde o formulário de cartão conforme necessário
 */
function handlePaymentMethodChange(event) {
    const selectedMethod = event.target.value;
    const cardFormContainer = document.getElementById('card-form-container');
    
    if (selectedMethod === 'credit-card') {
        // Mostra o formulário de cartão
        cardFormContainer.style.display = 'block';
        console.log('Método de pagamento: Cartão de crédito');
    } else if (selectedMethod === 'pix') {
        // Esconde o formulário de cartão
        cardFormContainer.style.display = 'none';
        console.log('Método de pagamento: PIX');
    }
}

/**
 * Processa o envio do formulário principal
 * Valida os dados e direciona para o método de pagamento apropriado
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('Processando formulário de checkout...');
    
    // Valida todos os campos obrigatórios
    if (!validateForm()) {
        showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Obtém o método de pagamento selecionado
    const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (selectedPaymentMethod === 'credit-card') {
        // Processa pagamento com cartão
        processCardPayment();
    } else if (selectedPaymentMethod === 'pix') {
        // Processa pagamento com PIX
        processPixPayment();
    }
}

/**
 * Processa pagamento com cartão de crédito
 * Utiliza o SDK do Mercado Pago para criar o token do cartão
 */
function processCardPayment() {
    console.log('Processando pagamento com cartão...');
    
    // Mostra estado de loading
    setLoadingState(true);
    
    try {
        // Cria o token do cartão usando o SDK
        cardForm.createCardToken().then(result => {
            if (result.error) {
                console.error('Erro ao criar token do cartão:', result.error);
                showMessage('Erro ao processar cartão: ' + result.error.message, 'error');
                setLoadingState(false);
            } else {
                console.log('Token do cartão criado com sucesso');
                
                // Aqui você enviaria o token para seu backend
                // Para este exemplo, simulamos o sucesso
                simulatePaymentProcessing(result.id);
            }
        }).catch(error => {
            console.error('Erro inesperado:', error);
            showMessage('Erro inesperado ao processar pagamento.', 'error');
            setLoadingState(false);
        });
        
    } catch (error) {
        console.error('Erro ao processar cartão:', error);
        showMessage('Erro ao processar pagamento com cartão.', 'error');
        setLoadingState(false);
    }
}

/**
 * Processa pagamento com PIX
 * Cria uma preferência de pagamento PIX
 */
function processPixPayment() {
    console.log('Processando pagamento com PIX...');
    
    // Mostra estado de loading
    setLoadingState(true);
    
    try {
        // Coleta os dados do formulário
        const formData = collectFormData();
        
        // Cria a preferência de pagamento PIX
        const preference = {
            items: [
                {
                    title: "Produto Exemplo",
                    quantity: 1,
                    unit_price: 99.90
                }
            ],
            payer: {
                name: formData.name,
                email: formData.email,
                phone: {
                    number: formData.phone
                }
            },
            payment_methods: {
                excluded_payment_types: [
                    { id: "credit_card" },
                    { id: "debit_card" }
                ]
            },
            back_urls: {
                success: window.location.href + "?status=success",
                failure: window.location.href + "?status=failure",
                pending: window.location.href + "?status=pending"
            },
            auto_return: "approved"
        };
        
        // Simula a criação da preferência (em produção, isso seria feito no backend)
        simulatePixPreferenceCreation(preference);
        
    } catch (error) {
        console.error('Erro ao processar PIX:', error);
        showMessage('Erro ao processar pagamento PIX.', 'error');
        setLoadingState(false);
    }
}

/**
 * Simula o processamento do pagamento
 * Em produção, aqui você enviaria os dados para seu backend
 */
function simulatePaymentProcessing(token) {
    console.log('Simulando processamento do pagamento...');
    
    // Simula delay de processamento
    setTimeout(() => {
        setLoadingState(false);
        showMessage('Pagamento processado com sucesso! Redirecionando...', 'success');
        
        // Em produção, aqui você redirecionaria para a página de sucesso
        setTimeout(() => {
            alert('Pagamento aprovado! (Simulação)');
        }, 2000);
        
    }, 3000);
}

/**
 * Simula a criação de preferência PIX
 * Em produção, isso seria feito no seu backend
 */
function simulatePixPreferenceCreation(preference) {
    console.log('Simulando criação de preferência PIX...');
    
    // Simula delay de processamento
    setTimeout(() => {
        setLoadingState(false);
        showMessage('QR Code PIX gerado com sucesso! (Simulação)', 'success');
        
        // Em produção, aqui você mostraria o QR Code PIX
        setTimeout(() => {
            alert('QR Code PIX gerado! (Simulação)');
        }, 2000);
        
    }, 2000);
}

/**
 * Coleta todos os dados do formulário
 * Retorna um objeto com todos os dados preenchidos
 */
function collectFormData() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        zipcode: document.getElementById('zipcode').value,
        street: document.getElementById('street').value,
        number: document.getElementById('number').value,
        neighborhood: document.getElementById('neighborhood').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value
    };
}

/**
 * Valida todo o formulário
 * Verifica se todos os campos obrigatórios foram preenchidos
 */
function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Este campo é obrigatório');
            isValid = false;
        }
    });
    
    // Validação específica para e-mail
    const emailField = document.getElementById('email');
    if (emailField.value && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'E-mail inválido');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Valida um campo específico
 * Verifica se o campo está preenchido corretamente
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(field, 'Este campo é obrigatório');
    } else if (field.type === 'email' && !isValidEmail(value)) {
        showFieldError(field, 'E-mail inválido');
    } else {
        clearFieldError(field);
    }
}

/**
 * Limpa o erro de um campo
 * Remove a classe de erro e a mensagem
 */
function clearFieldError(event) {
    const field = event.target;
    clearFieldError(field);
}

/**
 * Limpa o erro de um campo específico
 */
function clearFieldError(field) {
    field.classList.remove('error');
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/**
 * Mostra erro em um campo específico
 * Adiciona classe de erro e mensagem
 */
function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove mensagem de erro anterior
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Adiciona nova mensagem de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorDiv);
}

/**
 * Valida formato de e-mail
 * Verifica se o e-mail está em formato válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Configura máscara para CEP
 * Formata automaticamente o CEP conforme o usuário digita
 */
function setupZipCodeMask() {
    const zipcodeField = document.getElementById('zipcode');
    
    zipcodeField.addEventListener('input', function(event) {
        let value = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        
        if (value.length <= 8) {
            // Aplica máscara: 00000-000
            if (value.length > 5) {
                value = value.substring(0, 5) + '-' + value.substring(5);
            }
            event.target.value = value;
        }
    });
}

/**
 * Controla o estado de loading do botão
 * Mostra/esconde o indicador de carregamento
 */
function setLoadingState(loading) {
    const submitButton = document.getElementById('submit-button');
    
    if (loading) {
        submitButton.disabled = true;
        submitButton.textContent = 'Processando...';
        submitButton.classList.add('loading');
    } else {
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar Compra';
        submitButton.classList.remove('loading');
    }
}

/**
 * Mostra mensagens para o usuário
 * Exibe mensagens de sucesso ou erro
 */
function showMessage(message, type) {
    const messageArea = document.getElementById('message-area');
    
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        messageArea.style.display = 'none';
    }, 5000);
}

/**
 * Verifica se há parâmetros de status na URL
 * Processa retornos de pagamento (sucesso, falha, pendente)
 */
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
        showMessage('Pagamento aprovado com sucesso!', 'success');
    } else if (status === 'failure') {
        showMessage('Pagamento foi recusado. Tente novamente.', 'error');
    } else if (status === 'pending') {
        showMessage('Pagamento está sendo processado. Aguarde a confirmação.', 'success');
    }
}

// Verifica status de pagamento ao carregar a página
checkPaymentStatus();

/**
 * CONFIGURAÇÃO PARA PRODUÇÃO:
 * 
 * 1. Substitua 'YOUR_PUBLIC_KEY' pela sua chave pública do Mercado Pago
 * 2. Implemente um backend para:
 *    - Criar preferências de pagamento
 *    - Processar webhooks
 *    - Gerenciar status de pagamento
 * 3. Configure as URLs de retorno (success, failure, pending)
 * 4. Implemente validação de dados no backend
 * 5. Configure SSL/HTTPS para produção
 * 
 * Documentação completa: https://www.mercadopago.com.br/developers/pt/docs
 */
