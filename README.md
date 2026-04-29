# ⚡ VoltRide — MVP

Plataforma de locação de carros elétricos para motoristas de aplicativos.

## 🚀 Como rodar localmente

```bash
cd voltride
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🔐 Credenciais de demo

| Role      | Email                    | Senha  |
|-----------|--------------------------|--------|
| Motorista | carlos@voltride.com      | 123456 |
| Admin     | admin@voltride.com       | 123456 |

## 🌐 Deploy no Vercel

### Opção 1: Deploy Automático via GitHub (Recomendado)

1. **Fazer push do código para GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/voltride.git
   git push -u origin main
   ```

2. **Conectar ao Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Selecione seu repositório GitHub
   - Vercel detectará automaticamente as configurações (Vite + React)
   - Clique em "Deploy"

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

### Variáveis de Ambiente

Se precisar de variáveis de ambiente no Vercel:

1. Acesse o painel do projeto no Vercel
2. Vá para "Settings" → "Environment Variables"
3. Adicione as variáveis necessárias

## 🧩 Funcionalidades implementadas

- ✅ Autenticação mock com Zustand
- ✅ Dashboard do motorista (carro ativo, bateria, recargas)
- ✅ Listagem e filtro de veículos com reserva
- ✅ Estações de recarga com preço dinâmico (pico/off-peak)
- ✅ Agendamento de recarga (gratuita ou paga)
- ✅ Histórico de transações e cancelamento de reservas
- ✅ Dashboard admin com gráficos (Recharts)
- ✅ Sugestões inteligentes automáticas
- ✅ Compliance: aviso de cobrança antecipada
- ✅ Penalidade por cancelamento tardio
- ✅ UI dark/electric com Tailwind CSS
- ✅ Compatível com Vercel (SPA com rewrites configurados)

## 🏗️ Estrutura

```
src/
├── types/          # Tipos TypeScript
├── mock/           # Dados mockados
├── store/          # Zustand store (estado global)
├── components/
│   ├── layout/     # Sidebar, Header
│   └── shared/     # BatteryIndicator, StatCard, Modal, etc.
└── pages/          # Login, Dashboard, Cars, Stations, Payments, Admin
```

## 🔧 Stack

- Vite + React + TypeScript
- Zustand (estado global)
- Tailwind CSS (estilo)
- Recharts (gráficos)
- React Router v6
- date-fns (formatação de datas)
- Lucide React (ícones)

## 📝 Arquivos de Configuração para Vercel

O projeto inclui:
- **vercel.json**: Configuração de build e rewrites para SPA
- **.gitignore**: Arquivos a ignorar no Git
- **.env.example**: Exemplo de variáveis de ambiente
- **public/volt.svg**: Favicon do projeto

## ⚙️ Troubleshooting

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Rotas não funcionam após deploy
- Verifique se o arquivo `vercel.json` está na raiz do projeto
- Confirme que as rewrites estão configuradas corretamente

### Erro de build no Vercel
- Verifique os logs de build no painel do Vercel
- Certifique-se de que o `package.json` tem o script `build`
