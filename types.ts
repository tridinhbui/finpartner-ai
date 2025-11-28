
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export type ChartType = 'bar' | 'line' | 'area' | 'composed';

export interface ChartConfig {
  title: string;
  type: ChartType;
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKeys: string[]; // Keys to plot (e.g., 'Revenue', 'Cost')
  colors?: string[];
  description?: string;
}

export interface TableConfig {
  title: string;
  columns: string[];
  rows: Record<string, string | number>[];
  description?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  isError?: boolean;
  relatedChart?: ChartConfig;
  relatedTable?: TableConfig;
}

export type WorkspaceTab = 'chart' | 'table' | 'document' | 'excel';

export interface WorkspaceState {
  activeTab: WorkspaceTab;
  chartData: ChartConfig | null;
  tableData: TableConfig | null;
  documentName: string | null;
  documentData: string | null; // Base64
  documentMimeType: string | null;
  documentUrl?: string | null; // Blob URL for efficient preview
  excelData?: any[] | null; // Parsed Excel data
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export type Theme = 'light' | 'dark';

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  workspace?: WorkspaceState;
  highlightedNumbers?: Array<{
    value: string;
    label: string;
    color: string;
  }>;
}
