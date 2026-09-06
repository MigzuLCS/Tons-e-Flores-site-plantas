/**
 * Tons & Flores • Catálogo Botânico & Gestão de Plantas
 * Copyright (c) 2026 Miguel Luiz (@MigzuLCS). Todos os direitos reservados.
 * 
 * LICENÇA DE USO ACADÊMICO / ACADEMIC VIEW-ONLY LICENSE
 * Este código-fonte é disponibilizado publicamente exclusivamente para fins de consulta
 * acadêmica e avaliação técnica de portfólio. É proibida qualquer cópia, alteração,
 * distribuição, uso comercial ou derivação deste código sem autorização expressa prévia.
 * O software é fornecido "COMO ESTÁ" (AS IS), sem garantias de qualquer tipo.
 * Consulte o arquivo LICENSE na raiz do projeto para obter os termos integrais.
 */

/**
 * Utilitário para redimensionamento e compactação de imagens no navegador.
 * Converte imagens para WebP (com fallback para JPEG), limitando as dimensões máximas
 * e aplicando compressão com perdas perceptualmente imperceptíveis.
 */

export interface CompressionOptions {
  maxDimension?: number; // Padrão: 800px
  quality?: number;      // Padrão: 0.8 (80%)
  mimeType?: string;     // Padrão: 'image/webp'
}

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  mimeType: string;
  savingsPercent: number;
}

/**
 * Compacta e redimensiona um arquivo de imagem no navegador.
 *
 * @param file Arquivo selecionado no input de arquivo
 * @param options Opções de compactação (maxDimension: 800, quality: 0.8, mimeType: 'image/webp')
 * @returns Resultado contendo o dataURL WebP e métricas de redução
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxDimension = 800,
    quality = 0.8,
    mimeType = 'image/webp',
  } = options;

  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Falha ao processar o conteúdo da imagem.'));

      img.onload = () => {
        let { width, height } = img;

        // Calcula proporção para não ultrapassar maxDimension na maior dimensão
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
        }

        // Suavização de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Desenha no canvas redimensionado
        ctx.drawImage(img, 0, 0, width, height);

        // Gera dataUrl em WebP
        let finalMimeType = mimeType;
        let dataUrl = canvas.toDataURL(finalMimeType, quality);

        // Fallback: se o navegador não suportar WebP no canvas (retornando PNG), usa JPEG
        if (!dataUrl.startsWith(`data:${mimeType}`)) {
          finalMimeType = 'image/jpeg';
          dataUrl = canvas.toDataURL(finalMimeType, quality);
        }

        // Calcula tamanho aproximado em bytes do base64 gerado
        const base64Length = dataUrl.split(',')[1]?.length || 0;
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);

        const savingsPercent = originalSizeBytes > 0
          ? Math.max(0, Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100))
          : 0;

        resolve({
          dataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          width,
          height,
          mimeType: finalMimeType,
          savingsPercent,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Formata bytes em formato legível (KB, MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
