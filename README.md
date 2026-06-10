# 🇧🇷 Bolão da Copa — Core-DF

Sistema de bolão para os jogos da Seleção Brasileira na Copa do Mundo.
Frontend puro (HTML + CSS + JS vanilla) com Firebase Firestore + Authentication como backend, hospedado no GitHub Pages.

---

## ✨ Funcionalidades

### Área pública (`index.html`)
- Identificação por nome (salvo em localStorage, sem cadastro)
- Painel com próximo jogo, contagem regressiva e prêmio acumulado
- Formulário de palpite (máx. 2 por participante, sem duplicatas)
- Modal com QR Code PIX e chave PIX após registrar palpite
- Lista de todos os palpites com status de pagamento em tempo real
- Histórico de premiações de jogos anteriores

### Painel administrativo (`admin.html`)
- Login com e-mail/senha (Firebase Authentication)
- Gestão de jogos: criar, editar, encerrar apostas, informar placar
- Gestão de pagamentos: confirmar / cancelar / reverter por palpite
- Apuração automática: calcula vencedores, prêmio e acumulado
- Resumo financeiro com exportação CSV
- Configurações: chave PIX, QR Code, valor por palpite, acumulado

---

## 🚀 Como configurar

### 1. Firebase — criar projeto
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto (ex: `bolao-coredf`)
3. Ative **Firestore Database** (modo produção)
4. Ative **Authentication** → método **E-mail/senha**
5. Em Authentication → Usuários → **Adicionar usuário**: informe o e-mail e senha do administrador

### 2. Preencher configuração do Firebase
Abra `js/firebase.js` e preencha os campos com os dados do seu projeto
(disponíveis em: Configurações do projeto → Seus apps → SDK):

```js
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.firebasestorage.app",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

### 3. Aplicar as Security Rules
No console do Firebase → Firestore → Regras, cole o conteúdo do arquivo `firestore.rules`.

### 4. Criar documento de configuração inicial
No Firestore, crie manualmente:
- Coleção: `config` → Documento: `bolao` com os campos:
  ```
  pix_chave:         ""          (string)
  pix_qrcode_url:    ""          (string — URL de imagem do QR Code)
  valor_por_palpite: 10          (number)
  acumulado_atual:   0           (number)
  ```

### 5. Hospedar no GitHub Pages
1. Faça push do projeto para um repositório GitHub
2. Em Settings → Pages → Source: selecione a branch `main` e pasta `/` (root)
3. Acesse a URL gerada pelo GitHub Pages

> ⚠️ Como o projeto usa ES Modules (`type="module"`), ele **não funciona abrindo os arquivos localmente** via `file://`. Use uma extensão como **Live Server** (VSCode) ou um servidor local simples:
> ```sh
> npx serve .
> ```

---

## 📁 Estrutura de arquivos

```
/
├── index.html          → Página pública
├── admin.html          → Painel administrativo
├── firestore.rules     → Regras de segurança do Firestore
├── css/
│   ├── style.css       → Estilos globais
│   └── admin.css       → Estilos do painel admin
└── js/
    ├── firebase.js     → Inicialização e config do Firebase
    ├── db.js           → Funções de leitura/escrita no Firestore
    ├── auth.js         → Funções de autenticação
    ├── palpites.js     → Lógica de registro e validação de palpites
    ├── jogos.js        → Lógica de jogos e contagem regressiva
    ├── apuracao.js     → Apuração de resultados e premiação
    └── ui.js           → Formatadores, toasts, modais e utilitários
```

---

## 📐 Estrutura do Firestore

| Coleção | Campos principais |
|---|---|
| `jogos` | `adversario`, `data`, `status`, `placar_brasil`, `placar_adversario`, `acumulado_anterior` |
| `palpites` | `jogo_id`, `participante_nome`, `gols_brasil`, `gols_adversario`, `status_pagamento`, `criado_em` |
| `apuracoes` | `jogo_id`, `adversario`, `placar_*`, `vencedores[]`, `valor_*`, `acumulado_*` |
| `config/bolao` | `pix_chave`, `pix_qrcode_url`, `valor_por_palpite`, `acumulado_atual` |

---

## ⚖️ Regras de negócio

1. **Prazo**: palpites encerram às 23h59 do dia anterior ao jogo
2. **Limite**: máximo 2 palpites por participante por jogo
3. **Unicidade**: dois palpites idênticos do mesmo participante não são permitidos
4. **Validade**: apenas palpites `confirmado` entram na apuração
5. **Acumulado**: sem vencedores → prêmio acumula para o próximo jogo
6. **Divisão**: múltiplos vencedores → prêmio dividido igualmente

---

## 🛠️ Stack

- HTML5 semântico · CSS3 puro · JavaScript ES6+ (módulos nativos)
- Firebase SDK v12+ via CDN
- Sem React, sem Vue, sem bundlers — funciona direto no browser
