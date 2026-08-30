import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import type { Plant } from '../types/plant';

export interface BancadaExportItem {
  name: string;
  count: number;
  url: string;
}

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

// Helper para desenhar placa de bancada em Canvas (50x30mm ou Display A5)
const renderBancadaToCanvas = async (
  bancada: BancadaExportItem,
  qrDataUrl: string,
  format: 'display_a5' | 'niimbot'
): Promise<HTMLCanvasElement> => {
  const isDisplay = format === 'display_a5';
  const width = isDisplay ? 700 : 500;
  const height = isDisplay ? 1000 : 300;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar o canvas 2D');

  // Fundo Branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  if (isDisplay) {
    // Moldura elegante para Display de Mesa A5
    ctx.strokeStyle = '#181514';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    ctx.strokeStyle = '#5E6B56';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    // Logotipo / Cabeçalho
    ctx.fillStyle = '#5E6B56';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TONS & FLORES', width / 2, 75);

    ctx.fillStyle = '#8C827A';
    ctx.font = 'italic 16px serif';
    ctx.fillText('Boutique de Plantas • Catálogo Físico', width / 2, 105);

    // Divisor
    ctx.strokeStyle = '#E6E2DE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 130);
    ctx.lineTo(width - 80, 130);
    ctx.stroke();

    // Título da Bancada
    ctx.fillStyle = '#181514';
    ctx.font = 'bold 36px serif';
    ctx.fillText(bancada.name.slice(0, 26), width / 2, 190);

    // Quantidade de vasos
    ctx.fillStyle = '#5E6B56';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`🌿 ${bancada.count} vasos disponíveis neste espaço`, width / 2, 230);

    return new Promise((resolve) => {
      const qrImg = new Image();
      qrImg.onload = () => {
        const qrSize = 360;
        ctx.drawImage(qrImg, (width - qrSize) / 2, 270, qrSize, qrSize);

        // Moldura em volta do QR
        ctx.strokeStyle = '#181514';
        ctx.lineWidth = 4;
        ctx.strokeRect((width - qrSize) / 2 - 6, 270 - 6, qrSize + 12, qrSize + 12);

        // Chamada de Ação
        ctx.fillStyle = '#181514';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('APONTE A CÂMERA DO CELULAR', width / 2, 695);

        ctx.fillStyle = '#665F59';
        ctx.font = '16px sans-serif';
        ctx.fillText('Consulte preços, necessidades de luz e regas desta bancada', width / 2, 735);

        // Rodapé
        ctx.fillStyle = '#5E6B56';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('tons-e-flores.com', width / 2, 940);

        resolve(canvas);
      };
      qrImg.onerror = () => resolve(canvas);
      qrImg.src = qrDataUrl;
    });
  } else {
    // Formato Térmico Niimbot (50x30mm)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('TONS & FLORES', 20, 36);

    ctx.font = 'bold 16px monospace';
    ctx.fillText('📍 BANCADA', 20, 64);

    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText(bancada.name.slice(0, 18), 20, 115);

    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(`• ${bancada.count} vasos aqui`, 20, 160);
    ctx.fillText('• Aponte a câmera', 20, 195);
    ctx.fillText('• Veja preços e rega', 20, 230);

    return new Promise((resolve) => {
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 300, 35, 180, 180);
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESCANEIE A BANCADA', 390, 240);
        resolve(canvas);
      };
      qrImg.onerror = () => resolve(canvas);
      qrImg.src = qrDataUrl;
    });
  }
};

export const labelExportService = {
  // ─────────────────────────────────────────────────────────────
  // ── MÉTODOS PARA ETIQUETAS DE VASOS ──────────────────────────
  // ─────────────────────────────────────────────────────────────

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

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Etiquetas_Tons_Flores_LibreOffice_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

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

  async exportThermalPdf(
    plants: Plant[],
    showPrice: boolean = true,
    showCareIcons: boolean = true
  ): Promise<void> {
    if (!plants.length) return;

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

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(1, 1, 48, 28);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      doc.text('TONS & FLORES', 2.5, 4.5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(6);
      doc.text(`#${plant.id}`, 2.5, 8);

      doc.setFont('helvetica', 'bold');
      const nameLength = plant.name.length;
      const nameFontSize = nameLength > 20 ? 6.5 : nameLength > 14 ? 7.5 : 8.5;
      doc.setFontSize(nameFontSize);
      doc.text(plant.name.slice(0, 22), 2.5, 12.5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5);
      doc.setTextColor(60, 60, 60);
      const subDesc = `${plant.potSize || ''}${plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}`;
      doc.text(subDesc.slice(0, 25), 2.5, 15.5);

      if (showCareIcons) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(30, 30, 30);
        const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
        const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
        doc.text(`• ${lightText}`, 2.5, 19.5);
        doc.text(`• ${waterText}`, 2.5, 22.5);
      }

      if (showPrice) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        doc.text(`R$ ${plant.price.toFixed(2).replace('.', ',')}`, 2.5, 27);
      }

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
          // Ignora caso falhe QR específico
        }
      }
    }

    doc.save(`Etiquetas_Termicas_Niimbot_50x30mm_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

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
  },

  // ─────────────────────────────────────────────────────────────
  // ── MÉTODOS PARA PLACAS DE BANCADA (SETORES) ─────────────────
  // ─────────────────────────────────────────────────────────────

  exportBancadasCsv(bancadas: BancadaExportItem[]): void {
    if (!bancadas.length) return;

    const headers = ['Bancada', 'Total_Vasos', 'Link_QR_Code'];

    const escapeCsv = (str: string | number | undefined | null): string => {
      if (str === undefined || str === null) return '';
      const text = String(str);
      if (text.includes(';') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows = bancadas.map(b => [
      b.name,
      b.count,
      b.url
    ].map(escapeCsv).join(';'));

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bancadas_Tons_Flores_LibreOffice_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportBancadasXls(bancadas: BancadaExportItem[]): void {
    if (!bancadas.length) return;

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
 </Styles>
 <Worksheet ss:Name="Bancadas_Niimbot">
  <Table>
   <Column ss:Width="200"/>
   <Column ss:Width="80"/>
   <Column ss:Width="300"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Bancada</Data></Cell>
    <Cell><Data ss:Type="String">Total_Vasos</Data></Cell>
    <Cell><Data ss:Type="String">Link_QR_Code</Data></Cell>
   </Row>`;

    bancadas.forEach(b => {
      xml += `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(b.name)}</Data></Cell>
    <Cell><Data ss:Type="Number">${b.count}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(b.url)}</Data></Cell>
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bancadas_Tons_Flores_Niimbot_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async exportBancadasThermalPdf(bancadas: BancadaExportItem[]): Promise<void> {
    if (!bancadas.length) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [30, 50]
    });

    for (let i = 0; i < bancadas.length; i++) {
      const b = bancadas[i];
      if (i > 0) {
        doc.addPage([50, 30], 'landscape');
      }

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(1, 1, 48, 28);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 0, 0);
      doc.text('TONS & FLORES', 2.5, 4.5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(6);
      doc.text('📍 BANCADA', 2.5, 8);

      doc.setFont('helvetica', 'bold');
      const nameLength = b.name.length;
      const nameFontSize = nameLength > 20 ? 6.5 : nameLength > 14 ? 7.5 : 8.5;
      doc.setFontSize(nameFontSize);
      doc.text(b.name.slice(0, 20), 2.5, 12.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(40, 40, 40);
      doc.text(`• ${b.count} vasos neste setor`, 2.5, 16.5);
      doc.text('• Aponte a câmera', 2.5, 19.5);
      doc.text('• Veja preços e cuidados', 2.5, 22.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(0, 0, 0);
      doc.text('Catálogo Físico', 2.5, 27);

      const svgElement = document.getElementById('qr-svg-bancada') as SVGElement | null;
      if (svgElement) {
        try {
          const qrDataUrl = await svgToDataUrl(svgElement, 250);
          doc.addImage(qrDataUrl, 'PNG', 31, 3.5, 16.5, 16.5);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(4);
          doc.setTextColor(0, 0, 0);
          doc.text('ESCANEIE A BANCADA', 39.25, 22, { align: 'center' });
        } catch {
          // Ignora
        }
      }
    }

    doc.save(`Faixas_Bancadas_Niimbot_50x30mm_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

  async exportBancadasDisplayA5Pdf(bancadas: BancadaExportItem[]): Promise<void> {
    if (!bancadas.length) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5' // 148 x 210 mm
    });

    for (let i = 0; i < bancadas.length; i++) {
      const b = bancadas[i];
      if (i > 0) {
        doc.addPage('a5', 'portrait');
      }

      // Moldura externa
      doc.setDrawColor(24, 21, 20);
      doc.setLineWidth(1.5);
      doc.rect(5, 5, 138, 200);

      doc.setDrawColor(94, 107, 86);
      doc.setLineWidth(0.5);
      doc.rect(8, 8, 132, 194);

      // Logotipo / Cabeçalho
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(94, 107, 86);
      doc.text('TONS & FLORES', 74, 25, { align: 'center' });

      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(140, 130, 122);
      doc.text('Boutique de Plantas • Catálogo Físico', 74, 31, { align: 'center' });

      // Linha divisória
      doc.setDrawColor(230, 226, 222);
      doc.setLineWidth(0.5);
      doc.line(25, 36, 123, 36);

      // Título da Bancada
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(24, 21, 20);
      doc.text(b.name, 74, 48, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(94, 107, 86);
      doc.text(`🌿 ${b.count} vasos disponíveis neste espaço`, 74, 56, { align: 'center' });

      // QR Code
      const svgElement = document.getElementById('qr-svg-bancada') as SVGElement | null;
      if (svgElement) {
        try {
          const qrDataUrl = await svgToDataUrl(svgElement, 400);
          const qrSize = 65;
          const qrX = (148 - qrSize) / 2;
          doc.addImage(qrDataUrl, 'PNG', qrX, 66, qrSize, qrSize);

          doc.setDrawColor(24, 21, 20);
          doc.setLineWidth(0.8);
          doc.rect(qrX - 1.5, 64.5, qrSize + 3, qrSize + 3);
        } catch {
          // Ignora
        }
      }

      // Instrução
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(24, 21, 20);
      doc.text('APONTE A CÂMERA DO CELULAR', 74, 145, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(102, 95, 89);
      doc.text('Consulte preços, necessidades de luz e regas desta bancada', 74, 152, { align: 'center' });

      // Rodapé
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(94, 107, 86);
      doc.text('tons-e-flores.com', 74, 192, { align: 'center' });
    }

    doc.save(`Placas_Bancadas_Display_A5_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

  async exportBancadasZip(
    bancadas: BancadaExportItem[],
    format: 'display_a5' | 'niimbot',
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    if (!bancadas.length) return;

    const zip = new JSZip();
    const folderName = format === 'display_a5' ? 'Placas_Bancadas_Display_A5' : 'Faixas_Bancadas_Niimbot_50x30';
    const folder = zip.folder(folderName);

    const svgElement = document.getElementById('qr-svg-bancada') as SVGElement | null;
    let qrDataUrl = '';
    if (svgElement) {
      try {
        qrDataUrl = await svgToDataUrl(svgElement, 400);
      } catch {
        // Fallback
      }
    }

    for (let i = 0; i < bancadas.length; i++) {
      const b = bancadas[i];
      if (onProgress) onProgress(i + 1, bancadas.length);

      try {
        const canvas = await renderBancadaToCanvas(b, qrDataUrl, format);
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blobRes) => resolve(blobRes), 'image/png');
        });

        if (blob && folder) {
          const cleanName = b.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
          folder.file(`Placa_${cleanName}.png`, blob);
        }
      } catch (err) {
        console.error(`Erro ao gerar placa para ${b.name}:`, err);
      }
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipContent);
    link.download = `${folderName}_Lote.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
