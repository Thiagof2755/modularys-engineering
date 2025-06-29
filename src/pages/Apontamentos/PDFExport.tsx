import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityData } from './Apontamentos';

// Interfaces
interface ActivityStats {
    total: number;
    totalTime: string;
    uniqueUsers: number;
    avgTime: string;
}

interface ExportOptions {
    includeStats?: boolean;
}

// Configurações Clean e Profissionais
const DesignSystem = {
    colors: {
        primary: [40, 40, 40] as [number, number, number],        // Cinza escuro profissional
        secondary: [80, 80, 80] as [number, number, number],      // Cinza médio
        accent: [120, 120, 120] as [number, number, number],      // Cinza claro
        background: {
            white: [255, 255, 255] as [number, number, number],   // Branco puro
            light: [250, 250, 250] as [number, number, number],   // Cinza muito claro
        },
        text: {
            primary: [30, 30, 30] as [number, number, number],    // Texto principal
            secondary: [100, 100, 100] as [number, number, number], // Texto secundário
            muted: [150, 150, 150] as [number, number, number],   // Texto esmaecido
        },
        border: [220, 220, 220] as [number, number, number],      // Borda sutil
    },
    
    typography: {
        sizes: {
            h1: 18,      // Título principal
            h2: 14,      // Título seção
            h3: 12,      // Subtítulo
            body: 10,    // Texto corpo
            small: 9,    // Texto pequeno
            caption: 8,  // Legenda
        },
    },
    
    spacing: {
        sm: 6,
        md: 10,
        lg: 15,
        xl: 20,
    },
    
    layout: {
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
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
    // Header limpo e profissional
    private static addHeader(doc: jsPDF, activityData: ActivityData): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = DesignSystem.layout.margins.top;

        // Título principal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h1);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text(activityData.dashboard_info.title, DesignSystem.layout.margins.left, yPos);

        // Linha simples abaixo do título
        doc.setDrawColor(...DesignSystem.colors.border);
        doc.setLineWidth(0.5);
        doc.line(DesignSystem.layout.margins.left, yPos + 5, pageWidth - DesignSystem.layout.margins.right, yPos + 5);

        // Informações do período
        yPos += DesignSystem.spacing.lg;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.body);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text(`Período: ${activityData.dashboard_info.date}`, DesignSystem.layout.margins.left, yPos);
        
        doc.text(`Atualizado: ${activityData.dashboard_info.last_update}`, DesignSystem.layout.margins.left, yPos + 8);

        return yPos + DesignSystem.spacing.xl;
    }

    // Seção de empresas simplificada
    private static addCompaniesSection(doc: jsPDF, activityData: ActivityData, yPos: number): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        const sectionWidth = pageWidth - (DesignSystem.layout.margins.left + DesignSystem.layout.margins.right);
        
        // Título da seção
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h2);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text('Informações das Empresas', DesignSystem.layout.margins.left, yPos);
        yPos += DesignSystem.spacing.md;

        // Empresa Executora
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.body);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('Empresa Executora:', DesignSystem.layout.margins.left, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DesignSystem.colors.text.primary);
        const executingLines = doc.splitTextToSize(activityData.companies.executing_company, sectionWidth - 50);
        doc.text(executingLines, DesignSystem.layout.margins.left + 50, yPos);
        yPos += Math.max(8, executingLines.length * 5);

        // Empresa Contratante
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.body);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        doc.text('Empresa Contratante:', DesignSystem.layout.margins.left, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DesignSystem.colors.text.primary);
        const contractingLines = doc.splitTextToSize(activityData.companies.contracting_company, sectionWidth - 50);
        doc.text(contractingLines, DesignSystem.layout.margins.left + 50, yPos);

        return yPos + DesignSystem.spacing.xl;
    }

    // Seção de estatísticas clean
    private static addStatsSection(doc: jsPDF, stats: ActivityStats, yPos: number): number {
        // Título da seção
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.h2);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        doc.text('Resumo', DesignSystem.layout.margins.left, yPos);
        yPos += DesignSystem.spacing.md;

        const statsData = [
            { label: 'Total de Atividades:', value: stats.total.toString() },
            { label: 'Tempo Total:', value: formatTime(stats.totalTime) },
            { label: 'Responsáveis Únicos:', value: stats.uniqueUsers.toString() },
            { label: 'Tempo Médio por Atividade:', value: formatTime(stats.avgTime) }
        ];

        statsData.forEach((stat, index) => {
            const currentY = yPos + (index * 10);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(DesignSystem.typography.sizes.body);
            doc.setTextColor(...DesignSystem.colors.text.secondary);
            doc.text(stat.label, DesignSystem.layout.margins.left, currentY);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...DesignSystem.colors.text.primary);
            doc.text(stat.value, DesignSystem.layout.margins.left + 60, currentY);
        });

        return yPos + (statsData.length * 10) + DesignSystem.spacing.xl;
    }

    // Card de atividade minimalista
    private static addActivityCard(doc: jsPDF, entry: any, index: number, yPos: number): number {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Verificar se precisa de nova página
        if (yPos + 60 > pageHeight - 40) {
            doc.addPage();
            yPos = 30;
        }

        const cardWidth = pageWidth - (DesignSystem.layout.margins.left + DesignSystem.layout.margins.right);
        
        // Fundo sutil do card
        doc.setFillColor(...DesignSystem.colors.background.light);
        doc.rect(DesignSystem.layout.margins.left, yPos, cardWidth, 50, 'F');
        
        // Borda do card
        doc.setDrawColor(...DesignSystem.colors.border);
        doc.setLineWidth(0.3);
        doc.rect(DesignSystem.layout.margins.left, yPos, cardWidth, 50, 'S');

        // Número da atividade
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.muted);
        doc.text(`#${(index + 1).toString().padStart(2, '0')}`, DesignSystem.layout.margins.left + 5, yPos + 8);

        // Título da atividade
        const titleX = DesignSystem.layout.margins.left + 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.body);
        doc.setTextColor(...DesignSystem.colors.text.primary);
        const titleLines = doc.splitTextToSize(entry.atividade, cardWidth - 80);
        doc.text(titleLines.slice(0, 2), titleX, yPos + 8);

        // Tempo no canto direito
        const timeText = formatTime(entry.tempo_gasto);
        const timeX = pageWidth - DesignSystem.layout.margins.right - doc.getTextWidth(timeText);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(DesignSystem.typography.sizes.body);
        doc.setTextColor(...DesignSystem.colors.primary);
        doc.text(timeText, timeX, yPos + 8);

        // Informações em linha
        const infoY = yPos + 22;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        
        const infoText = `${entry.responsavel} • ${formatDate(entry.data)} • ${truncateText(entry.empresa, 30)}`;
        doc.text(infoText, titleX, infoY);

        // Descrição
        const descY = yPos + 32;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(DesignSystem.typography.sizes.small);
        doc.setTextColor(...DesignSystem.colors.text.secondary);
        const descLines = doc.splitTextToSize(entry.descritivo, cardWidth - 25);
        doc.text(descLines.slice(0, 2), titleX, descY);

        return yPos + 60;
    }

    // Footer simples
    private static addFooter(doc: jsPDF, activityData: ActivityData) {
        const totalPages = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            const footerY = pageHeight - 15;
            
            // Linha superior
            doc.setDrawColor(...DesignSystem.colors.border);
            doc.setLineWidth(0.3);
            doc.line(DesignSystem.layout.margins.left, footerY, pageWidth - DesignSystem.layout.margins.right, footerY);
            
            // Informações do relatório
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(DesignSystem.typography.sizes.caption);
            doc.setTextColor(...DesignSystem.colors.text.muted);
            
            const leftText = `${truncateText(activityData.companies.executing_company, 50)}`;
            doc.text(leftText, DesignSystem.layout.margins.left, footerY + 6);
            
            const rightText = `Página ${i} de ${totalPages} • ${new Date().toLocaleDateString('pt-BR')}`;
            doc.text(rightText, pageWidth - DesignSystem.layout.margins.right - doc.getTextWidth(rightText), footerY + 6);
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
            doc.setFillColor(...DesignSystem.colors.background.white);
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
            doc.text('Atividades Executadas', DesignSystem.layout.margins.left, yPos);
            
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
