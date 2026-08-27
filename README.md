# 🌿 Tons & Flores • Catálogo Botânico & Gestão de Plantas

Uma aplicação web moderna, elegante e intuitiva desenvolvida para apresentação de catálogo botânico, vitrine digital interativa e controle de estoque de plantas ornamentais, flores, suculentas e folhagens.

---

## ✨ Principais Funcionalidades

### 🛍️ 1. Vitrine Digital & Catálogo Interativo
- **Busca em Tempo Real:** Pesquise por nome popular, nome científico ou categoria.
- **Filtros Avançados:**
  - **Categorias Personalizadas:** *Folhagens*, *Suculentas & Cactos*, *Flores*, *Pendentes*, *Arbustos & Árvores*, *Ervas & Temperos* (com suporte a criação e exclusão dinâmica de categorias).
  - **Necessidade de Iluminação:** *Sol Pleno*, *Meia Sombra*, *Sombra Difusa*.
  - **Frequência de Rega:** *Pouca Rega (Solo Seco)*, *Moderada (1-2x/sem)*, *Solo Sempre Úmido*.
  - **Filtro Pet Friendly:** Encontre rapidamente plantas seguras para cães e gatos com indicador visual.
- **Ficha Botânica Detalhada:** Modal rico com informações completas de cultivo, irrigação, iluminação, toxicidade, pragas comuns, ciclo de vida e localização no viveiro/estufa.

### 🌿 2. Motor Híbrido de Classificação Botânica (100% Gratuito)
- **Acervo Local Brasileiro (0ms):** Mais de 30 espécies e gêneros comerciais pré-cadastrados com preenchimento instantâneo no formulário.
- **Inteligência Artificial Opcional (Google Gemini Flash):** Fichas técnicas geradas sob medida em português brasileiro quando uma chave gratuita estiver configurada.
- **Enciclopédia Aberta (Wikipedia / Wikimedia API):** Fallback público sem necessidade de chave de API ou cadastro.
- **Dedução Inteligente de Categorias (`inferCategory`):** Auto-seleciona a categoria correta da loja ao escolher qualquer planta.
- *Documentos de Arquitetura:*
  - [Plano de Arquitetura Botânica](docs/PLANO_ARQUITETURA_BOTANICA.md)
  - [Plano de Persistência & Cache do Acervo Gemini](docs/PLANO_PERSISTENCIA_ACERVO_GEMINI.md)

### 📦 3. Painel Administrativo & Gestão de Estoque
- **Gestão Completa de Plantas (CRUD):** Cadastro com upload e compressão automática de fotos, edição, exclusão e visualização rápida.
- **Controle de Status:** *Disponível*, *Reservada*, *Vendida*.
- **Identificação Exclusiva:** Geração automática e sequencial de códigos de estoque (ex: `TF-001`, `TF-002`).
- **Gerenciador de Categorias:** Adicione e remova categorias personalizadas em tempo real.
- **Sincronização em Nuvem:** Suporte a **Supabase (PostgreSQL)** com persistência local de fallback via `localStorage`.
- **Tema Claro / Escuro:** Alternância de tema com paleta terrosa inspirada em folhas, terracota e tons botânicos.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com design system botânico personalizado
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Banco de Dados & Backend:** [Supabase](https://supabase.com/) (PostgreSQL) / Fallback Local
- **IA & Classificação Botânica:** Motor Híbrido Próprio + [Google Gemini API](https://ai.google.dev/) + Wikipedia API

---

## 📁 Estrutura de Pastas

```
├── docs/                               # Documentação e planos de arquitetura
│   ├── PLANO_ARQUITETURA_BOTANICA.md   # Detalhes do motor botânico híbrido
│   └── PLANO_PERSISTENCIA_ACERVO_GEMINI.md # Plano de cache e persistência com Gemini
├── src/
│   ├── components/                     # Componentes da interface
│   │   ├── AdminPanel.tsx              # Painel de administração e estoque
│   │   ├── Navbar.tsx                  # Barra de navegação e controles
│   │   ├── PlantCard.tsx               # Card individual de planta na vitrine
│   │   ├── PlantDetailModal.tsx        # Modal com ficha botânica detalhada
│   │   ├── PlantFormModal.tsx          # Modal de cadastro/edição com busca inteligente
│   │   └── ShowcaseView.tsx            # Visualização da vitrine com filtros
│   ├── services/                       # Camada de serviços e dados
│   │   ├── configService.ts            # Gerenciamento de categorias e configurações
│   │   ├── plantClassificationService.ts # Motor híbrido de classificação botânica
│   │   ├── plantService.ts             # CRUD de plantas e integração Supabase
│   │   └── supabaseClient.ts           # Cliente de conexão Supabase
│   ├── types/                          # Definições TypeScript
│   │   └── plant.ts                    # Interfaces de dados botânicos
│   ├── App.tsx                         # Componente raiz da aplicação
│   └── main.tsx                        # Ponto de entrada React
└── tailwind.config.js                  # Configurações de cores e tema botânico
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar, modificar e contribuir! 🌿
