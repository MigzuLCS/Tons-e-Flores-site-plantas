import { supabase, isSupabaseConfigured } from './supabaseClient';

export const STORAGE_BUCKET = 'plant-photos';

/**
 * Converte uma string base64 / Data URL em um Blob binário de forma robusta e universal.
 */
async function dataUrlToBlob(dataUrl: string): Promise<{ blob: Blob; contentType: string }> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return {
      blob,
      contentType: blob.type || 'image/webp',
    };
  } catch {
    // Fallback manual caso fetch não suporte data URL no ambiente
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/webp';
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return {
      blob: new Blob([uint8Array], { type: contentType }),
      contentType,
    };
  }
}

/**
 * Faz upload de uma imagem (Data URL / base64) para o Supabase Storage
 * e retorna a URL pública permanente da imagem.
 *
 * @param plantId Código da planta (ex: TF-001) para organizar os arquivos
 * @param dataUrl Imagem em formato Data URL gerada pelo compressor WebP
 * @returns URL pública permanente ou a dataURL original como fallback em caso de erro
 */
export async function uploadPlantPhoto(plantId: string, dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  if (!isSupabaseConfigured) {
    console.warn('[storageService] Supabase não está configurado no .env. Mantendo imagem em Data URL.');
    return dataUrl;
  }

  try {
    const { blob, contentType } = await dataUrlToBlob(dataUrl);
    const extension = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg';
    const cleanId = (plantId || 'plant').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const fileName = `photos/${cleanId}_${Date.now()}.${extension}`;

    console.log(`[storageService] Enviando foto para o Supabase Storage (${STORAGE_BUCKET}/${fileName})...`);

    // Upload do arquivo para o bucket
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType,
        cacheControl: '31536000', // Cache longo de 1 ano no CDN
        upsert: true,
      });

    if (uploadError) {
      console.error(
        `[storageService] Falha ao enviar foto para o bucket '${STORAGE_BUCKET}'. ` +
        `Erro: ${uploadError.message}`,
        uploadError
      );
      // Fallback: mantém o dataURL para não perder a foto do usuário
      return dataUrl;
    }

    // Obtém a URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    console.log(`[storageService] ✅ Foto enviada com sucesso: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[storageService] Exceção no upload de foto da planta:', err);
    return dataUrl;
  }
}

/**
 * Remove uma foto do Supabase Storage caso ela pertença ao bucket da loja.
 * Evita acúmulo de arquivos órfãos quando uma planta for excluída ou a foto for trocada.
 */
export async function deletePlantPhoto(imageUrl: string): Promise<void> {
  if (!imageUrl || !isSupabaseConfigured) return;

  try {
    // Verifica se a URL pertence ao Supabase Storage e ao nosso bucket
    const bucketIdentifier = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    if (!imageUrl.includes(bucketIdentifier)) {
      return; // Foto externa (ex: Unsplash) ou Data URL, não precisa deletar
    }

    const filePath = imageUrl.split(bucketIdentifier)[1];
    if (!filePath) return;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.warn('[storageService] Erro ao remover foto antiga do Supabase Storage:', error.message);
    }
  } catch (err) {
    console.warn('[storageService] Exceção ao remover foto do storage:', err);
  }
}

export const storageService = {
  uploadPlantPhoto,
  deletePlantPhoto,
  STORAGE_BUCKET,
};
