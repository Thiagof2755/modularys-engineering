import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Upload,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Spinner CSS
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

// Global style injection
const GlobalStyle = styled.div`
  ${spinnerCSS}
`;

// TypeScript interfaces
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

const ActionButton = styled.button<{ disabled?: boolean }>`
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
  opacity: ${props => (props.disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${props => (props.disabled ? '#2c74b3' : '#205295')};
  }

  svg {
    margin-right: 8px;
  }
`;

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

const ProgressSection = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: 600;
    color: #0a2647;
  }
`;

const ProgressBarContainer = styled.div`
  height: 16px;
  background-color: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2c74b3, #5499c7);
  border-radius: 8px;
  width: ${props => props.width}%;
  transition: width 1s ease;
`;

const ProgressText = styled.div`
  text-align: right;
  font-size: 16px;
  font-weight: 500;
  color: #0a2647;
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
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
  p {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #0a2647;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  color: #0a2647;
`;

const StageContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #f8fafc;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover { background-color: #f1f5f9; }
`;

const StageTitle = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0 0 0 10px;
    font-size: 18px;
    font-weight: 500;
    color: #0f172a;
  }
  svg { color: #64748b; }
`;

const StageProgress = styled.div`
  display: flex;
  align-items: center;
`;

const StageProgressBar = styled.div`
  width: 120px;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
`;

const StageProgressFill = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2c74b3, #5499c7);
  border-radius: 4px;
  width: ${props => props.width}%;
`;

const StageProgressText = styled.span`
  font-weight: 600;
  color: #0a2647;
`;

const TaskListHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 3fr 1fr 1fr;
  background-color: #f1f5f9;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
`;

const TaskRow = styled.div<{ isChild?: boolean }>`
  display: grid;
  grid-template-columns: 40px 3fr 1fr 1fr;
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  align-items: center;
  color: #0f172a;
  &:last-child { border-bottom: none; }
  &:hover { background-color: #f8fafc; }
`;

const TaskStatus = styled.div<{ status: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'complete': return '#22c55e';
      case 'in_progress': return '#f59e0b';
      case 'incomplete': return '#ef4444';
      default: return '#94a3b8';
    }
  }};
`;

const TaskName = styled.div<{ isChild?: boolean }>`
  font-weight: ${props => (props.isChild ? '400' : '500')};
  padding-left: ${props => (props.isChild ? '20px' : '0')};
  opacity: ${props => (props.isChild ? '0.9' : '1')};
`;

const TaskDuration = styled.div`
  text-align: center;
  color: #64748b;
  font-weight: 500;
`;

const TaskCompletionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TaskCompletionBar = styled.div`
  width: 80px;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 8px;
`;

const TaskCompletionProgress = styled.div<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2c74b3, #5499c7);
  border-radius: 4px;
  width: ${props => props.width}%;
`;

const TaskCompletionText = styled.span`
  font-weight: 600;
  color: #0a2647;
`;

const PendenciesSection = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PendenciesHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  h2 {
    margin: 0 0 0 10px;
    font-size: 20px;
    font-weight: 600;
    color: #0a2647;
  }
  svg { color: #f59e0b; }
`;

const PendenciesList = styled.ul`
  margin: 0;
  padding-left: 20px;
  li {
    margin-bottom: 12px;
    color: #0f172a;
    font-size: 15px;
    &:last-child { margin-bottom: 0; }
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-bottom: 24px;
  color: #64748b;
  font-size: 14px;
`;

// Main Component
const DashboardModal: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [exportingPDF, setExportingPDF] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Import JSON
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        if (jsonData.tasks && !jsonData.stages) {
          jsonData.stages = [{
            name: 'Projeto Completo',
            id: 'stage-main',
            completion_percentage: jsonData.progress_overview.total_progress_percentage,
            tasks: jsonData.tasks
          }];
          delete jsonData.tasks;
        }
        setDashboardData(jsonData);
        const init: Record<string, boolean> = {};
        jsonData.stages?.forEach((stg: Stage) => { init[stg.id] = true; });
        setExpandedStages(init);
        setIsModalOpen(true);
      } catch {
        alert('Arquivo JSON inválido');
      }
    };
    reader.readAsText(file);
  };

  // Export to PDF with higher resolution
  const exportToPDF = () => {
    if (!dashboardRef.current) return;
    const element = dashboardRef.current;
    const filename = `${dashboardData?.dashboard_info.title || 'Dashboard'}.pdf`;
    const pdfOptions = {
      scale: 2, // Increase scale for higher resolution
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      logging: false,
      backgroundColor: '#FFFFFF'
    };
    setExportingPDF(true);

    html2canvas(element, pdfOptions).then(canvas => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageW = orientation === 'landscape' ? 297 : 210;
      const pageH = orientation === 'landscape' ? 210 : 297;
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;

      let finalW = imgW;
      let finalH = imgH;
      if (imgH > pageH - 20) {
        finalH = pageH - 20;
        finalW = (canvas.width * finalH) / canvas.height;
      }

      const xOff = (pageW - finalW) / 2;
      const yOff = (pageH - finalH) / 2;

      pdf.addImage(imgData, 'PNG', xOff, yOff, finalW, finalH);
      pdf.save(filename);
      setExportingPDF(false);
    }).catch(err => {
      console.error('Erro ao gerar PDF:', err);
      setExportingPDF(false);
      alert('Houve um erro ao gerar o PDF. Por favor, tente novamente.');
    });
  };

  const toggleStage = (id: string) =>
    setExpandedStages(prev => ({ ...prev, [id]: !prev[id] }));

  const renderTaskRow = (task: Task, isChild = false) => (
    <div key={task.name}>
      <TaskRow isChild={isChild}>
        <div><TaskStatus status={task.status} /></div>
        <TaskName isChild={isChild}>{task.name}</TaskName>
        <TaskDuration>{task.duration_hours}h</TaskDuration>
        <TaskCompletionContainer>
          <TaskCompletionBar>
            <TaskCompletionProgress width={task.completion_percentage} />
          </TaskCompletionBar>
          <TaskCompletionText>{task.completion_percentage}%</TaskCompletionText>
        </TaskCompletionContainer>
      </TaskRow>
      {task.subtasks?.map(sub => renderTaskRow(sub, true))}
    </div>
  );

  const renderStage = (stage: Stage) => {
    const isExpanded = expandedStages[stage.id];
    return (
      <StageContainer key={stage.id}>
        <StageHeader onClick={() => toggleStage(stage.id)}>
          <StageTitle>
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <h3>{stage.name}</h3>
          </StageTitle>
          <StageProgress>
            <StageProgressBar>
              <StageProgressFill width={stage.completion_percentage} />
            </StageProgressBar>
            <StageProgressText>{stage.completion_percentage}%</StageProgressText>
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
            <div>{stage.tasks.map(t => renderTaskRow(t))}</div>
          </>
        )}
      </StageContainer>
    );
  };

  return (
    <>
      <GlobalStyle />
      <Container>
        <UploadCard>
          <CardTitle>Dashboard Medicao</CardTitle>
          <CardDescription>
            Carregue seu arquivo JSON para visualizar o dashboard de medição
          </CardDescription>
          <label htmlFor="json-upload">
            <UploadArea>
              <UploadIcon><Upload size={28} /></UploadIcon>
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

        {isModalOpen && dashboardData && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>{dashboardData.dashboard_info.title}</ModalTitle>
                <ModalActions>
                  <ActionButton onClick={exportToPDF} disabled={exportingPDF}>
                    {exportingPDF ? (
                      <>
                        <span className="spinner" />
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
                <Header>
                  <HeaderTitle>
                    <h1>{dashboardData.dashboard_info.title}</h1>
                    <span>{dashboardData.dashboard_info.date}</span>
                  </HeaderTitle>
                  <LastUpdate>
                    Última atualização: {dashboardData.dashboard_info.last_update}
                  </LastUpdate>
                </Header>

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

                <ProgressSection>
                  <h2>Progresso Geral</h2>
                  <ProgressBarContainer>
                    <ProgressBar width={dashboardData.progress_overview.total_progress_percentage} />
                  </ProgressBarContainer>
                  <ProgressText>
                    {dashboardData.progress_overview.total_progress_percentage}% Concluído
                  </ProgressText>
                </ProgressSection>

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

                <SectionTitle>Etapas do Projeto</SectionTitle>
                {dashboardData.stages.map(renderStage)}

                <PendenciesSection>
                  <PendenciesHeader>
                    <AlertCircle size={20} />
                    <h2>Pendências</h2>
                  </PendenciesHeader>
                  <PendenciesList>
                    {dashboardData.pendencies.length > 0
                      ? dashboardData.pendencies.map((p, i) => <li key={i}>{p}</li>)
                      : <li>Nenhuma pendência registrada</li>}
                  </PendenciesList>
                </PendenciesSection>

                <Footer>
                  <p>Dashboard Medicao | {dashboardData.companies.executing_company}</p>
                </Footer>
              </DashboardContainer>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </>
  );
};

export default DashboardModal;
