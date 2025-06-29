import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityData } from './Apontamentos';
import styled from 'styled-components';

// Interfaces
interface ActivityStats {
    total: number;
    totalTime: string;
    uniqueUsers: number;
    avgTime: string;
}

interface ExportOptions {
    theme?: PDFTheme;
    includeStats?: boolean;
    includeCompanyInfo?: boolean;
    watermark?: string;
}

interface PDFTheme {
    name: string;
    colors: {
        primary: [number, number, number];
        secondary: [number, number, number];
        accent: [number, number, number];
        gradient: { start: [number, number, number]; end: [number, number, number]; };
        background: { main: [number, number, number]; white: [number, number, number]; card: [number, number, number]; section: [number, number, number]; };
        text: { primary: [number, number, number]; secondary: [number, number, number]; muted: [number, number, number]; white: [number, number, number]; };
        border: [number, number, number];
        success: [number, number, number];
        warning: [number, number, number];
        error: [number, number, number];
    };
}

// Styled Components
const PreviewContainer = styled.div`
    display: none;
`;

// Configurações de Design Profissional
const DesignSystem = {
    colors: {
        primary: [16, 67, 142] as [number, number, number],      // Azul corporativo #10438E
        secondary: [45, 127, 249] as [number, number, number],    // Azul moderno #2D7FF9
        accent: [84, 166, 255] as [number, number, number],       // Azul claro #54A6FF
        gradient: {
            start: [16, 67, 142] as [number, number, number],     // Azul escuro
            end: [45, 127, 249] as [number, number, number],      // Azul médio
        },
        background: {
            main: [249, 251, 253] as [number, number, number],    // Fundo principal #F9FBFD
            white: [255, 255, 255] as [number, number, number],   // Branco puro
            card: [255, 255, 255] as [number, number, number],    // Fundo do card
            section: [243, 247, 251] as [number, number, number], // Seção #F3F7FB
        },
        text: {
            primary: [17, 24, 39] as [number, number, number],    // Texto principal #111827
            secondary: [75, 85, 99] as [number, number, number],  // Texto secundário #4B5563
            muted: [156, 163, 175] as [number, number, number],   // Texto esmaecido #9CA3AF
            white: [255, 255, 255] as [number, number, number],   // Texto branco
        },
        border: [229, 231, 235] as [number, number, number],      // Borda #E5E7EB
        success: [16, 185, 129] as [number, number, number],      // Verde #10B981
        warning: [245, 158, 11] as [number, number, number],      // Amarelo #F59E0B
        error: [239, 68, 68] as [number, number, number],         // Vermelho #EF4444
    },
    
    typography: {
        sizes: {
            h1: 24,      // Título principal
            h2: 18,      // Título seção
            h3: 14,      // Subtítulo
            body: 10,    // Texto corpo
            small: 8,    // Texto pequeno
            caption: 7,  // Legenda
        },
        weights: {
            light: 'normal',
            regular: 'normal',
            medium: 'normal',
            bold: 'bold',
        },
    },
    
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
    },
    
    layout: {
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        cardPadding: 16,
        borderRadius: { sm: 4, md: 8, lg: 12 },
        shadows: { light: 0.03, medium: 0.06, heavy: 0.1 },
    }
};

// Funções Utilitárias Aprimoradas
const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':').map(Number);
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
    // Função para adicionar retângulo com cantos arredondados e sombra
    private static addRoundedRect(
        doc: jsPDF, 
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        radius: number = 8, 
        fillColor?: number[], 
        strokeColor?: number[], 
        addShadow: boolean = true
    ) {
        // Sombra sutil
        if (addShadow) {
            doc.setFillColor(0, 0, 0, DesignSystem.layout.shadows.light);
            doc.roundedRect(x + 0.5, y + 0.5, width, height, radius, radius, 'F');
        }
        
        // Retângulo principal
        if (fillColor) {
            doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
            doc.roundedRect(x, y, width, height, radius, radius, 'F');
        }
        
        if (strokeColor) {
            doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
            doc.setLineWidth(0.3);
            doc.roundedRect(x, y, width, height, radius, radius, 'S');
        }
    }

    // Gradiente aprimorado para header
    private static addGradientHeader(doc: jsPDF, x: number, y: number, width: number, height: number) {
        const steps = 25;
        const stepHeight = height / steps;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / (steps - 1);
            const startColor = DesignSystem.colors.gradient.start;
            const endColor = DesignSystem.colors.gradient.end;
            
            const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
            const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
            const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
            
            doc.setFillColor(r, g, b);
            doc.rect(x, y + i * stepHeight, width, stepHeight + 0.1, 'F');
        }
    }

    // Header profissional e bem proporcionado
    private static addHeader(doc: jsPDF, activityData: ActivityData): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        const headerHeight = 55;
        let yPos = DesignSystem.layout.margins.top;

        // Fundo gradiente do header
        this.addGradientHeader(doc, 0, yPos, pageWidth, headerHeight);
        
        // Linha decorativa superior
        doc.setDrawColor(DesignSystem.colors.accent[0], DesignSystem.colors.accent[1], DesignSystem.colors.accent[2]);
        doc.setLineWidth(3);
        doc.line(0, yPos, pageWidth, yPos);

        // Título principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h1);
        doc.setTextColor(...DesignSystem.colors.text.white);
        
        const titleX = DesignSystem.layout.margins.left;
        const titleY = yPos + 20;
        doc.text(activityData.dashboard_info.title, titleX, titleY);

        // Subtítulo com data
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.body);
        doc.setTextColor(...DesignSystem.colors.text.white);
        doc.text(`Período: ${activityData.dashboard_info.date}`, titleX, titleY + 12);

        // Badge de atualização
        const updateText = `Atualizado: ${activityData.dashboard_info.last_update}`;
        const badgeWidth = doc.getTextWidth(updateText) + 16;
        const badgeX = pageWidth - badgeWidth - DesignSystem.layout.margins.right;
        const badgeY = yPos + 30;
        
        this.addRoundedRect(doc, badgeX, badgeY, badgeWidth, 14, 7, DesignSystem.colors.background.white);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.primary);
        doc.text(updateText, badgeX + 8, badgeY + 9);

        return yPos + headerHeight + DesignSystem.spacing.lg;
    }

    // Seção de empresas mais compacta e profissional
    private static addCompaniesSection(doc: jsPDF, activityData: ActivityData, yPos: number): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        const cardHeight = 45;
        const cardGap = DesignSystem.spacing.md;
        const totalWidth = pageWidth - (DesignSystem.layout.margins.left + DesignSystem.layout.margins.right);
        const cardWidth = (totalWidth - cardGap) / 2;

        // Empresa Executora
        const leftCardX = DesignSystem.layout.margins.left;
        this.addRoundedRect(doc, leftCardX, yPos, cardWidth, cardHeight, 8, DesignSystem.colors.background.white, DesignSystem.colors.border);
        
        // Ícone da empresa executora
        this.addRoundedRect(doc, leftCardX + 8, yPos + 8, 6, 6, 3, DesignSystem.colors.primary);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('EMPRESA EXECUTORA', leftCardX + 20, yPos + 14);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h3);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        const executingLines = doc.splitTextToSize(activityData.companies.executing_company, cardWidth - 24);
        doc.text(executingLines, leftCardX + 20, yPos + 26);

        // Empresa Contratante
        const rightCardX = leftCardX + cardWidth + cardGap;
        this.addRoundedRect(doc, rightCardX, yPos, cardWidth, cardHeight, 8, DesignSystem.colors.background.white, DesignSystem.colors.border);
        
        // Ícone da empresa contratante
        this.addRoundedRect(doc, rightCardX + 8, yPos + 8, 6, 6, 3, DesignSystem.colors.secondary);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('EMPRESA CONTRATANTE', rightCardX + 20, yPos + 14);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h3);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        const contractingLines = doc.splitTextToSize(activityData.companies.contracting_company, cardWidth - 24);
        doc.text(contractingLines, rightCardX + 20, yPos + 26);

        return yPos + cardHeight + DesignSystem.spacing.xl;
    }

    // Seção de estatísticas mais elegante
    private static addStatsSection(doc: jsPDF, stats: ActivityStats, yPos: number): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Título da seção
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h2);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text('Resumo Executivo', DesignSystem.layout.margins.left, yPos);
        
        // Linha decorativa
        doc.setDrawColor(...DesignSystem.colors.primary);
        doc.setLineWidth(2);
        doc.line(DesignSystem.layout.margins.left, yPos + 4, DesignSystem.layout.margins.left + 40, yPos + 4);

        const statsY = yPos + DesignSystem.spacing.lg;
        const cardHeight = 38;
        const cardGap = DesignSystem.spacing.sm;
        const totalWidth = pageWidth - (DesignSystem.layout.margins.left + DesignSystem.layout.margins.right);
        const cardWidth = (totalWidth - (3 * cardGap)) / 4;

        const statsData = [
            { 
                label: 'Total de\nAtividades', 
                value: stats.total.toString(), 
                color: DesignSystem.colors.primary,
                icon: '📊'
            },
            { 
                label: 'Tempo\nTotal', 
                value: formatTime(stats.totalTime), 
                color: DesignSystem.colors.secondary,
                icon: '⏱️'
            },
            { 
                label: 'Responsáveis\nÚnicos', 
                value: stats.uniqueUsers.toString(), 
                color: DesignSystem.colors.accent,
                icon: '👥'
            },
            { 
                label: 'Tempo\nMédio', 
                value: formatTime(stats.avgTime), 
                color: DesignSystem.colors.success,
                icon: '📈'
            }
        ];

        statsData.forEach((stat, index) => {
            const cardX = DesignSystem.layout.margins.left + (index * (cardWidth + cardGap));
            
            // Card principal
            this.addRoundedRect(doc, cardX, statsY, cardWidth, cardHeight, 8, DesignSystem.colors.background.white, DesignSystem.colors.border);
            
            // Barra de cor no topo
            this.addRoundedRect(doc, cardX, statsY, cardWidth, 3, 8, stat.color);
            
            // Valor principal
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(DesignSystem.typography.sizes.h2);
            doc.setTextColor(...DesignSystem.colors.text.primary);
            doc.text(stat.value, cardX + cardWidth/2, statsY + 20, { align: 'center' });
            
            // Label
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(DesignSystem.typography.sizes.small);
            doc.setTextColor(...DesignSystem.colors.text.secondary);
            const labelLines = stat.label.split('\n');
            labelLines.forEach((line, lineIndex) => {
                doc.text(line, cardX + cardWidth/2, statsY + 28 + (lineIndex * 3), { align: 'center' });
            });
        });

        return statsY + cardHeight + DesignSystem.spacing.xl;
    }

    // Card de atividade redesenhado para ser mais compacto e profissional
    private static addActivityCard(doc: jsPDF, entry: any, index: number, yPos: number): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Estimativa de altura do card
        const estimatedHeight = 80; // Altura base mais compacta
        
        // Verificar se precisa de nova página
        if (yPos + estimatedHeight > pageHeight - 40) {
            doc.addPage();
            doc.setFillColor(...DesignSystem.colors.background.main);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            yPos = 30;
        }

        const cardWidth = pageWidth - (DesignSystem.layout.margins.left + DesignSystem.layout.margins.right);
        const cardHeight = 75; // Altura fixa mais compacta
        
        // Card principal
        this.addRoundedRect(
            doc, 
            DesignSystem.layout.margins.left, 
            yPos, 
            cardWidth, 
            cardHeight, 
            DesignSystem.layout.borderRadius.lg, 
            DesignSystem.colors.background.white, 
            DesignSystem.colors.border
        );

        // Barra lateral de status
        this.addRoundedRect(
            doc, 
            DesignSystem.layout.margins.left, 
            yPos, 
            4, 
            cardHeight, 
            DesignSystem.layout.borderRadius.sm, 
            DesignSystem.colors.success
        );

        // Número da atividade
        const numberBadgeSize = 20;
        this.addRoundedRect(
            doc, 
            DesignSystem.layout.margins.left + 8, 
            yPos + 8, 
            numberBadgeSize, 
            numberBadgeSize, 
            numberBadgeSize/2, 
            DesignSystem.colors.primary
        );
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.white);
        doc.text((index + 1).toString(), DesignSystem.layout.margins.left + 18, yPos + 19, { align: 'center' });

        // Título da atividade
        const titleX = DesignSystem.layout.margins.left + 35;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h3);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        const titleLines = doc.splitTextToSize(entry.atividade, cardWidth - 120);
        doc.text(titleLines.slice(0, 2), titleX, yPos + 16); // Máximo 2 linhas

        // Badge de tempo
        const timeText = formatTime(entry.tempo_gasto);
        const timeWidth = doc.getTextWidth(timeText) + 12;
        const timeX = pageWidth - timeWidth - DesignSystem.layout.margins.right - 8;
        
        this.addRoundedRect(doc, timeX, yPos + 8, timeWidth, 16, 8, DesignSystem.colors.accent);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.white);
        doc.text(timeText, timeX + timeWidth/2, yPos + 18, { align: 'center' });

        // Informações em linha (mais compactas)
        const infoY = yPos + 35;
        const infoSpacing = (cardWidth - 40) / 3;
        
        // Responsável
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.caption);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('RESPONSÁVEL', titleX, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text(truncateText(entry.responsavel, 20), titleX, infoY + 8);

        // Data
        const dateX = titleX + infoSpacing;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.caption);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('DATA', dateX, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text(formatDate(entry.data), dateX, infoY + 8);

        // Empresa
        const companyX = titleX + (infoSpacing * 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.caption);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('EMPRESA', companyX, infoY);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text(truncateText(entry.empresa, 25), companyX, infoY + 8);

        // Descrição (mais compacta)
        const descY = yPos + 52;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        const descLines = doc.splitTextToSize(entry.descritivo, cardWidth - 40);
        doc.text(descLines.slice(0, 2), titleX, descY); // Máximo 2 linhas

        return yPos + cardHeight + DesignSystem.spacing.md;
    }

    // Footer mais elegante
    private static addFooter(doc: jsPDF, activityData: ActivityData) {
        const totalPages = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            const footerY = pageHeight - 15;
            const footerHeight = 15;
            
            // Fundo do footer
            this.addGradientHeader(doc, 0, footerY, pageWidth, footerHeight);
            
            // Informações da empresa
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(DesignSystem.typography.sizes.small);
            doc.setTextColor(...DesignSystem.colors.text.white);
            doc.text(
                `Relatório de Atividades • ${truncateText(activityData.companies.executing_company, 40)}`,
                pageWidth / 2,
                footerY + 6,
                { align: 'center' }
            );
            
            // Número da página
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(DesignSystem.typography.sizes.caption);
            doc.text(
                `Página ${i} de ${totalPages} • ${new Date().toLocaleDateString('pt-BR')}`,
                pageWidth / 2,
                footerY + 11,
                { align: 'center' }
            );
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
            
            // Fundo da página
            doc.setFillColor(...DesignSystem.colors.background.main);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            // Construir documento
            let yPos = this.addHeader(doc, activityData);
            yPos = this.addCompaniesSection(doc, activityData, yPos);
            
            if (options?.includeStats !== false) {
                yPos = this.addStatsSection(doc, stats, yPos);
            }
            
            // Título da seção de atividades
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(DesignSystem.typography.sizes.h2);
            doc.setTextColor(...DesignSystem.colors.text.primary);
            doc.text('Atividades Detalhadas', DesignSystem.layout.margins.left, yPos);
            
            // Linha decorativa
            doc.setDrawColor(...DesignSystem.colors.primary);
            doc.setLineWidth(2);
            doc.line(
                DesignSystem.layout.margins.left, 
                yPos + 4, 
                DesignSystem.layout.margins.left + 60, 
                yPos + 4
            );
            
            yPos += DesignSystem.spacing.lg;

            // Adicionar atividades
            activityData.entries.forEach((entry, index) => {
                yPos = this.addActivityCard(doc, entry, index, yPos);
            });

            // Adicionar footer
            this.addFooter(doc, activityData);

            // Gerar nome do arquivo
            const timestamp = new Date().toISOString().split('T')[0];
            const companyPrefix = activityData.companies.executing_company
                .replace(/[^a-zA-Z0-9]/g, '_')
                .substring(0, 12)
                .toUpperCase();
            const fileName = `${companyPrefix}_Relatorio_${timestamp}.pdf`;
            
            doc.save(fileName);
            
            console.log(`✅ PDF profissional gerado: ${fileName}`);
            console.log(`📊 ${activityData.entries.length} atividades exportadas`);
            
            setTimeout(resolve, 100);
        });
    };

    // Função com opções de tema
    static exportToPDFWithTheme = async (
        activityData: ActivityData,
        stats: ActivityStats,
        themeName: string = 'modern',
        includeWatermark: boolean = false
    ): Promise<void> => {
        const options: ExportOptions = {
            includeStats: true,
            watermark: includeWatermark ? 'CONFIDENCIAL' : undefined
        };
        
        return this.exportToPDF(activityData, stats, options);
    };
}

export default PDFExport;

// Tema moderno exportado
export const modernTechTheme: PDFTheme = {
    name: 'Modern Professional',
    colors: DesignSystem.colors
};

export const typography = DesignSystem.typography;
export const layout = DesignSystem.layout;
