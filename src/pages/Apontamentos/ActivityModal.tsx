import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, Download, FileText, Search, User, Users, X, FileSpreadsheet } from 'lucide-react';
import { ActivityData } from './Apontamentos';
// Remova a importação de PDFExport se não for mais usada
// import PDFExport from './PDFExport'; 
import ExcelExport from './ExcelExport'; // Mantenha esta importação se ainda precisar da exportação para Excel

// Importe as novas bibliotecas
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Props interface
interface ActivityModalProps {
    activityData: ActivityData;
    isOpen: boolean;
    onClose: () => void;
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background-color: #f5f7fa;
  border-radius: 12px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background-color: #f8fafc;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #0a2647;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #64748b;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  background-color: #2c74b3;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background-color: #205295;
  }
  
  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const ExcelButton = styled(ActionButton)`
  background-color: #217346;
  
  &:hover {
    background-color: #1a5c38;
  }
`;

// Dashboard Styled Components
const DashboardContainer = styled.div`
  padding: 24px;
  
  /* Estilos para exportação PDF - permite captura completa do conteúdo */
  &.pdf-export {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: static !important;
    padding-bottom: 50px !important; /* Espaço extra no final */
    min-height: auto !important;
    margin: 0 !important;
    transform: none !important;
    box-sizing: border-box !important;
    
    /* Remove qualquer posicionamento que possa interferir */
    left: 0 !important;
    top: 0 !important;
    right: auto !important;
    bottom: auto !important;
    
    /* Otimizações para qualidade de renderização */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    
    /* Força renderização consistente para todos os elementos filhos */
    *, *::before, *::after {
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
      box-sizing: border-box !important;
      position: static !important;
      transform: none !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      bottom: auto !important;
      float: none !important;
    }
  }
`;

const Header = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 600;
    color: #0a2647;
  }
  
  span {
    color: #64748b;
    font-size: 14px;
  }
`;

const LastUpdate = styled.div`
  margin-top: 10px;
  background-color: #e0f2fe;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  color: #0a2647;
  font-weight: 500;
`;

const CompaniesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const CompanyCard = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CompanyLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const CompanyName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #0f172a;
`;

const StatsSection = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  color: #0a2647;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  
  h3 {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 24px;
    font-weight: 600;
    color: #0a2647;
    margin: 0;
  }
`;

const ActivityCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ActivityTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #0a2647;
  margin: 0 0 4px 0;
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  
  svg {
    color: #2c74b3;
  }
`;

const ActivityDescription = styled.div`
  font-size: 15px;
  color: #334155;
  line-height: 1.6;
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #2c74b3;
`;

const TimeTag = styled.div`
  background-color: #e0f2fe;
  color: #0a2647;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    color: #2c74b3;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-bottom: 24px;
  color: #64748b;
  font-size: 14px;
`;

// Helper functions
const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${hours}h ${minutes}min`;
};

const sumTimes = (times: string[]) => {
    let totalMinutes = 0;

    times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        totalMinutes += (hours * 60) + minutes;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string) => {
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

const ActivityModal: React.FC<ActivityModalProps> = ({ activityData, isOpen, onClose }) => {
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    // Crie uma ref para o elemento que você quer exportar (o conteúdo do dashboard)
    const dashboardRef = useRef<HTMLDivElement>(null);

    // Calculate statistics
    const calculateStats = () => {
        if (!activityData) return { 
            total: 0, 
            totalTime: "0:00", 
            uniqueUsers: 0, 
            avgTime: "0:00",
            byPriority: {},
            byCategory: {}
        };

        const entries = activityData.entries;
        const total = entries.length;
        const totalTimeStr = sumTimes(entries.map(e => e.tempo_gasto));
        const uniqueUsers = new Set(entries.map(e => e.responsavel)).size;

        // Calculate average time
        const [totalHours, totalMinutes] = totalTimeStr.split(':').map(Number);
        const totalMinutesAll = (totalHours * 60) + totalMinutes;
        const avgMinutes = total > 0 ? Math.round(totalMinutesAll / total) : 0;
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = avgMinutes % 60;
        const avgTime = `${avgHours}:${avgMins.toString().padStart(2, '0')}`;

        // Calculate priority distribution (mock data since ActivityEntry doesn't have priority field)
        const byPriority: Record<string, number> = {
            'Alta': Math.ceil(total * 0.2),
            'Média': Math.ceil(total * 0.5),
            'Baixa': Math.floor(total * 0.3)
        };

        // Calculate category distribution based on companies
        const byCategory: Record<string, number> = {};
        entries.forEach(entry => {
            const categoria = entry.empresa || 'Sem categoria';
            byCategory[categoria] = (byCategory[categoria] || 0) + 1;
        });

        return { 
            total, 
            totalTime: totalTimeStr, 
            uniqueUsers, 
            avgTime,
            byPriority,
            byCategory
        };
    };

    const stats = calculateStats();

    // Handle PDF Export - Nova abordagem com página separada
    const handlePDFExport = async () => {
        setExportingPDF(true);
        
        try {
            console.log('Iniciando exportação PDF com nova abordagem...');
            
            // Cria uma nova janela oculta para renderizar o conteúdo
            const printWindow = window.open('', '_blank', 'width=1280,height=1024,scrollbars=no');
            
            if (!printWindow) {
                throw new Error('Não foi possível abrir janela para exportação');
            }

            // HTML base para a página de exportação
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Dashboard Export - ${activityData.dashboard_info.title}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                            background-color: #f5f7fa;
                            width: 100%;
                            margin: 0;
                            padding: 20px;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            text-rendering: optimizeLegibility;
                            overflow: visible;
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                            backface-visibility: hidden;
                            -webkit-backface-visibility: hidden;
                        }
                        
                        .dashboard-container {
                            background-color: #f5f7fa;
                            width: 1200px;
                            margin: 0 auto;
                            min-height: auto;
                            overflow: visible;
                            position: relative;
                            padding: 20px;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            text-rendering: optimizeLegibility;
                            transform: translateZ(0); /* Force hardware acceleration */
                            will-change: transform; /* Optimize for changes */
                        }
                        
                        .header {
                            background-color: white;
                            padding: 24px;
                            border-radius: 12px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 24px;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        }
                        
                        .header h1 {
                            margin: 0 0 4px 0;
                            font-size: 24px;
                            font-weight: 600;
                            color: #0a2647;
                        }
                        
                        .header span {
                            color: #64748b;
                            font-size: 14px;
                        }
                        
                        .last-update {
                            background-color: #e0f2fe;
                            padding: 6px 14px;
                            border-radius: 20px;
                            font-size: 14px;
                            color: #0a2647;
                            font-weight: 500;
                        }
                        
                        .companies-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 24px;
                        }
                        
                        .company-card {
                            background-color: white;
                            padding: 24px;
                            border-radius: 12px;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        }
                        
                        .company-label {
                            font-size: 14px;
                            color: #64748b;
                            margin-bottom: 4px;
                        }
                        
                        .company-name {
                            font-size: 18px;
                            font-weight: 500;
                            color: #0f172a;
                        }
                        
                        .stats-section {
                            background-color: white;
                            padding: 24px;
                            border-radius: 12px;
                            margin-bottom: 24px;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        }
                        
                        .section-title {
                            font-size: 20px;
                            font-weight: 600;
                            margin-top: 0;
                            margin-bottom: 16px;
                            color: #0a2647;
                        }
                        
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 16px;
                        }
                        
                        .stat-card {
                            background-color: #f8fafc;
                            padding: 20px;
                            border-radius: 10px;
                            text-align: center;
                        }
                        
                        .stat-card h3 {
                            font-size: 14px;
                            color: #64748b;
                            margin: 0 0 8px 0;
                        }
                        
                        .stat-card p {
                            font-size: 24px;
                            font-weight: 600;
                            color: #0a2647;
                            margin: 0;
                        }
                        
                        .activity-card {
                            background-color: white;
                            border-radius: 12px;
                            padding: 24px;
                            margin-bottom: 20px;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        }
                        
                        .activity-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 16px;
                        }
                        
                        .activity-title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #0a2647;
                            margin: 0 0 4px 0;
                        }
                        
                        .activity-meta {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 16px;
                            margin-bottom: 16px;
                        }
                        
                        .meta-item {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            color: #64748b;
                            font-size: 14px;
                        }
                        
                        .activity-description {
                            font-size: 15px;
                            color: #334155;
                            line-height: 1.6;
                            background-color: #f8fafc;
                            padding: 16px;
                            border-radius: 8px;
                            border-left: 4px solid #2c74b3;
                        }
                        
                        .time-tag {
                            background-color: #e0f2fe;
                            color: #0a2647;
                            padding: 4px 10px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-bottom: 24px;
                            color: #64748b;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="dashboard-container" id="dashboard-content">
                        <!-- Header -->
                        <div class="header">
                            <div>
                                <h1>${activityData.dashboard_info.title}</h1>
                                <span>${activityData.dashboard_info.date}</span>
                            </div>
                            <div class="last-update">
                                Última atualização: ${activityData.dashboard_info.last_update}
                            </div>
                        </div>

                        <!-- Companies Section -->
                        <div class="companies-grid">
                            <div class="company-card">
                                <div class="company-label">Empresa Executora</div>
                                <div class="company-name">${activityData.companies.executing_company}</div>
                            </div>
                            <div class="company-card">
                                <div class="company-label">Empresa Contratante</div>
                                <div class="company-name">${activityData.companies.contracting_company}</div>
                            </div>
                        </div>

                        <!-- Statistics Section -->
                        <div class="stats-section">
                            <h2 class="section-title">Resumo de Atividades</h2>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <h3>Total de Atividades</h3>
                                    <p>${stats.total}</p>
                                </div>
                                <div class="stat-card">
                                    <h3>Tempo Total</h3>
                                    <p>${formatTime(stats.totalTime)}</p>
                                </div>
                                <div class="stat-card">
                                    <h3>Responsáveis</h3>
                                    <p>${stats.uniqueUsers}</p>
                                </div>
                                <div class="stat-card">
                                    <h3>Tempo Médio</h3>
                                    <p>${formatTime(stats.avgTime)}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Activities List -->
                        <h2 class="section-title">Atividades Realizadas</h2>
                        ${activityData.entries.map(entry => `
                            <div class="activity-card">
                                <div class="activity-header">
                                    <div>
                                        <h3 class="activity-title">${entry.atividade}</h3>
                                        <div class="meta-item">
                                            <span>Cliente: ${entry.empresa}</span>
                                        </div>
                                    </div>
                                    <div class="time-tag">
                                        <span>${formatTime(entry.tempo_gasto)}</span>
                                    </div>
                                </div>

                                <div class="activity-meta">
                                    <div class="meta-item">
                                        <span>Responsável: ${entry.responsavel}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span>Solicitante: ${entry.solicitante}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span>Data: ${formatDate(entry.data)}</span>
                                    </div>
                                </div>

                                <div class="activity-description">
                                    ${entry.descritivo}
                                </div>
                            </div>
                        `).join('')}

                        <!-- Footer -->
                        <div class="footer">
                            <p>Relatório de Atividades | ${activityData.companies.executing_company}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Escreve o conteúdo na nova janela
            printWindow.document.write(htmlContent);
            printWindow.document.close();

            // Aguarda o conteúdo carregar completamente e a janela estar pronta
            await new Promise((resolve) => {
                if (printWindow.document.readyState === 'complete') {
                    resolve(true);
                } else {
                    printWindow.onload = () => resolve(true);
                }
                setTimeout(() => resolve(true), 4000); // Timeout de segurança
            });

            // Aguarda mais tempo para renderização completa
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Força scroll para o topo e centraliza
            printWindow.scrollTo(0, 0);
            
            // Captura o body inteiro da nova janela ao invés de um elemento específico
            const bodyElement = printWindow.document.body;
            
            if (!bodyElement) {
                throw new Error('Body da janela não encontrado');
            }

            // Força recálculo de layout
            printWindow.document.documentElement.style.height = 'auto';
            bodyElement.style.height = 'auto';
            
            // Aguarda estabilização final
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('Dimensões da janela:', printWindow.innerWidth, 'x', printWindow.innerHeight);
            console.log('Dimensões do body:', bodyElement.scrollWidth, 'x', bodyElement.scrollHeight);

            // Configurações otimizadas para máxima qualidade da imagem
            const canvas = await html2canvas(bodyElement, {
                scale: 3, // Aumenta para escala 3x para melhor qualidade
                useCORS: true,
                logging: true, // Ativar logs para debug
                allowTaint: false,
                backgroundColor: '#f5f7fa',
                width: bodyElement.scrollWidth,
                height: bodyElement.scrollHeight,
                windowWidth: printWindow.innerWidth,
                windowHeight: printWindow.innerHeight,
                scrollX: 0,
                scrollY: 0,
                foreignObjectRendering: true,
                imageTimeout: 10000, // Timeout maior para carregamento de imagens
                removeContainer: true, // Remove container para melhor renderização
                ignoreElements: (element) => {
                    // Ignora elementos que podem causar problemas
                    return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
                }
            });

            // Fecha a janela temporária
            printWindow.close();

            // Converte para PNG com qualidade máxima
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Dimensões do canvas capturado
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            console.log('Canvas final gerado com alta qualidade:', canvasWidth, 'x', canvasHeight, 'pixels');
            
            // Calcula dimensões do PDF baseado no conteúdo real - ajustado para escala 3x
            const pixelsToMm = 0.25; // Proporção ajustada para escala 3x (mais conservadora)
            const margin = 15; // Margem para segurança
            
            // Dimensões do PDF baseadas no conteúdo + margens
            let pdfWidth = (canvasWidth * pixelsToMm) + (margin * 2);
            let pdfHeight = (canvasHeight * pixelsToMm) + (margin * 2);
            
            // Garante dimensões mínimas
            pdfWidth = Math.max(pdfWidth, 210); // A4 mínimo
            pdfHeight = Math.max(pdfHeight, 297); // A4 mínimo
            
            // Limita o tamanho máximo do PDF
            const maxWidth = 420; // 2x A4 width
            const maxHeight = 1188; // 4x A4 height
            
            if (pdfWidth > maxWidth || pdfHeight > maxHeight) {
                const scale = Math.min(maxWidth / pdfWidth, maxHeight / pdfHeight);
                pdfWidth = pdfWidth * scale;
                pdfHeight = pdfHeight * scale;
                console.log('PDF redimensionado:', pdfWidth, 'x', pdfHeight, 'mm');
            }
            
            console.log('PDF personalizado final:', pdfWidth, 'x', pdfHeight, 'mm');
            
            // Cria PDF com tamanho customizado
            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });
            
            // Adiciona metadados ao PDF
            pdf.setProperties({
                title: `Dashboard - ${activityData.dashboard_info.title}`,
                subject: 'Relatório de Atividades',
                author: activityData.companies.executing_company,
                creator: 'Sistema Modularys'
            });
            
            // Calcula dimensões da imagem no PDF (ocupando toda área útil)
            const imgWidthMm = pdfWidth - (margin * 2);
            const imgHeightMm = pdfHeight - (margin * 2);
            
            // Posiciona a imagem centralizda
            const xOffset = margin;
            const yOffset = margin;
            
            console.log('Posicionamento final:', xOffset, 'x', yOffset, 'mm');
            console.log('Dimensões da imagem no PDF:', imgWidthMm, 'x', imgHeightMm, 'mm');
            
            // Adiciona a imagem ocupando toda a área útil do PDF
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthMm, imgHeightMm, '', 'FAST');
            
            // Salva o PDF
            const filename = `${activityData.dashboard_info.title.replace(/ /g, '_')}_${activityData.dashboard_info.date.replace(/\//g, '-')}.pdf`;
            pdf.save(filename);
            
            console.log('PDF exportado com sucesso!', filename);

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert('Erro ao gerar PDF. Verifique se o bloqueador de pop-ups está desabilitado.');
        } finally {
            setExportingPDF(false);
        }
    };

    // Handle Excel Export (mantido como estava)
    const handleExcelExport = () => {
        setExportingExcel(true);
        ExcelExport.exportToExcel(activityData);
        setExportingExcel(false);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent className="modal-content">
                <ModalHeader>
                    <ModalTitle>{activityData.dashboard_info.title}</ModalTitle>
                    <ModalActions>
                        <ExcelButton onClick={handleExcelExport} disabled={exportingExcel}>
                            {exportingExcel ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Gerando Excel...</span>
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={16} />
                                    <span>Exportar Excel</span>
                                </>
                            )}
                        </ExcelButton>
                        <ActionButton onClick={handlePDFExport} disabled={exportingPDF}>
                            {exportingPDF ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Gerando PDF...</span>
                                </>
                            ) : (
                                <>
                                    <FileText size={16} />
                                    <span>Exportar PDF</span>
                                </>
                            )}
                        </ActionButton>
                        <ModalCloseButton onClick={onClose}>
                            <X size={18} />
                        </ModalCloseButton>
                    </ModalActions>
                </ModalHeader>

                {/* Aplique a ref ao elemento que contém todo o conteúdo que você quer exportar */}
                <DashboardContainer ref={dashboardRef}>
                    {/* Header */}
                    <Header>
                        <HeaderTitle>
                            <h1>{activityData.dashboard_info.title}</h1>
                            <span>{activityData.dashboard_info.date}</span>
                        </HeaderTitle>
                        <LastUpdate>
                            Última atualização: {activityData.dashboard_info.last_update}
                        </LastUpdate>
                    </Header>

                    {/* Companies Section */}
                    <CompaniesGrid>
                        <CompanyCard>
                            <CompanyLabel>Empresa Executora</CompanyLabel>
                            <CompanyName>{activityData.companies.executing_company}</CompanyName>
                        </CompanyCard>
                        <CompanyCard>
                            <CompanyLabel>Empresa Contratante</CompanyLabel>
                            <CompanyName>{activityData.companies.contracting_company}</CompanyName>
                        </CompanyCard>
                    </CompaniesGrid>

                    {/* Statistics Section */}
                    <StatsSection>
                        <SectionTitle>Resumo de Atividades</SectionTitle>
                        <StatsGrid>
                            <StatCard>
                                <h3>Total de Atividades</h3>
                                <p>{stats.total}</p>
                            </StatCard>
                            <StatCard>
                                <h3>Tempo Total</h3>
                                <p>{formatTime(stats.totalTime)}</p>
                            </StatCard>
                            <StatCard>
                                <h3>Responsáveis</h3>
                                <p>{stats.uniqueUsers}</p>
                            </StatCard>
                            <StatCard>
                                <h3>Tempo Médio</h3>
                                <p>{formatTime(stats.avgTime)}</p>
                            </StatCard>
                        </StatsGrid>
                    </StatsSection>

                    {/* Activities List */}
                    <SectionTitle>Atividades Realizadas</SectionTitle>
                    {activityData.entries.map((entry, index) => (
                        <ActivityCard key={index}>
                            <ActivityHeader>
                                <div>
                                    <ActivityTitle>{entry.atividade}</ActivityTitle>
                                    <MetaItem>
                                        <Users size={16} />
                                        <span>Cliente: {entry.empresa}</span>
                                    </MetaItem>
                                </div>
                                <TimeTag>
                                    <Clock size={14} />
                                    <span>{formatTime(entry.tempo_gasto)}</span>
                                </TimeTag>
                            </ActivityHeader>

                            <ActivityMeta>
                                <MetaItem>
                                    <User size={16} />
                                    <span>Responsável: {entry.responsavel}</span>
                                </MetaItem>
                                <MetaItem>
                                    <User size={16} />
                                    <span>Solicitante: {entry.solicitante}</span>
                                </MetaItem>
                                <MetaItem>
                                    <Calendar size={16} />
                                    <span>Data: {formatDate(entry.data)}</span>
                                </MetaItem>
                            </ActivityMeta>

                            <ActivityDescription>
                                {entry.descritivo}
                            </ActivityDescription>
                        </ActivityCard>
                    ))}

                    {/* Footer */}
                    <Footer>
                        <p>Relatório de Atividades | {activityData.companies.executing_company}</p>
                    </Footer>
                </DashboardContainer>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ActivityModal;
