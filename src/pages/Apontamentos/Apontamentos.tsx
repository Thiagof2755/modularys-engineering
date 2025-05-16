import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, Download, FileText, Search, Upload, User, Users, X, FileSpreadsheet } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Define TypeScript interfaces
interface ActivityEntry {
    empresa: string;
    responsavel: string;
    solicitante: string;
    atividade: string;
    data: string;
    tempo_gasto: string;
    descritivo: string;
}

interface ActivityData {
    dashboard_info: {
        title: string;
        date: string;
        last_update: string;
    };
    companies: {
        executing_company: string;
        contracting_company: string;
    };
    entries: ActivityEntry[];
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const UploadCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  transition: all 0.3s ease;
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #0a2647;
  margin-bottom: 16px;
`;

const CardDescription = styled.p`
  color: #64748b;
  margin-bottom: 32px;
`;

const UploadArea = styled.div`
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  
  &:hover {
    border-color: #2c74b3;
    background-color: #f1f5f9;
  }
`;

const UploadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: #e0f2fe;
  border-radius: 50%;
  margin-bottom: 16px;
  
  svg {
    color: #2c74b3;
  }
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #334155;
  margin-bottom: 8px;
`;

const UploadHint = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const HiddenInput = styled.input`
  display: none;
`;

// Modal Components
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

// CSS for loading spinner
const spinnerCSS = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}
`;

const GlobalStyle = styled.div`
    ${spinnerCSS}
`;

// Helper functions
const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return `${hours}h ${minutes}min`;
};

const sumTimes = (times: any[]) => {
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

const Apontamentos = () => {
    const [activityData, setActivityData] = useState<ActivityData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);
    const dashboardRef = useRef<HTMLDivElement>(null);

    // Handle JSON file import
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    setActivityData(jsonData);
                    setIsModalOpen(true);
                } catch (error) {
                    alert('Arquivo JSON inválido');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
    };

    // Export to PDF - Improved function with better spacing and no borders
    const exportToPDF = async () => {
        if (!dashboardRef.current || !activityData) return;

        const element = dashboardRef.current;
        const filename = `${activityData.dashboard_info.title || 'Relatório de Atividades'}.pdf`;

        setExportingPDF(true);

        try {
            // Create PDF document
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // PDF dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // PDF content settings
            const margin = 10;
            const contentWidth = pageWidth - (margin * 2);
            
            // Add header information
            let yPos = margin;
            
            // Title and Date
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(activityData.dashboard_info.title, margin, yPos);
            yPos += 7;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Data: ${activityData.dashboard_info.date}`, margin, yPos);
            yPos += 5;
            
            pdf.text(`Última atualização: ${activityData.dashboard_info.last_update}`, margin, yPos);
            yPos += 10;
            
            // Companies
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Informações da Empresa', margin, yPos);
            yPos += 7;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Empresa Executora: ${activityData.companies.executing_company}`, margin, yPos);
            yPos += 5;
            
            pdf.text(`Empresa Contratante: ${activityData.companies.contracting_company}`, margin, yPos);
            yPos += 10;
            
            // Statistics
            const stats = calculateStats();
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Resumo de Atividades', margin, yPos);
            yPos += 7;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Total de Atividades: ${stats.total}`, margin, yPos);
            yPos += 5;
            
            pdf.text(`Tempo Total: ${formatTime(stats.totalTime)}`, margin, yPos);
            yPos += 5;
            
            pdf.text(`Responsáveis: ${stats.uniqueUsers}`, margin, yPos);
            yPos += 5;
            
            pdf.text(`Tempo Médio: ${formatTime(stats.avgTime)}`, margin, yPos);
            yPos += 12;
            
            // Activities List
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Atividades Realizadas', margin, yPos);
            yPos += 8;
            
            // List each activity
            for (const entry of activityData.entries) {
                // Check if we need a new page
                if (yPos > pageHeight - margin * 2) {
                    pdf.addPage();
                    yPos = margin + 5;
                }
                
                // Activity title and time
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                
                // Handle long activity titles
                const activityTitle = entry.atividade;
                if (pdf.getStringUnitWidth(activityTitle) * 11 / pdf.internal.scaleFactor > contentWidth - 35) {
                    const titleLines = pdf.splitTextToSize(activityTitle, contentWidth - 35);
                    pdf.text(titleLines, margin, yPos);
                    yPos += (titleLines.length * 5);
                } else {
                    pdf.text(activityTitle, margin, yPos);
                    yPos += 5;
                }
                
                // Time spent
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.text(`Tempo: ${formatTime(entry.tempo_gasto)}`, contentWidth - 20, yPos - 5, { align: 'right' });
                
                // Meta information
                pdf.text(`Cliente: ${entry.empresa}`, margin, yPos);
                yPos += 4;
                
                pdf.text(`Responsável: ${entry.responsavel} | Solicitante: ${entry.solicitante} | Data: ${formatDate(entry.data)}`, margin, yPos);
                yPos += 6;
                
                // Description
                pdf.setFontSize(9);
                pdf.setDrawColor(44, 116, 179); // #2c74b3
                
                // Draw a subtle border
                pdf.setLineWidth(0.1);
                pdf.line(margin, yPos - 1, margin + contentWidth, yPos - 1);
                
                // Handle long descriptions with proper wrapping
                const descLines = pdf.splitTextToSize(entry.descritivo, contentWidth);
                pdf.text(descLines, margin, yPos + 4);
                
                // Move position after description
                yPos += (descLines.length * 4) + 8;
                
                // Add some space between activities
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.1);
                pdf.line(margin, yPos, margin + contentWidth, yPos);
                yPos += 8;
            }
            
            // Footer
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Relatório de Atividades | ${activityData.companies.executing_company}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            
            // Save the PDF
            pdf.save(filename);
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            alert("Houve um erro ao gerar o PDF. Por favor, tente novamente.");
        } finally {
            setExportingPDF(false);
        }
    };

    // Export to Excel function
    const exportToExcel = () => {
        if (!activityData) return;
        
        setExportingExcel(true);
        
        try {
            // Prepare data for Excel
            const excelData = activityData.entries.map(entry => ({
                'Responsável': entry.responsavel,
                'Solicitante': entry.solicitante,
                'Atividade': entry.atividade,
                'Data': entry.data,
                'Tempo Gasto': entry.tempo_gasto,
                'Descritivo': entry.descritivo
            }));
            
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Atividades');
            
            // Generate Excel file
            const filename = `${activityData.dashboard_info.title || 'Relatório de Atividades'}.xlsx`;
            XLSX.writeFile(workbook, filename);
        } catch (err) {
            console.error("Erro ao gerar Excel:", err);
            alert("Houve um erro ao gerar o Excel. Por favor, tente novamente.");
        } finally {
            setExportingExcel(false);
        }
    };

    // Calculate statistics
    const calculateStats = () => {
        if (!activityData) return { total: 0, totalTime: "0:00", uniqueUsers: 0, avgTime: "0:00" };

        const entries = activityData.entries;
        const total = entries.length;
        const totalTimeStr = sumTimes(entries.map(e => e.tempo_gasto));
        const uniqueUsers = new Set(entries.map(e => e.responsavel)).size;

        // Calculate average time
        const [totalHours, totalMinutes] = totalTimeStr.split(':').map(Number);
        const totalMinutesAll = (totalHours * 60) + totalMinutes;
        const avgMinutes = Math.round(totalMinutesAll / total);
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = avgMinutes % 60;
        const avgTime = `${avgHours}:${avgMins.toString().padStart(2, '0')}`;

        return { total, totalTime: totalTimeStr, uniqueUsers, avgTime };
    };

    const stats = calculateStats();

    return (
        <Container>
            <GlobalStyle />
            <UploadCard>
                <CardTitle>Relatório de Atividades</CardTitle>
                <CardDescription>
                    Carregue seu arquivo JSON para visualizar o relatório de atividades
                </CardDescription>

                <label htmlFor="json-upload">
                    <UploadArea>
                        <UploadIcon>
                            <Upload size={28} />
                        </UploadIcon>
                        <UploadText>Clique ou arraste seu arquivo JSON aqui</UploadText>
                        <UploadHint>Suporta apenas arquivos .json</UploadHint>
                    </UploadArea>
                    <HiddenInput
                        id="json-upload"
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                    />
                </label>
            </UploadCard>

            {/* Activities Report Modal */}
            {isModalOpen && activityData && (
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>{activityData.dashboard_info.title}</ModalTitle>
                            <ModalActions>
                                <ExcelButton onClick={exportToExcel} disabled={exportingExcel}>
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
                                <ActionButton onClick={exportToPDF} disabled={exportingPDF}>
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
                                <ModalCloseButton onClick={() => setIsModalOpen(false)}>
                                    <X size={18} />
                                </ModalCloseButton>
                            </ModalActions>
                        </ModalHeader>

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

                            {/* Activities List - ALL at once without pagination */}
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
            )}
        </Container>
    );
};

export default Apontamentos;