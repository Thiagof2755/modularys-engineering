import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityData } from './Apontamentos'; // Assumindo que ActivityData está definido aqui

// Interfaces (mantidas como estão, pois são de dados)
interface ActivityStats {
    total: number;
    totalTime: string;
    uniqueUsers: number;
    avgTime: string;
}

interface ExportOptions {
    includeStats?: boolean;
}

// Design System Aprimorado: Mais semântico e com opções de fontes
const DesignSystem = {
    colors: {
        primary: [28, 100, 242] as [number, number, number], // Azul institucional
        secondary: [108, 117, 125] as [number, number, number], // Cinza médio para texto secundário
        accent: [255, 193, 7] as [number, number, number], // Amarelo para destaque (opcional)
        background: {
            page: [255, 255, 255] as [number, number, number], // Branco puro para fundo da página
            card: [248, 249, 250] as [number, number, number], // Cinza muito claro para cards
            lightGray: [233, 236, 239] as [number, number, number], // Cinza claro para linhas/divisores
        },
        text: {
            primary: [33, 37, 41] as [number, number, number], // Preto quase puro para texto principal
            secondary: [108, 117, 125] as [number, number, number], // Cinza médio para texto secundário
            muted: [173, 181, 189] as [number, number, number], // Cinza claro para legendas
            white: [255, 255, 255] as [number, number, number],
        },
        border: [222, 226, 230] as [number, number, number], // Borda sutil
    },
    typography: {
        fontFamily: 'helvetica', // jsPDF default font
        sizes: {
            h1: 22,      // Título principal do relatório
            h2: 16,      // Título de seção
            h3: 13,      // Subtítulo / Título de card
            body: 10,    // Texto corpo padrão
            small: 9,    // Texto menor para detalhes
            caption: 8,  // Legendas e rodapé
        },
        weights: {
            normal: 'normal' as const,
            bold: 'bold' as const,
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },
    layout: {
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        cardPadding: 10,
        lineHeight: 1.2, // Multiplicador para altura da linha
    },
    borders: {
        radius: 2, // Raio para bordas arredondadas (visual, não funcional no jspdf rect)
        thickness: 0.2,
    },
    shadows: {
        // Simulação de sombra com bordas mais escuras ou duplas
    }
};

// Funções Utilitárias Aprimoradas (mantidas, são eficientes)
const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    if (hours === 0 && minutes === 0) return '0min';
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
};

const formatDate = (dateStr: string): string => {
    try {
        const parts = dateStr.split('/');
        if (parts.length !== 3) return dateStr;
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}/${month}/${year}`;
    } catch (error) {
        return dateStr;
    }
};

const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

class PDFExport {
    // Helper para definir estilos de texto
    private static setTextStyle(doc: jsPDF, size: number, weight: 'normal' | 'bold', color: [number, number, number]) {
        doc.setFont(DesignSystem.typography.fontFamily, weight);
        doc.setFontSize(size);
        doc.setTextColor(...color);
    }

    // Header limpo e profissional
    private static addHeader(doc: jsPDF, activityData: ActivityData): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = layout.margins.top;

        // Título principal
        this.setTextStyle(doc, typography.sizes.h1, typography.weights.bold, colors.text.primary);
        doc.text(activityData.dashboard_info.title, layout.margins.left, yPos);

        // Linha divisória mais proeminente
        yPos += typography.sizes.h1 / 2 + spacing.sm;
        doc.setDrawColor(...colors.background.lightGray);
        doc.setLineWidth(1); // Linha mais grossa
        doc.line(layout.margins.left, yPos, pageWidth - layout.margins.right, yPos);

        // Informações do período e atualização
        yPos += spacing.lg;
        this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.text.secondary);
        doc.text(`Período: ${activityData.dashboard_info.date}`, layout.margins.left, yPos);
        doc.text(`Atualizado: ${activityData.dashboard_info.last_update}`, layout.margins.left, yPos + spacing.sm);

        return yPos + spacing.xl;
    }

    // Seção de empresas com estilo de "card"
    private static addCompaniesSection(doc: jsPDF, activityData: ActivityData, yPos: number): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();
        const sectionWidth = pageWidth - (layout.margins.left + layout.margins.right);
        const cardWidth = sectionWidth / 2 - spacing.sm; // Duas colunas

        // Título da seção
        this.setTextStyle(doc, typography.sizes.h2, typography.weights.bold, colors.text.primary);
        doc.text('Informações das Empresas', layout.margins.left, yPos);
        yPos += spacing.md;

        const startY = yPos;
        let currentX = layout.margins.left;

        // Função auxiliar para desenhar um card de empresa
        const drawCompanyCard = (label: string, companyName: string, x: number, y: number, width: number): number => {
            const cardHeight = 40; // Altura fixa para os cards
            doc.setFillColor(...colors.background.card);
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(DesignSystem.borders.thickness);
            doc.rect(x, y, width, cardHeight, 'FD'); // Fundo e borda

            let textY = y + layout.cardPadding;
            this.setTextStyle(doc, typography.sizes.small, typography.weights.bold, colors.text.secondary);
            doc.text(label, x + layout.cardPadding, textY);

            textY += typography.sizes.small + spacing.xs;
            this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.text.primary);
            const companyLines = doc.splitTextToSize(companyName, width - (layout.cardPadding * 2));
            doc.text(companyLines.slice(0, 2), x + layout.cardPadding, textY); // Limita a 2 linhas

            return y + cardHeight;
        };

        // Empresa Executora
        drawCompanyCard('Empresa Executora:', activityData.companies.executing_company, currentX, yPos, cardWidth);

        // Empresa Contratante (na mesma linha, se houver espaço)
        currentX += cardWidth + spacing.sm * 2; // Espaçamento entre os cards
        drawCompanyCard('Empresa Contratante:', activityData.companies.contracting_company, currentX, yPos, cardWidth);

        return yPos + 50 + spacing.xl; // Ajuste para a altura dos cards + espaçamento
    }

    // Seção de estatísticas em grid
    private static addStatsSection(doc: jsPDF, stats: ActivityStats, yPos: number): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();
        const sectionWidth = pageWidth - (layout.margins.left + layout.margins.right);
        const statBoxWidth = sectionWidth / 2 - spacing.sm; // Duas colunas

        // Título da seção
        this.setTextStyle(doc, typography.sizes.h2, typography.weights.bold, colors.text.primary);
        doc.text('Resumo das Atividades', layout.margins.left, yPos);
        yPos += spacing.md;

        const statsData = [
            { label: 'Total de Atividades', value: stats.total.toString() },
            { label: 'Tempo Total', value: formatTime(stats.totalTime) },
            { label: 'Responsáveis Únicos', value: stats.uniqueUsers.toString() },
            { label: 'Tempo Médio por Atividade', value: formatTime(stats.avgTime) }
        ];

        let currentRowY = yPos;
        statsData.forEach((stat, index) => {
            const colIndex = index % 2;
            const rowIndex = Math.floor(index / 2);

            const x = layout.margins.left + (colIndex * (statBoxWidth + spacing.sm * 2));
            const y = currentRowY + (rowIndex * (30 + spacing.sm)); // Altura do box + espaçamento

            doc.setFillColor(...colors.background.card);
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(DesignSystem.borders.thickness);
            doc.rect(x, y, statBoxWidth, 30, 'FD'); // Fundo e borda

            this.setTextStyle(doc, typography.sizes.small, typography.weights.bold, colors.text.secondary);
            doc.text(stat.label, x + layout.cardPadding, y + layout.cardPadding);

            this.setTextStyle(doc, typography.sizes.body, typography.weights.bold, colors.primary);
            doc.text(stat.value, x + layout.cardPadding, y + layout.cardPadding + typography.sizes.small + spacing.xs);

            if (colIndex === 1 || index === statsData.length - 1) {
                currentRowY = y; // Atualiza a altura da linha para a próxima iteração
            }
        });

        return currentRowY + 30 + spacing.xl; // Ajuste para a altura dos boxes + espaçamento
    }

    // Card de atividade mais detalhado
    private static addActivityCard(doc: jsPDF, entry: any, index: number, yPos: number): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const cardHeight = 65; // Altura fixa para o card

        // Verificar se precisa de nova página
        if (yPos + cardHeight + layout.margins.bottom > pageHeight) {
            doc.addPage();
            yPos = layout.margins.top;
        }

        const cardWidth = pageWidth - (layout.margins.left + layout.margins.right);
        const cardX = layout.margins.left;

        // Fundo e borda do card
        doc.setFillColor(...colors.background.card);
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(DesignSystem.borders.thickness);
        doc.rect(cardX, yPos, cardWidth, cardHeight, 'FD');

        let currentY = yPos + layout.cardPadding;

        // Número da atividade e Título
        const numText = `#${(index + 1).toString().padStart(2, '0')}`;
        this.setTextStyle(doc, typography.sizes.small, typography.weights.bold, colors.text.muted);
        doc.text(numText, cardX + layout.cardPadding, currentY);

        const titleX = cardX + layout.cardPadding + doc.getTextWidth(numText) + spacing.sm;
        const titleMaxWidth = cardWidth - (layout.cardPadding * 2) - doc.getTextWidth(numText) - spacing.sm - 50; // Espaço para tempo

        this.setTextStyle(doc, typography.sizes.h3, typography.weights.bold, colors.text.primary);
        const titleLines = doc.splitTextToSize(entry.atividade, titleMaxWidth);
        doc.text(titleLines.slice(0, 1), titleX, currentY); // Apenas a primeira linha do título

        // Tempo no canto direito
        const timeText = formatTime(entry.tempo_gasto);
        this.setTextStyle(doc, typography.sizes.h3, typography.weights.bold, colors.primary);
        const timeX = cardX + cardWidth - layout.cardPadding - doc.getTextWidth(timeText);
        doc.text(timeText, timeX, currentY);

        currentY += typography.sizes.h3 + spacing.xs;

        // Informações em linha: Responsável, Data, Empresa
        this.setTextStyle(doc, typography.sizes.small, typography.weights.normal, colors.text.secondary);
        const infoText = `${entry.responsavel} • ${formatDate(entry.data)} • ${truncateText(entry.empresa, 30)}`;
        doc.text(infoText, cardX + layout.cardPadding, currentY);

        currentY += typography.sizes.small + spacing.xs;

        // Descrição
        this.setTextStyle(doc, typography.sizes.small, typography.weights.normal, colors.text.secondary);
        const descMaxWidth = cardWidth - (layout.cardPadding * 2);
        const descLines = doc.splitTextToSize(entry.descritivo, descMaxWidth);
        doc.text(descLines.slice(0, 2), cardX + layout.cardPadding, currentY); // Limita a 2 linhas

        return yPos + cardHeight + spacing.sm; // Retorna a próxima posição Y
    }

    // Footer simples e centralizado
    private static addFooter(doc: jsPDF, activityData: ActivityData) {
        const { layout, typography, colors } = DesignSystem;
        const totalPages = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            const footerY = pageHeight - layout.margins.bottom + 5; // Posição do texto do rodapé

            // Linha superior do rodapé
            doc.setDrawColor(...colors.background.lightGray);
            doc.setLineWidth(DesignSystem.borders.thickness);
            doc.line(layout.margins.left, footerY - 5, pageWidth - layout.margins.right, footerY - 5);

            this.setTextStyle(doc, typography.sizes.caption, typography.weights.normal, colors.text.muted);

            // Texto da empresa (esquerda)
            const leftText = `${truncateText(activityData.companies.executing_company, 50)}`;
            doc.text(leftText, layout.margins.left, footerY);

            // Número da página (direita)
            const rightText = `Página ${i} de ${totalPages} • ${new Date().toLocaleDateString('pt-BR')}`;
            const rightTextWidth = doc.getTextWidth(rightText);
            doc.text(rightText, pageWidth - layout.margins.right - rightTextWidth, footerY);
        }
    }

    // Função principal de exportação
    static exportToPDF = async (
        activityData: ActivityData,
        stats: ActivityStats,
        options?: ExportOptions
    ): Promise<void> => {
        return new Promise((resolve) => {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                putOnlyUsedFonts: true,
                floatPrecision: 16
            });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Fundo branco da página
            doc.setFillColor(...DesignSystem.colors.background.page);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Construir documento
            let yPos = PDFExport.addHeader(doc, activityData);
            yPos = PDFExport.addCompaniesSection(doc, activityData, yPos);

            if (options?.includeStats !== false) {
                yPos = PDFExport.addStatsSection(doc, stats, yPos);
            }

            // Título da seção de atividades
            PDFExport.setTextStyle(doc, DesignSystem.typography.sizes.h2, DesignSystem.typography.weights.bold, DesignSystem.colors.text.primary);
            doc.text('Atividades Executadas', DesignSystem.layout.margins.left, yPos);
            yPos += DesignSystem.spacing.lg;

            // Adicionar atividades
            activityData.entries.forEach((entry, index) => {
                yPos = PDFExport.addActivityCard(doc, entry, index, yPos);
            });

            // Adicionar footer
            PDFExport.addFooter(doc, activityData);

            // Gerar nome do arquivo
            const timestamp = new Date().toISOString().split('T')[0];
            const companyPrefix = activityData.companies.executing_company
                .replace(/[^a-zA-Z0-9]/g, '_')
                .substring(0, 12)
                .toUpperCase();
            const fileName = `Relatorio_${companyPrefix}_${timestamp}.pdf`;

            doc.save(fileName);

            console.log(`✅ Relatório PDF gerado: ${fileName}`);
            console.log(`📊 ${activityData.entries.length} atividades exportadas`);

            setTimeout(resolve, 100);
        });
    };

    // Função com opções simplificadas
    static exportToPDFWithOptions = async (
        activityData: ActivityData,
        stats: ActivityStats,
        includeStats: boolean = true
    ): Promise<void> => {
        const options: ExportOptions = {
            includeStats: includeStats
        };
        return this.exportToPDF(activityData, stats, options);
    };
}

export default PDFExport;
