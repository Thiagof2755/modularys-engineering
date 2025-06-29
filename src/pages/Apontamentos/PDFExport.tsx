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
        // Novas cores baseadas nas suas referências
        darkBlue: [10, 38, 71] as [number, number, number], // #0a2647
        mediumBlue: [44, 116, 179] as [number, number, number], // #2c74b3
        lightBlueBg: [224, 242, 254] as [number, number, number], // #e0f2fe
        textGray: [99, 116, 139] as [number, number, number], // #64748b
        darkGrayText: [51, 65, 85] as [number, number, number], // #334155
        lightBg: [248, 250, 252] as [number, number, number], // #f8fafc

        primary: [44, 116, 179] as [number, number, number], // Azul principal (mediumBlue)
        secondary: [108, 117, 125] as [number, number, number], // Cinza médio para texto secundário
        accent: [255, 193, 7] as [number, number, number], // Amarelo para destaque (opcional)
        background: {
            page: [255, 255, 255] as [number, number, number], // Branco puro para fundo da página
            card: [255, 255, 255] as [number, number, number], // Branco para fundo do card
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
            h1: 20, // Título principal do relatório
            h2: 15, // Título de seção
            h3: 13, // Título de item de atividade
            body: 9, // Texto corpo padrão
            small: 8, // Texto menor para detalhes
            caption: 7, // Legendas e rodapé
        },
        weights: {
            normal: 'normal' as const,
            bold: 'bold' as const,
            semiBold: 'bold' as const, // jsPDF só tem normal/bold
        },
    },
    spacing: {
        xs: 2, // Extra small - muito compacto
        sm: 4, // Small - para itens em linha
        md: 8, // Medium - para quebras de linha dentro da seção
        lg: 12, // Large - para quebras de seção
        xl: 16, // Extra large - para grandes separações
    },
    layout: {
        margins: { top: 15, right: 15, bottom: 15, left: 15 }, // Margens da página reduzidas
        cardPadding: 12, // Padding interno do card de atividade reduzido
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
        yPos += typography.sizes.h1 / 2 + spacing.xs;
        doc.setDrawColor(...colors.background.lightGray);
        doc.setLineWidth(0.5);
        doc.line(layout.margins.left, yPos, pageWidth - layout.margins.right, yPos);


        // Informações do período e atualização
        yPos += spacing.md;
        this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.text.secondary);
        doc.text(`Período: ${activityData.dashboard_info.date}`, layout.margins.left, yPos);
        doc.text(`Atualizado: ${activityData.dashboard_info.last_update}`, layout.margins.left, yPos + spacing.xs);


        return yPos + spacing.lg;
    }


    // Seção de empresas sem "cards"
    private static addCompaniesSection(doc: jsPDF, activityData: ActivityData, yPos: number): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();


        // Título da seção
        this.setTextStyle(doc, typography.sizes.h2, typography.weights.bold, colors.text.primary);
        doc.text('Informações das Empresas', layout.margins.left, yPos);
        yPos += spacing.md;


        // Empresa Executora
        this.setTextStyle(doc, typography.sizes.small, typography.weights.bold, colors.text.secondary);
        doc.text('Empresa Executora:', layout.margins.left, yPos);
        this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.text.primary);
        doc.text(activityData.companies.executing_company, layout.margins.left + doc.getTextWidth('Empresa Executora: ') + spacing.xs, yPos);
        yPos += typography.sizes.body + spacing.xs;


        // Empresa Contratante
        this.setTextStyle(doc, typography.sizes.small, typography.weights.bold, colors.text.secondary);
        doc.text('Empresa Contratante:', layout.margins.left, yPos);
        this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.text.primary);
        doc.text(activityData.companies.contracting_company, layout.margins.left + doc.getTextWidth('Empresa Contratante: ') + spacing.xs, yPos);
        yPos += typography.sizes.body + spacing.md;


        return yPos;
    }


    // Seção de estatísticas em grid sem "cards"
    private static addStatsSection(doc: jsPDF, stats: ActivityStats, yPos: number): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();
        const sectionWidth = pageWidth - (layout.margins.left + layout.margins.right);
        const colWidth = sectionWidth / 2;


        // Título da seção
        this.setTextStyle(doc, typography.sizes.h2, typography.weights.bold, colors.text.primary);
        doc.text('Resumo das Atividades', layout.margins.left, yPos);
        yPos += spacing.md;


        const statsData = [
            { label: 'Total de Atividades:', value: stats.total.toString() },
            { label: 'Tempo Total:', value: formatTime(stats.totalTime) },
            { label: 'Responsáveis Únicos:', value: stats.uniqueUsers.toString() },
            { label: 'Tempo Médio por Atividade:', value: formatTime(stats.avgTime) }
        ];


        let currentY = yPos;
        statsData.forEach((stat, index) => {
            const colIndex = index % 2;
            const x = layout.margins.left + (colIndex * colWidth);


            this.setTextStyle(doc, typography.sizes.small, typography.weights.bold, colors.text.secondary);
            doc.text(stat.label, x, currentY);


            // Valor em azul
            this.setTextStyle(doc, typography.sizes.body, typography.weights.bold, colors.primary);
            doc.text(stat.value, x + doc.getTextWidth(stat.label) + spacing.xs, currentY);


            if (colIndex === 1 || index === statsData.length - 1) {
                currentY += typography.sizes.body + spacing.xs;
            }
        });

        return currentY + spacing.lg;
    }


    // Item de atividade como um "card" mais limpo e compacto
    private static addActivityCard(doc: jsPDF, entry: any, index: number, yPos: number): number {
        const { layout, spacing, typography, colors } = DesignSystem;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const cardWidth = pageWidth - (layout.margins.left + layout.margins.right);
        const cardX = layout.margins.left;

        // Estimar altura do card para verificar quebra de página
        // Título (1 linha) + Meta (2 linhas) + Descrição (2 linhas) + paddings e spacings
        const estimatedHeight = typography.sizes.h3 * layout.lineHeight + // Title
                                typography.sizes.small * layout.lineHeight * 2 + // Meta
                                typography.sizes.body * layout.lineHeight * 2 + // Description
                                layout.cardPadding * 2 + // Card vertical padding
                                spacing.xs * 3 + // Internal spacing
                                4; // Borda da descrição

        if (yPos + estimatedHeight + layout.margins.bottom > pageHeight) {
            doc.addPage();
            yPos = layout.margins.top;
        }

        const cardY = yPos;
        let currentY = cardY + layout.cardPadding;

        // Desenhar fundo do card
        doc.setFillColor(...colors.background.card);
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(DesignSystem.borders.thickness);
        doc.rect(cardX, cardY, cardWidth, estimatedHeight, 'FD'); // 'FD' para preencher e desenhar borda

        // ActivityHeader (Título e Tempo)
        const titleText = entry.atividade;
        const timeText = formatTime(entry.tempo_gasto);

        // Título da atividade (azul escuro)
        this.setTextStyle(doc, typography.sizes.h3, typography.weights.bold, colors.darkBlue);
        const titleMaxWidth = cardWidth - (layout.cardPadding * 2) - doc.getTextWidth(timeText) - spacing.sm;
        const titleLines = doc.splitTextToSize(titleText, titleMaxWidth);
        doc.text(titleLines.slice(0, 1), cardX + layout.cardPadding, currentY); // Apenas a primeira linha

        // Tempo no canto direito (azul escuro com fundo azul claro)
        const timeTagWidth = doc.getTextWidth(timeText) + spacing.sm * 2; // Padding horizontal
        const timeTagHeight = typography.sizes.small + spacing.xs * 2; // Padding vertical
        const timeTagX = cardX + cardWidth - layout.cardPadding - timeTagWidth;
        const timeTagY = currentY - typography.sizes.h3 / 2 + typography.sizes.small / 2 - spacing.xs / 2; // Alinha verticalmente com o título

        doc.setFillColor(...colors.lightBlueBg);
        doc.rect(timeTagX, timeTagY, timeTagWidth, timeTagHeight, 'F'); // Fundo do TimeTag
        this.setTextStyle(doc, typography.sizes.small, typography.weights.semiBold, colors.darkBlue);
        doc.text(timeText, timeTagX + spacing.sm, timeTagY + spacing.xs + typography.sizes.small / 2); // Texto do TimeTag

        currentY += typography.sizes.h3 + spacing.sm; // Espaçamento após o título

        // ActivityMeta (Responsável, Solicitante, Data, Cliente)
        this.setTextStyle(doc, typography.sizes.small, typography.weights.normal, colors.textGray);
        const metaLine1 = `Responsável: ${entry.responsavel} • Solicitante: ${entry.solicitante}`;
        const metaLine2 = `Data: ${formatDate(entry.data)} • Cliente: ${truncateText(entry.empresa, 30)}`;

        doc.text(metaLine1, cardX + layout.cardPadding, currentY);
        currentY += typography.sizes.small + spacing.xs;
        doc.text(metaLine2, cardX + layout.cardPadding, currentY);
        currentY += typography.sizes.small + spacing.md;

        // ActivityDescription
        const descBgX = cardX + layout.cardPadding;
        const descBgY = currentY;
        const descBgWidth = cardWidth - (layout.cardPadding * 2);
        const descPadding = 8; // Padding interno da descrição reduzido
        const descTextMaxWidth = descBgWidth - (descPadding * 2) - 4; // 4px para a borda esquerda

        this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.darkGrayText);
        const descLines = doc.splitTextToSize(entry.descritivo, descTextMaxWidth);
        const descHeight = (typography.sizes.body * Math.min(descLines.length, 2) * layout.lineHeight) + (descPadding * 2); // Limita a 2 linhas

        // Fundo da descrição
        doc.setFillColor(...colors.lightBg);
        doc.rect(descBgX, descBgY, descBgWidth, descHeight, 'F');

        // Borda esquerda da descrição (azul médio)
        doc.setDrawColor(...colors.mediumBlue);
        doc.setLineWidth(4);
        doc.line(descBgX, descBgY, descBgX, descBgY + descHeight);

        // Texto da descrição
        this.setTextStyle(doc, typography.sizes.body, typography.weights.normal, colors.darkGrayText);
        doc.text(descLines.slice(0, 2), descBgX + descPadding, descBgY + descPadding + typography.sizes.body / 2);

        currentY += descHeight + spacing.md; // Espaçamento para o próximo card

        return currentY;
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
            doc.text('Atividades Realizadas', DesignSystem.layout.margins.left, yPos);
            yPos += DesignSystem.spacing.md;


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
