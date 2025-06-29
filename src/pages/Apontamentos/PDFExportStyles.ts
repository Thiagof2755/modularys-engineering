// Modern PDF styling configurations for tech company reports
// This file contains additional styling utilities and configurations

export interface PDFTheme {
    name: string;
    colors: {
        primary: number[];
        secondary: number[];
        accent: number[];
        gradient: {
            start: number[];
            end: number[];
        };
        background: {
            main: number[];
            white: number[];
            card: number[];
            section: number[];
        };
        text: {
            primary: number[];
            secondary: number[];
            muted: number[];
            white: number[];
        };
        border: number[];
        success: number[];
        warning: number[];
        error: number[];
    };
}

// Modern Tech Blue Theme (Default)
export const modernTechTheme: PDFTheme = {
    name: 'Modern Tech Blue',
    colors: {
        primary: [20, 74, 140], // #144a8c
        secondary: [59, 130, 246], // #3b82f6
        accent: [99, 179, 237], // #63b3ed
        gradient: {
            start: [30, 64, 175], // #1e40af
            end: [59, 130, 246], // #3b82f6
        },
        background: {
            main: [248, 250, 252], // #f8fafc
            white: [255, 255, 255], // Pure white
            card: [255, 255, 255], // Card background
            section: [241, 245, 249], // #f1f5f9
        },
        text: {
            primary: [30, 41, 59], // #1e293b
            secondary: [71, 85, 105], // #475569
            muted: [148, 163, 184], // #94a3b8
            white: [255, 255, 255], // White text
        },
        border: [226, 232, 240], // #e2e8f0
        success: [34, 197, 94], // #22c55e
        warning: [251, 191, 36], // #fbbf24
        error: [239, 68, 68], // #ef4444
    },
};

// Alternative Dark Theme
export const darkTechTheme: PDFTheme = {
    name: 'Dark Tech',
    colors: {
        primary: [15, 23, 42], // #0f172a
        secondary: [30, 64, 175], // #1e40af
        accent: [59, 130, 246], // #3b82f6
        gradient: {
            start: [15, 23, 42], // #0f172a
            end: [30, 64, 175], // #1e40af
        },
        background: {
            main: [241, 245, 249], // #f1f5f9
            white: [255, 255, 255],
            card: [248, 250, 252], // #f8fafc
            section: [241, 245, 249], // #f1f5f9
        },
        text: {
            primary: [15, 23, 42], // #0f172a
            secondary: [71, 85, 105], // #475569
            muted: [148, 163, 184], // #94a3b8
            white: [255, 255, 255],
        },
        border: [226, 232, 240], // #e2e8f0
        success: [34, 197, 94], // #22c55e
        warning: [251, 191, 36], // #fbbf24
        error: [239, 68, 68], // #ef4444
    },
};

// Green Tech Theme
export const greenTechTheme: PDFTheme = {
    name: 'Green Tech',
    colors: {
        primary: [21, 128, 61], // #15803d
        secondary: [34, 197, 94], // #22c55e
        accent: [134, 239, 172], // #86efac
        gradient: {
            start: [21, 128, 61], // #15803d
            end: [34, 197, 94], // #22c55e
        },
        background: {
            main: [248, 250, 252], // #f8fafc
            white: [255, 255, 255],
            card: [255, 255, 255],
            section: [240, 253, 244], // #f0fdf4
        },
        text: {
            primary: [30, 41, 59], // #1e293b
            secondary: [71, 85, 105], // #475569
            muted: [148, 163, 184], // #94a3b8
            white: [255, 255, 255],
        },
        border: [226, 232, 240], // #e2e8f0
        success: [34, 197, 94], // #22c55e
        warning: [251, 191, 36], // #fbbf24
        error: [239, 68, 68], // #ef4444
    },
};

// Typography configurations
export const typography = {
    fonts: {
        primary: 'helvetica',
        secondary: 'helvetica',
    },
    sizes: {
        title: 20,
        subtitle: 16,
        heading: 14,
        body: 10,
        caption: 8,
        small: 7,
    },
    weights: {
        normal: 'normal',
        medium: 'normal', // jsPDF doesn't support medium, fallback to normal
        bold: 'bold',
    },
};

// Layout configurations
export const layout = {
    margins: {
        top: 20,
        right: 15,
        bottom: 25,
        left: 15,
    },
    spacing: {
        xs: 5,
        sm: 10,
        md: 15,
        lg: 20,
        xl: 25,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
    },
    shadows: {
        sm: { offset: 1, opacity: 0.05 },
        md: { offset: 2, opacity: 0.1 },
        lg: { offset: 4, opacity: 0.15 },
    },
};

// Icon mappings for different activity types
export const activityIcons = {
    default: '📋',
    development: '💻',
    testing: '🧪',
    documentation: '📝',
    meeting: '👥',
    review: '🔍',
    deployment: '🚀',
    maintenance: '🔧',
    support: '🛠️',
    planning: '📊',
    design: '🎨',
    analysis: '📈',
};

// Status configurations
export const statusConfig = {
    completed: {
        label: 'CONCLUÍDO',
        color: [34, 197, 94], // green
        icon: '✅',
    },
    inProgress: {
        label: 'EM ANDAMENTO',
        color: [251, 191, 36], // yellow
        icon: '⏳',
    },
    pending: {
        label: 'PENDENTE',
        color: [239, 68, 68], // red
        icon: '⏸️',
    },
    blocked: {
        label: 'BLOQUEADO',
        color: [156, 163, 175], // gray
        icon: '🚫',
    },
};

// Utility functions for theme management
export const getThemeByName = (themeName: string): PDFTheme => {
    switch (themeName.toLowerCase()) {
        case 'dark':
        case 'dark tech':
            return darkTechTheme;
        case 'green':
        case 'green tech':
            return greenTechTheme;
        case 'modern':
        case 'modern tech':
        case 'blue':
        default:
            return modernTechTheme;
    }
};

// Helper function to get icon by activity type
export const getActivityIcon = (activityType: string): string => {
    const type = activityType.toLowerCase();
    
    if (type.includes('desenvolvimento') || type.includes('dev')) return activityIcons.development;
    if (type.includes('teste') || type.includes('test')) return activityIcons.testing;
    if (type.includes('documento') || type.includes('doc')) return activityIcons.documentation;
    if (type.includes('reunião') || type.includes('meeting')) return activityIcons.meeting;
    if (type.includes('revisão') || type.includes('review')) return activityIcons.review;
    if (type.includes('deploy') || type.includes('publicação')) return activityIcons.deployment;
    if (type.includes('manutenção') || type.includes('manut')) return activityIcons.maintenance;
    if (type.includes('suporte') || type.includes('support')) return activityIcons.support;
    if (type.includes('planejamento') || type.includes('plan')) return activityIcons.planning;
    if (type.includes('design') || type.includes('ui')) return activityIcons.design;
    if (type.includes('análise') || type.includes('analise')) return activityIcons.analysis;
    
    return activityIcons.default;
};

export default {
    modernTechTheme,
    darkTechTheme,
    greenTechTheme,
    typography,
    layout,
    activityIcons,
    statusConfig,
    getThemeByName,
    getActivityIcon,
};
