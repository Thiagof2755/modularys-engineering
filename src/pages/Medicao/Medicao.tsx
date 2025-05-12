import React, { useState, useRef, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

// Define TypeScript interfaces for the dashboard data
interface Task {
    name: string;
    type: 'parent' | 'child';
    status: 'complete' | 'in_progress' | 'incomplete';
    duration_hours: number;
    completion_percentage: number;
    subtasks?: Task[];
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
    tasks: Task[];
    pendencies: string[];
}

const NotaModelo21Dashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

    // Handle JSON file import
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    setDashboardData(jsonData);
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        if (dashboardRef.current) {
            const element = dashboardRef.current;
            const opt = {
                margin: 10,
                filename: 'dashboard_nota_modelo_21.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
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
            ['Tarefas']
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

        flattenTasks(dashboardData.tasks);

        excelData.push([], ['Pendências']);
        dashboardData.pendencies.forEach(pendency => {
            excelData.push([pendency]);
        });

        // Create worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);

        // Create workbook and export
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
        XLSX.writeFile(workbook, 'dashboard_nota_modelo_21.xlsx');
    };

    // Render task row
    const renderTaskRow = (task: Task, isChild = false): ReactNode => {
        let statusClass = '';
        switch (task.status) {
            case 'complete':
                statusClass = 'complete';
                break;
            case 'in_progress':
                statusClass = 'in-progress';
                break;
            case 'incomplete':
                statusClass = 'incomplete';
                break;
        }

        return (
            <React.Fragment key={task.name}>
                <div className="task-row">
                    <div><div className={`task-status ${statusClass}`}></div></div>
                    <div className={`task-name ${isChild ? 'child' : 'parent'}`}>{task.name}</div>
                    <div className="task-duration">{task.duration_hours}h</div>
                    <div className="task-completion">
                        <div className="task-completion-bar">
                            <div
                                className="task-completion-progress"
                                style={{ width: `${task.completion_percentage}%` }}
                            ></div>
                        </div>
                        {task.completion_percentage}%
                    </div>
                </div>
                {task.subtasks?.map((subtask) => renderTaskRow(subtask, true))}
            </React.Fragment>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="file-import-section">
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    placeholder="Import JSON"
                />
                {dashboardData && (
                    <div className="export-buttons">
                        <button onClick={exportToPDF}>Exportar PDF</button>
                        <button onClick={exportToExcel}>Exportar Excel</button>
                    </div>
                )}
            </div>

            {dashboardData && (
                <div ref={dashboardRef} className="container">
                    <div className="header">
                        <h1>{dashboardData.dashboard_info.title}</h1>
                        <span>{dashboardData.dashboard_info.date}</span>
                    </div>

                    <div className="companies">
                        <div className="company">
                            <span className="company-label">Empresa Executora</span>
                            <span className="company-name">{dashboardData.companies.executing_company}</span>
                        </div>
                        <div className="company">
                            <span className="company-label">Empresa Contratante</span>
                            <span className="company-name">{dashboardData.companies.contracting_company}</span>
                        </div>
                    </div>

                    <div className="progress-overview">
                        <h2>Progresso Geral</h2>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{ width: `${dashboardData.progress_overview.total_progress_percentage}%` }}
                            ></div>
                        </div>
                        <div className="progress-text">
                            {dashboardData.progress_overview.total_progress_percentage}% Concluído
                        </div>
                    </div>

                    <div className="status-summary">
                        <div className="status-card">
                            <h3>Tarefas Totais</h3>
                            <p>{dashboardData.progress_overview.total_tasks}</p>
                        </div>
                        <div className="status-card">
                            <h3>Concluídas</h3>
                            <p>{dashboardData.progress_overview.completed_tasks}</p>
                        </div>
                        <div className="status-card">
                            <h3>Em Andamento</h3>
                            <p>{dashboardData.progress_overview.in_progress_tasks}</p>
                        </div>
                        <div className="status-card">
                            <h3>Horas Totais</h3>
                            <p>{dashboardData.progress_overview.total_hours}h</p>
                        </div>
                    </div>

                    <div className="task-list">
                        <div className="task-list-header">
                            <div>Status</div>
                            <div>Tarefa</div>
                            <div>Duração</div>
                            <div>Progresso</div>
                        </div>

                        {dashboardData.tasks.map((task) => renderTaskRow(task))}
                    </div>

                    <div className="pendencies">
                        <h2>Pendências</h2>
                        <ul>
                            {dashboardData.pendencies.map((pendency, index) => (
                                <li key={index}>{pendency}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer">
                        <p>Última atualização: {dashboardData.dashboard_info.last_update} | {dashboardData.companies.executing_company}</p>
                    </div>
                </div>
            )}

            <style>{`
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
    
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .header {
        background-color: var(--medium-blue);
        padding: 15px 20px;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
    }

    .companies {
        background-color: var(--light-blue);
        padding: 10px 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
    }
    
    .company {
        display: flex;
        flex-direction: column;
    }
    
    .company-label {
        font-size: 12px;
        opacity: 0.8;
    }
    
    .company-name {
        font-weight: 500;
        font-size: 16px;
    }
    
    .progress-overview {
        background-color: var(--light-blue);
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 25px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .progress-bar-container {
        height: 20px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        margin: 15px 0;
        overflow: hidden;
    }
    
    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-blue), var(--highlight));
        border-radius: 10px;
        width: 30%;
        transition: width 1s ease;
        position: relative;
    }
    
    .progress-text {
        text-align: right;
        font-weight: 500;
        margin-top: 5px;
    }
    
    .status-summary {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    
    .status-card {
        background-color: var(--medium-blue);
        padding: 15px;
        border-radius: 8px;
        flex: 1;
        margin: 0 10px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .status-card:first-child {
        margin-left: 0;
    }
    
    .status-card:last-child {
        margin-right: 0;
    }
    
    .status-card h3 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-light);
        opacity: 0.8;
    }
    
    .status-card p {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
    }
    
    .task-list {
        background-color: var(--medium-blue);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .task-list-header {
        display: grid;
        grid-template-columns: 40px 3fr 1fr 1fr;
        background-color: var(--light-blue);
        padding: 12px 15px;
        font-weight: 500;
        font-size: 14px;
    }
    
    .task-row {
        display: grid;
        grid-template-columns: 40px 3fr 1fr 1fr;
        padding: 12px 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 14px;
        align-items: center;
    }
    
    .task-row:last-child {
        border-bottom: none;
    }
    
    .task-row:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
    
    .task-status {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        margin: 0 auto;
    }
    
    .complete {
        background-color: var(--complete);
    }
    
    .in-progress {
        background-color: var(--in-progress);
    }
    
    .incomplete {
        background-color: var(--incomplete);
    }
    
    .task-name {
        font-weight: 500;
    }
    
    .task-name.parent {
        font-weight: 600;
    }
    
    .task-name.child {
        padding-left: 20px;
        opacity: 0.9;
    }
    
    .task-duration, .task-completion {
        text-align: center;
    }
    
    .task-completion-bar {
        width: 80%;
        height: 8px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        margin: 0 auto;
        overflow: hidden;
    }
    
    .task-completion-progress {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-blue), var(--highlight));
        border-radius: 4px;
    }
    
    .footer {
        margin-top: 25px;
        text-align: center;
        font-size: 12px;
        color: var(--text-light);
        opacity: 0.6;
    }
    
    .badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-left: 5px;
    }
    
    .badge-complete {
        background-color: var(--complete);
        color: var(--text-dark);
    }
    
    .badge-in-progress {
        background-color: var(--in-progress);
        color: var(--text-dark);
    }
    
    .badge-incomplete {
        background-color: var(--incomplete);
        color: var(--text-light);
    }
    
    .pendencies {
        background-color: var(--light-blue);
        padding: 20px;
        border-radius: 10px;
        margin-top: 25px;
        margin-bottom: 25px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .pendencies h2 {
        margin-top: 0;
        margin-bottom: 15px;
    }
    
    .pendencies ul {
        margin: 0;
        padding-left: 20px;
    }
    
    .pendencies li {
        margin-bottom: 8px;
    }

    /* Additional styles for dashboard-container and file import */
    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    
    .file-import-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
    }
    
    .export-buttons {
        display: flex;
        gap: 10px;
    }
    
    .export-buttons button {
        padding: 10px 15px;
        background-color: #2c74b3;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    /* Input file styling */
    input[type="file"] {
        background-color: var(--light-blue);
        color: var(--text-light);
        padding: 10px;
        border-radius: 5px;
        border: 1px solid var(--accent-blue);
    }
`}</style>
        </div>
    );
};

export default NotaModelo21Dashboard;