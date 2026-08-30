# Plano de Implementação: Integração de Etiquetas Niimbot B1 e LibreOffice

## 1. Contexto & Objetivos
A impressora térmica **Niimbot B1** utiliza comunicação prioritária através do software Niimbot PC. Para permitir impressão rápida, sem distorção e com alta produtividade, este módulo fornece:
1. **Exportação de Planilhas compatíveis com LibreOffice Calc (.csv UTF-8 com BOM e .xlsx)** estruturadas para o recurso de *Importação de Dados / Impressão em Lote* do Niimbot.
2. **Gerador de PDF Térmico 50x30mm**: Criação de documento PDF com páginas individuais milimetricamente calibradas para importação direta de PDFs no Niimbot.
3. **Download de Etiquetas em Lote (.ZIP)**: Pacote com todas as artes geradas em PNG alta resolução 203 DPI.
4. **Guia Passo a Passo no Sistema**: Instruções visuais de como montar o template 50x30mm no app Niimbot e vincular o QR Code e dados da planilha.

---

## 2. Estrutura de Dados da Planilha
Colunas exportadas:
* `ID`: Código único do exemplar (ex: `#104`).
* `Nome`: Nome popular completo da planta.
* `Nome_Curto`: Versão resumida para etiquetas compactas.
* `Subtitulo_Vaso`: Tamanho do vaso e tipo de cultivo (ex: `Vaso Cuia 21 • Tradicional`).
* `Cuidados_Luz`: Nível de luz (ex: `Sol Pleno`, `Meia Sombra`, `Sombra`).
* `Cuidados_Rega`: Frequência de rega recomendada (ex: `Pouca Rega`, `Rega 1-2x/sem`, `Solo Úmido`).
* `Preco_Formatado`: Preço em Real brasileiro (ex: `R$ 45,00`).
* `Preco_Numero`: Valor numérico (ex: `45.00`).
* `Link_QR_Code`: URL absoluta para abrir a ficha digital da planta no catálogo físico.
* `Localizacao`: Identificação da bancada/setor na estufa.

---

## 3. Especificação do PDF Térmico 50x30mm
* **Dimensões**: 50.0mm x 30.0mm.
* **Orientação**: Paisagem (Landscape).
* **Margens**: 0mm.
* **Elementos**:
  - Logotipo TONS & FLORES e Tag ID.
  - Nome em destaque legível e subtítulo.
  - Indicadores de cuidados essenciais (Luz e Rega).
  - Preço em destaque.
  - QR Code nítido posicionado à direita com legenda de chamada.
