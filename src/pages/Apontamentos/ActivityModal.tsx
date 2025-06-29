import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, Download, FileText, Search, User, Users, X, FileSpreadsheet } from 'lucide-react';
import { ActivityData } from './Apontamentos';
import PDFExport from './PDFExport';
import ExcelExport from './ExcelExport';

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
        const avgMinutes = Math.round(totalMinutesAll / total);
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

    // Handle PDF Export
    const handlePDFExport = async () => {
        setExportingPDF(true);
        await PDFExport.exportToPDF(activityData, stats);
        setExportingPDF(false);
    };

    // Handle Excel Export
    const handleExcelExport = () => {
        setExportingExcel(true);
        ExcelExport.exportToExcel(activityData);
        setExportingExcel(false);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay>
            <ModalContent>
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