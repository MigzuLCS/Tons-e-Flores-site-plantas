import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { Plant } from '../types/plant';

// Helper para converter SVG para DataURL de imagem PNG em alta resolução
const svgToDataUrl = (svgElement: SVGElement, size: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobURL);
          reject(new Error('Falha ao obter contexto 2D do Canvas'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(blobURL);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(blobURL);
        reject(err);
      };

      img.src = blobURL;
    } catch (e) {
      reject(e);
    }
  });
};

// Helper para desenhar etiqueta 50x30mm (500x300 px) em Canvas para PNG/ZIP
const renderTagToCanvas = async (
  plant: Plant,
  qrDataUrl: string,
  showPrice: boolean = true,
  showCareIcons: boolean = true
): Promise<HTMLCanvasElement> => {
  const width = 500;
  const height = 300;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar o canvas 2D');

  // Fundo branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Borda preta
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Cabeçalho: TONS & FLORES e #ID
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillText('TONS & FLORES', 20, 36);

  ctx.font = 'bold 18px monospace';
  ctx.fillText(`#${plant.id}`, 20, 62);

  // Nome da Planta
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.fillText(plant.name.slice(0, 18), 20, 110);

  // Subtítulo: Vaso e Cultivo
  ctx.font = 'italic 16px Arial, sans-serif';
  const subDesc = `${plant.potSize || ''}${plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}`;
  ctx.fillText(subDesc.slice(0, 22), 20, 138);

  // Dicas de Cuidado
  if (showCareIcons) {
    ctx.font = '15px Arial, sans-serif';
    const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
    const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
    ctx.fillText(`• ${lightText}`, 20, 185);
    ctx.fillText(`• ${waterText}`, 20, 212);
  }

  // Preço
  if (showPrice) {
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.fillText(`R$ ${plant.price.toFixed(2).replace('.', ',')}`, 20, 272);
  }

  // Carregar e desenhar o QR Code
  return new Promise((resolve) => {
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 300, 35, 180, 180);
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ESCANEIE O QR', 390, 235);
      resolve(canvas);
    };
    qrImg.onerror = () => resolve(canvas);
    qrImg.src = qrDataUrl;
  });
};

export const labelExportService = {
  /**
   * Exporta a planilha em CSV com BOM UTF-8 e separador ';'
   * Abre perfeitamente no LibreOffice Calc e no aplicativo da Niimbot
   */
  exportToCsv(plants: Plant[]): void {
    if (!plants.length) return;

    const headers = [
      'ID',
      'Nome',
      'Nome_Curto',
      'Subtitulo_Vaso',
      'Cuidados_Luz',
      'Cuidados_Rega',
      'Preco_Formatado',
      'Preco_Numero',
      'Link_QR_Code',
      'Localizacao'
    ];

    const escapeCsv = (str: string | number | undefined | null): string => {
      if (str === undefined || str === null) return '';
      const text = String(str);
      if (text.includes(';') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    const rows = plants.map(plant => {
      const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
      const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
      const subDesc = `${plant.potSize || ''}${plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}`;
      const plantUrl = `${baseUrl}#p-${plant.id}`;
      const precoFormatado = `R$ ${plant.price.toFixed(2).replace('.', ',')}`;

      return [
        plant.id,
        plant.name,
        plant.name.slice(0, 20),
        subDesc,
        lightText,
        waterText,
        precoFormatado,
        plant.price.toFixed(2),
        plantUrl,
        plant.location || 'Sem Bancada'
      ].map(escapeCsv).join(';');
    });

    // Adiciona o BOM UTF-8 (\uFEFF) para garantir que o LibreOffice abra sem erro de codificação
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Etiquetas_Tons_Flores_LibreOffice_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Exporta a planilha em formato Excel XML (.xls)
   * Totalmente compatível com LibreOffice Calc e Excel
   */
  exportToXls(plants: Plant[]): void {
    if (!plants.length) return;

    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    const escapeXml = (unsafe: string | number | undefined | null) => {
      if (unsafe === undefined || unsafe === null) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#5E6B56" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Price">
   <NumberFormat ss:Format="&quot;R$&quot;\ #,##0.00"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Etiquetas_Niimbot">
  <Table>
   <Column ss:Width="50"/>
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="130"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="80"/>
   <Column ss:Width="250"/>
   <Column ss:Width="120"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ID</Data></Cell>
    <Cell><Data ss:Type="String">Nome</Data></Cell>
    <Cell><Data ss:Type="String">Nome_Curto</Data></Cell>
    <Cell><Data ss:Type="String">Subtitulo_Vaso</Data></Cell>
    <Cell><Data ss:Type="String">Cuidados_Luz</Data></Cell>
    <Cell><Data ss:Type="String">Cuidados_Rega</Data></Cell>
    <Cell><Data ss:Type="String">Preco_Formatado</Data></Cell>
    <Cell><Data ss:Type="String">Preco_Numero</Data></Cell>
    <Cell><Data ss:Type="String">Link_QR_Code</Data></Cell>
    <Cell><Data ss:Type="String">Localizacao</Data></Cell>
   </Row>`;

    plants.forEach(plant => {
      const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
      const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
      const subDesc = `${plant.potSize || ''}${plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}`;
      const plantUrl = `${baseUrl}#p-${plant.id}`;
      const precoFormatado = `R$ ${plant.price.toFixed(2).replace('.', ',')}`;

      xml += `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(plant.id)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(plant.name)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(plant.name.slice(0, 20))}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(subDesc)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(lightText)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(waterText)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(precoFormatado)}</Data></Cell>
    <Cell ss:StyleID="Price"><Data ss:Type="Number">${plant.price.toFixed(2)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(plantUrl)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(plant.location || 'Sem Bancada')}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Etiquetas_Tons_Flores_Niimbot_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Gera um PDF térmico multipáginas com tamanho exato de 50x30mm por página
   * para importação e impressão direta no aplicativo da Niimbot
   */
  async exportThermalPdf(
    plants: Plant[],
    showPrice: boolean = true,
    showCareIcons: boolean = true
  ): Promise<void> {
    if (!plants.length) return;

    // Criar documento PDF com páginas de 50mm largura x 30mm altura em modo paisagem
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [30, 50]
    });

    for (let i = 0; i < plants.length; i++) {
      const plant = plants[i];
      if (i > 0) {
        doc.addPage([50, 30], 'landscape');
      }

      // Borda preta fina
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(1, 1, 48, 28);

      // Cabeçalho: TONS & FLORES e #ID
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      doc.text('TONS & FLORES', 2.5, 4.5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(6);
      doc.text(`#${plant.id}`, 2.5, 8);

      // Nome da planta (com ajuste automático de tamanho para não vazar)
      doc.setFont('helvetica', 'bold');
      const nameLength = plant.name.length;
      const nameFontSize = nameLength > 20 ? 6.5 : nameLength > 14 ? 7.5 : 8.5;
      doc.setFontSize(nameFontSize);
      doc.text(plant.name.slice(0, 22), 2.5, 12.5);

      // Subtítulo (Vaso / Cultivo)
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5);
      doc.setTextColor(60, 60, 60);
      const subDesc = `${plant.potSize || ''}${plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}`;
      doc.text(subDesc.slice(0, 25), 2.5, 15.5);

      // Cuidados
      if (showCareIcons) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(30, 30, 30);
        const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
        const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
        doc.text(`• ${lightText}`, 2.5, 19.5);
        doc.text(`• ${waterText}`, 2.5, 22.5);
      }

      // Preço
      if (showPrice) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        doc.text(`R$ ${plant.price.toFixed(2).replace('.', ',')}`, 2.5, 27);
      }

      // Buscar QR Code no DOM ou renderizar
      const svgElement = document.getElementById(`qr-svg-${plant.id}`) as SVGElement | null;
      if (svgElement) {
        try {
          const qrDataUrl = await svgToDataUrl(svgElement, 250);
          doc.addImage(qrDataUrl, 'PNG', 31, 3.5, 16.5, 16.5);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(4);
          doc.setTextColor(0, 0, 0);
          doc.text('ESCANEIE O QR', 39.25, 22, { align: 'center' });
        } catch {
          // Fallback caso não renderize a imagem
        }
      }
    }

    doc.save(`Etiquetas_Termicas_Niimbot_50x30mm_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

  /**
   * Baixa todas as etiquetas selecionadas compactadas em um arquivo ZIP
   */
  async exportZipImages(
    plants: Plant[],
    showPrice: boolean = true,
    showCareIcons: boolean = true,
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    if (!plants.length) return;

    const zip = new JSZip();
    const folder = zip.folder('Etiquetas_Niimbot_50x30');

    for (let i = 0; i < plants.length; i++) {
      const plant = plants[i];
      if (onProgress) onProgress(i + 1, plants.length);

      const svgElement = document.getElementById(`qr-svg-${plant.id}`) as SVGElement | null;
      if (!svgElement) continue;

      try {
        const qrDataUrl = await svgToDataUrl(svgElement, 300);
        const canvas = await renderTagToCanvas(plant, qrDataUrl, showPrice, showCareIcons);
        
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (blob && folder) {
          const cleanName = plant.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
          folder.file(`Etiqueta_${plant.id}_${cleanName}.png`, blob);
        }
      } catch (err) {
        console.error(`Erro ao gerar etiqueta ${plant.id}:`, err);
      }
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipContent);
    link.download = `Etiquetas_Niimbot_Lote_${plants.length}_itens.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
