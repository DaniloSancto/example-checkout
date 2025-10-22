# Checkout Mercado Pago - Integração Completa

Este projeto implementa um checkout completo integrado com a API do Mercado Pago, utilizando apenas HTML, CSS e JavaScript.

## 📦 Como Funciona o Import do Mercado Pago

### 🔗 Carregamento do SDK via CDN

O Mercado Pago é integrado através de uma tag `<script>` no HTML que carrega o SDK oficial:

```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

### 🤔 Por que Precisamos Deste Import?

1. **SDK Oficial**: O Mercado Pago fornece um SDK JavaScript oficial que contém todas as funcionalidades necessárias para processar pagamentos
2. **Tokenização Segura**: O SDK gerencia a tokenização dos dados do cartão de forma segura, sem expor informações sensíveis
3. **Validação de Cartão**: Inclui validação em tempo real de números de cartão, datas de expiração e códigos de segurança
4. **Compatibilidade**: Garante compatibilidade com diferentes navegadores e dispositivos
5. **Atualizações Automáticas**: O CDN sempre fornece a versão mais recente do SDK

### 🔧 Como o SDK é Utilizado

Após o carregamento, o SDK disponibiliza a classe `MercadoPago` globalmente:

```javascript
// Inicialização do SDK
mercadopago = new MercadoPago(PUBLIC_KEY, {
    locale: 'pt-BR'
});

// Criação do formulário de cartão
cardForm = mercadopago.cardForm({
    amount: "99.90",
    iframe: true,
    // ... configurações
});
```

### ⚠️ Importante

- **Ordem de Carregamento**: O script do Mercado Pago deve ser carregado ANTES do nosso `script.js`
- **Chave Pública**: Necessária para autenticação com a API do Mercado Pago
- **HTTPS**: Em produção, o site deve usar HTTPS para segurança

## 🚀 Funcionalidades

- ✅ **Pagamento com Cartão de Crédito** - Integração segura com tokenização
- ✅ **Pagamento PIX** - Geração de QR Code para pagamento instantâneo
- ✅ **Formulário Responsivo** - Design moderno e adaptável
- ✅ **Validação Completa** - Validação em tempo real dos campos
- ✅ **Máscaras de Entrada** - Formatação automática para CEP e telefone
- ✅ **Tratamento de Erros** - Mensagens claras para o usuário
- ✅ **Estados de Loading** - Feedback visual durante processamento

## 📁 Estrutura do Projeto

```
checkout-mercado-pago/
├── index.html          # Estrutura HTML do checkout
├── styles.css          # Estilos CSS responsivos
├── script.js           # Lógica JavaScript e integração Mercado Pago
└── README.md           # Documentação do projeto
```

## 🛠️ Configuração

### 1. Obter Credenciais do Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta ou faça login
3. Acesse "Suas integrações" > "Criar aplicação"
4. Copie sua **Chave Pública** (Public Key)

### 2. Configurar a Chave Pública

No arquivo `script.js`, substitua a linha:

```javascript
const MERCADOPAGO_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
```

Por:

```javascript
const MERCADOPAGO_PUBLIC_KEY = 'sua_chave_publica_aqui';
```

### 3. Executar o Projeto

1. Abra o arquivo `index.html` em um navegador
2. Ou use um servidor local:
   ```bash
   # Com Python
   python -m http.server 8000
   
   # Com Node.js
   npx http-server
   ```

## 🔧 Como Funciona

### Integração com Mercado Pago

O projeto utiliza o **SDK JavaScript do Mercado Pago** para:

1. **Tokenização Segura**: Os dados do cartão são tokenizados no frontend
2. **Validação de Cartão**: Verificação em tempo real dos dados
3. **Preferências de Pagamento**: Criação de links PIX e configurações

### Fluxo de Pagamento

#### Cartão de Crédito:
1. Usuário preenche dados do cartão
2. SDK tokeniza os dados (nunca armazenados)
3. Token é enviado para processamento
4. Pagamento é processado pelo Mercado Pago

#### PIX:
1. Usuário seleciona PIX como método
2. Sistema cria preferência de pagamento
3. QR Code é gerado para pagamento
4. Usuário paga via PIX

## 📋 Campos do Formulário

### Dados do Comprador
- **Nome Completo** (obrigatório)
- **E-mail** (obrigatório, com validação)
- **Telefone** (obrigatório)

### Endereço de Entrega
- **CEP** (obrigatório, com máscara)
- **Rua** (obrigatório)
- **Número** (obrigatório)
- **Bairro** (obrigatório)
- **Cidade** (obrigatório)
- **Estado** (obrigatório, dropdown)

### Métodos de Pagamento
- **Cartão de Crédito** (com formulário seguro)
- **PIX** (geração de QR Code)

## 🎨 Design e UX

### Características do Design:
- **Gradiente Moderno**: Cores atrativas e profissionais
- **Responsivo**: Adapta-se a todos os dispositivos
- **Animações Suaves**: Transições e feedback visual
- **Validação Visual**: Estados de erro e sucesso claros

### Estados Visuais:
- **Loading**: Indicador durante processamento
- **Erro**: Mensagens vermelhas para problemas
- **Sucesso**: Confirmações verdes para aprovações

## 🔒 Segurança

### Medidas Implementadas:
- **Tokenização**: Dados do cartão nunca são armazenados
- **HTTPS Obrigatório**: Comunicação criptografada
- **Validação Frontend**: Verificação antes do envio
- **Iframe Seguro**: Campos de cartão em ambiente isolado

### Para Produção:
- Configure SSL/HTTPS
- Implemente validação no backend
- Configure webhooks para notificações
- Use chaves de produção do Mercado Pago

## 📚 Documentação Técnica

### SDK Mercado Pago
- **Documentação**: [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
- **SDK JavaScript**: [GitHub SDK](https://github.com/mercadopago/sdk-js)
- **API Reference**: [API Docs](https://www.mercadopago.com.br/developers/pt/reference)

### Principais Métodos Utilizados:

#### 1. Inicialização do SDK
```javascript
mercadopago = new MercadoPago(PUBLIC_KEY, {
    locale: 'pt-BR'
});
```

#### 2. Formulário de Cartão
```javascript
cardForm = mercadopago.cardForm({
    amount: "99.90",
    iframe: true,
    form: { /* configurações dos campos */ },
    callbacks: { /* eventos */ }
});
```

#### 3. Criação de Token
```javascript
cardForm.createCardToken().then(result => {
    // Processa resultado
});
```

## 🚀 Implementação em Produção

### Backend Necessário:
1. **Criar Preferências**: Endpoint para gerar preferências PIX
2. **Processar Webhooks**: Receber notificações de pagamento
3. **Validar Dados**: Verificação adicional no servidor
4. **Gerenciar Status**: Controle de estados de pagamento

### Exemplo de Backend (Node.js):
```javascript
// Criar preferência PIX
app.post('/create-preference', async (req, res) => {
    const preference = {
        items: [{
            title: req.body.title,
            quantity: req.body.quantity,
            unit_price: req.body.price
        }],
        payer: {
            email: req.body.email
        }
    };
    
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
});
```

## 🐛 Solução de Problemas

### Problemas Comuns:

1. **"Chave pública não configurada"**
   - Verifique se substituiu `YOUR_PUBLIC_KEY`
   - Confirme se a chave está correta

2. **"Formulário não carrega"**
   - Verifique conexão com internet
   - Confirme se o SDK está carregando

3. **"Pagamento não processa"**
   - Em desenvolvimento, use cartões de teste
   - Verifique logs do console

### Cartões de Teste:
- **Aprovado**: 4009 1753 3280 6176
- **Recusado**: 4000 0000 0000 0002
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

## 📞 Suporte

- **Documentação Oficial**: [Mercado Pago Docs](https://www.mercadopago.com.br/developers)
- **Suporte Técnico**: [Central de Ajuda](https://www.mercadopago.com.br/ajuda)
- **Comunidade**: [Stack Overflow](https://stackoverflow.com/questions/tagged/mercadopago)

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e comerciais.

---

**Desenvolvido com ❤️ para integração Mercado Pago**
