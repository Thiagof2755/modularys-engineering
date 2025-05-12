import React, { useState, useRef, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import styled, { createGlobalStyle } from 'styled-components';
import { ChevronDown, ChevronRight, AlertCircle, FileText, Download, UploadCloud } from 'lucide-react';

// Define TypeScript interfaces for the dashboard data with improved structure
interface Task {
    name: string;
    type: 'parent' | 'child';
    status: 'complete' | 'in_progress' | 'incomplete';
    duration_hours: number;
    completion_percentage: number;
    subtasks?: Task[];
}

interface Stage {
    name: string;
    id: string;
    completion_percentage: number;
    tasks: Task[];
}

interface DashboardData {
    dashboard_info: {
        title: string;
        date: string;
        last_update: string;
    };
    companies: {
        executing_company: string;
        contracting_company: string;
    };
    progress_overview: {
        total_progress_percentage: number;
        total_tasks: number;
        completed_tasks: number;
        in_progress_tasks: number;
        total_hours: number;
    };
    stages: Stage[];
    pendencies: string[];
}

// Styled Components
const GlobalStyle = createGlobalStyle`
  :root {
    --dark-blue: #0a2647;
    --medium-blue: #144272;
    --light-blue: #205295;
    --accent-blue: #2c74b3;
    --highlight: #5499c7;
    --text-light: #e6f2ff;
    --text-dark: #102a43;
    --complete: #2ecc71;
    --incomplete: #e74c3c;
    --in-progress: #f39c12;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--dark-blue);
    color: var(--text-light);
    margin: 0;
    padding: 0;
  }
`;

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ImportExportSection = styled.div`
  background-color: var(--medium-blue);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ImportButton = styled.label`
  display: flex;
  align-items: center;
  background-color: var(--light-blue);
  color: var(--text-light);
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 10px;
  
  &:hover {
    background-color: var(--accent-blue);
  }
  
  input {
    display: none;
  }
  
  svg {
    margin-right: 8px;
  }
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  background-color: var(--light-blue);
  color: var(--text-light);
  padding: 10px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--accent-blue);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const Header = styled.div`
  background-color: var(--medium-blue);
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.div`
  h1 {
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  span {
    color: var(--highlight);
    font-size: 14px;
  }
`;

const LastUpdate = styled.div`
  margin-top: 10px;
  background-color: var(--light-blue);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
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
  background-color: var(--medium-blue);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CompanyLabel = styled.div`
  font-size: 14px;
  color: var(--highlight);
  margin-bottom: 4px;
`;

const CompanyName = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const ProgressSection = styled.div`
  background-color: var(--medium-blue);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 500;
  }
`;

const ProgressBarContainer = styled.div`
  height: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--highlight));
  border-radius: 8px;
  width: ${props => props.width}%;
  transition: width 1s ease;
`;

const ProgressText = styled.div`
  text-align: right;
  font-size: 16px;
  font-weight: 500;
`;

const StatusCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatusCard = styled.div`
  background-color: var(--medium-blue);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: var(--highlight);
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 16px;
`;

const StageContainer = styled.div`
  background-color: var(--medium-blue);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--light-blue);
  cursor: pointer;
`;

const StageTitle = styled.div`
  display: flex;
  align-items: center;
  
  h3 {
    margin: 0 0 0 10px;
    font-size: 18px;
    font-weight: 500;
  }
`;

const StageProgress = styled.div`
  display: flex;
  align-items: center;
`;

const StageProgressBar = styled.div`
  width: 120px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
`;

const StageProgressFill = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--highlight));
  border-radius: 4px;
  width: ${props => props.width}%;
`;

const TaskListHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 3fr 1fr 1fr;
  background-color: var(--light-blue);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
`;

const TaskRow = styled.div<{ isChild?: boolean }>`
  display: grid;
  grid-template-columns: 40px 3fr 1fr 1fr;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const TaskStatus = styled.div<{ status: string }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'complete': return 'var(--complete)';
      case 'in_progress': return 'var(--in-progress)';
      case 'incomplete': return 'var(--incomplete)';
      default: return 'gray';
    }
  }};
`;

const TaskName = styled.div<{ isChild?: boolean }>`
  font-weight: ${props => props.isChild ? '400' : '500'};
  padding-left: ${props => props.isChild ? '20px' : '0'};
  opacity: ${props => props.isChild ? '0.9' : '1'};
`;

const TaskDuration = styled.div`
  text-align: center;
`;

const TaskCompletionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TaskCompletionBar = styled.div`
  width: 80px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-right: 8px;
`;

const TaskCompletionProgress = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--highlight));
  border-radius: 4px;
  width: ${props => props.width}%;
`;

const PendenciesSection = styled.div`
  background-color: var(--medium-blue);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PendenciesHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  h2 {
    margin: 0 0 0 10px;
    font-size: 20px;
    font-weight: 500;
  }
  
  svg {
    color: var(--in-progress);
  }
`;

const PendenciesList = styled.ul`
  margin: 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 8px;
    color: var(--text-light);
    opacity: 0.9;
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-bottom: 24px;
  color: var(--highlight);
  font-size: 14px;
  opacity: 0.8;
`;

const EmptyState = styled.div`
  background-color: var(--medium-blue);
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    color: var(--highlight);
  }
`;

const NotaModelo21Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
    const dashboardRef = useRef<HTMLDivElement>(null);

    // Handle JSON file import
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    
                    // Transform old format to new format if needed
                    if (jsonData.tasks && !jsonData.stages) {
                        // Create default stage with all tasks
                        jsonData.stages = [
                            {
                                name: "Projeto Completo",
                                id: "stage-main",
                                completion_percentage: jsonData.progress_overview.total_progress_percentage,
                                tasks: jsonData.tasks
                            }
                        ];
                        delete jsonData.tasks;
                    }
                    
                    setDashboardData(jsonData as DashboardData);
                    
                    // Initialize all stages as expanded
                    const stagesState: Record<string, boolean> = {};
                    if (jsonData.stages) {
                        jsonData.stages.forEach((stage: Stage) => {
                            stagesState[stage.id] = true;
                        });
                    }
                    setExpandedStages(stagesState);
                    
                } catch (error) {
                    alert('Invalid JSON file');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        if (dashboardRef.current) {
            alert("Função de exportação para PDF seria implementada aqui");
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        if (!dashboardData) return;

        // Prepare data for Excel export
        const excelData: any[] = [
            ['Dashboard de Medição - Nota Modelo 21'],
            ['Data', dashboardData.dashboard_info.date],
            ['Última Atualização', dashboardData.dashboard_info.last_update],
            [],
            ['Empresa Executora', dashboardData.companies.executing_company],
            ['Empresa Contratante', dashboardData.companies.contracting_company],
            [],
            ['Progresso Geral'],
            ['Total de Tarefas', dashboardData.progress_overview.total_tasks],
            ['Tarefas Concluídas', dashboardData.progress_overview.completed_tasks],
            ['Tarefas em Andamento', dashboardData.progress_overview.in_progress_tasks],
            ['Progresso Total', `${dashboardData.progress_overview.total_progress_percentage}%`],
            ['Total de Horas', dashboardData.progress_overview.total_hours],
            [],
            ['Etapas e Tarefas']
        ];

        // Function to flatten tasks
        const flattenTasks = (tasks: Task[], indent = '') => {
            tasks.forEach(task => {
                excelData.push([
                    `${indent}${task.name}`,
                    task.status,
                    task.duration_hours,
                    `${task.completion_percentage}%`
                ]);

                if (task.subtasks) {
                    flattenTasks(task.subtasks, indent + '  ');
                }
            });
        };

        // Add each stage and its tasks
        dashboardData.stages.forEach(stage => {
            excelData.push([`Etapa: ${stage.name}`, '', '', `${stage.completion_percentage}%`]);
            flattenTasks(stage.tasks, '  ');
        });

        excelData.push([], ['Pendências']);
        dashboardData.pendencies.forEach(pendency => {
            excelData.push([pendency]);
        });

        alert("Função de exportação para Excel seria implementada aqui");
    };

    // Toggle stage expansion
    const toggleStage = (stageId: string) => {
        setExpandedStages(prev => ({
            ...prev,
            [stageId]: !prev[stageId]
        }));
    };

    // Render task row with improved styling
    const renderTaskRow = (task: Task, isChild = false): ReactNode => {
        return (
            <div key={task.name}>
                <TaskRow isChild={isChild}>
                    <div>
                        <TaskStatus status={task.status} />
                    </div>
                    <TaskName isChild={isChild}>{task.name}</TaskName>
                    <TaskDuration>{task.duration_hours}h</TaskDuration>
                    <TaskCompletionContainer>
                        <TaskCompletionBar>
                            <TaskCompletionProgress width={task.completion_percentage} />
                        </TaskCompletionBar>
                        <span>{task.completion_percentage}%</span>
                    </TaskCompletionContainer>
                </TaskRow>
                {task.subtasks?.map((subtask) => renderTaskRow(subtask, true))}
            </div>
        );
    };

    // Render stage section with collapsible content
    const renderStage = (stage: Stage): ReactNode => {
        const isExpanded = expandedStages[stage.id];
        
        return (
            <StageContainer key={stage.id}>
                <StageHeader onClick={() => toggleStage(stage.id)}>
                    <StageTitle>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <h3>{stage.name}</h3>
                    </StageTitle>
                    <StageProgress>
                        <StageProgressBar>
                            <StageProgressFill width={stage.completion_percentage} />
                        </StageProgressBar>
                        <span>{stage.completion_percentage}%</span>
                    </StageProgress>
                </StageHeader>
                
                {isExpanded && (
                    <>
                        <TaskListHeader>
                            <div>Status</div>
                            <div>Tarefa</div>
                            <div>Duração</div>
                            <div>Progresso</div>
                        </TaskListHeader>
                        <div>
                            {stage.tasks.map((task) => renderTaskRow(task))}
                        </div>
                    </>
                )}
            </StageContainer>
        );
    };

    return (
        <>
            <GlobalStyle />
            <DashboardContainer>
                {/* Import/Export Section */}
                <ImportExportSection>
                    <ImportButton>
                        <UploadCloud size={20} />
                        <span>Importar JSON</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileImport}
                        />
                    </ImportButton>
                    
                    {dashboardData && (
                        <ExportButtonsContainer>
                            <ExportButton onClick={exportToPDF}>
                                <FileText size={20} />
                                <span>Exportar PDF</span>
                            </ExportButton>
                            <ExportButton onClick={exportToExcel}>
                                <Download size={20} />
                                <span>Exportar Excel</span>
                            </ExportButton>
                        </ExportButtonsContainer>
                    )}
                </ImportExportSection>

                {/* Dashboard Content */}
                {dashboardData ? (
                    <div ref={dashboardRef}>
                        {/* Header */}
                        <Header>
                            <HeaderTitle>
                                <h1>{dashboardData.dashboard_info.title}</h1>
                                <span>{dashboardData.dashboard_info.date}</span>
                            </HeaderTitle>
                            <LastUpdate>
                                Última atualização: {dashboardData.dashboard_info.last_update}
                            </LastUpdate>
                        </Header>

                        {/* Companies Section */}
                        <CompaniesGrid>
                            <CompanyCard>
                                <CompanyLabel>Empresa Executora</CompanyLabel>
                                <CompanyName>{dashboardData.companies.executing_company}</CompanyName>
                            </CompanyCard>
                            <CompanyCard>
                                <CompanyLabel>Empresa Contratante</CompanyLabel>
                                <CompanyName>{dashboardData.companies.contracting_company}</CompanyName>
                            </CompanyCard>
                        </CompaniesGrid>

                        {/* Overall Progress */}
                        <ProgressSection>
                            <h2>Progresso Geral</h2>
                            <ProgressBarContainer>
                                <ProgressBar width={dashboardData.progress_overview.total_progress_percentage} />
                            </ProgressBarContainer>
                            <ProgressText>
                                {dashboardData.progress_overview.total_progress_percentage}% Concluído
                            </ProgressText>
                        </ProgressSection>

                        {/* Status Cards */}
                        <StatusCardsGrid>
                            <StatusCard>
                                <h3>Total de Tarefas</h3>
                                <p>{dashboardData.progress_overview.total_tasks}</p>
                            </StatusCard>
                            <StatusCard>
                                <h3>Concluídas</h3>
                                <p>{dashboardData.progress_overview.completed_tasks}</p>
                            </StatusCard>
                            <StatusCard>
                                <h3>Em Andamento</h3>
                                <p>{dashboardData.progress_overview.in_progress_tasks}</p>
                            </StatusCard>
                            <StatusCard>
                                <h3>Horas Totais</h3>
                                <p>{dashboardData.progress_overview.total_hours}h</p>
                            </StatusCard>
                        </StatusCardsGrid>

                        {/* Stages and Tasks */}
                        <SectionTitle>Etapas do Projeto</SectionTitle>
                        {dashboardData.stages.map(stage => renderStage(stage))}

                        {/* Pendencies */}
                        <PendenciesSection>
                            <PendenciesHeader>
                                <AlertCircle size={20} />
                                <h2>Pendências</h2>
                            </PendenciesHeader>
                            <PendenciesList>
                                {dashboardData.pendencies.length > 0 ? (
                                    dashboardData.pendencies.map((pendency, index) => (
                                        <li key={index}>{pendency}</li>
                                    ))
                                ) : (
                                    <li>Nenhuma pendência registrada</li>
                                )}
                            </PendenciesList>
                        </PendenciesSection>

                        {/* Footer */}
                        <Footer>
                            <p>Dashboard Nota Modelo 21 | {dashboardData.companies.executing_company}</p>
                        </Footer>
                    </div>
                ) : (
                    <EmptyState>
                        <h2>Nenhum dado carregado</h2>
                        <p>Importe um arquivo JSON para visualizar o dashboard</p>
                    </EmptyState>
                )}
            </DashboardContainer>
        </>
    );
};

export default NotaModelo21Dashboard;