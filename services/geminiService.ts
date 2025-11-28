
import { GoogleGenAI, FunctionDeclaration } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ChartConfig, TableConfig } from "../types";

// Tool Definitions
const renderChartTool: FunctionDeclaration = {
  name: "renderChart",
  description: "Render a financial chart (bar, line, area) on the user dashboard. Use this when the user asks to visualize data or when you analyze a PDF/Table and find trends.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Title of the chart" },
      type: { type: "string", enum: ["bar", "line", "area", "composed"], description: "Type of chart" },
      xAxisKey: { type: "string", description: "Key in data objects to use for X-axis (e.g., 'month', 'quarter')" },
      dataKeys: { 
        type: "array", 
        items: { type: "string" }, 
        description: "Array of keys to plot values for (e.g., ['Revenue', 'Cost'])" 
      },
      data: {
        type: "array",
        items: { type: "object" },
        description: "Array of data objects. Example: [{'month': 'Jan', 'Revenue': 100}]"
      },
      description: { type: "string", description: "Brief analysis of the chart data." }
    },
    required: ["title", "type", "xAxisKey", "dataKeys", "data"],
  },
};

const renderTableTool: FunctionDeclaration = {
  name: "renderTable",
  description: "Render a detailed financial table on the user dashboard. Use this to present structured data extracted from PDFs or generated from analysis.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Title of the table" },
      columns: { 
        type: "array", 
        items: { type: "string" },
        description: "List of column headers"
      },
      rows: {
        type: "array",
        items: { type: "object" },
        description: "List of row objects where keys match column headers generally"
      },
      description: { type: "string", description: "Brief context for the table." }
    },
    required: ["title", "columns", "rows"],
  },
};

const highlightKeyMetricsTool: FunctionDeclaration = {
  name: "highlightKeyMetrics",
  description: "Highlight important financial numbers extracted from PDF documents. Use this when analyzing financial statements to mark key metrics like Revenue, Net Income, EPS, etc.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      metrics: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "Label of the metric (e.g., 'Revenue', 'Net Income')" },
            value: { type: "string", description: "The value of the metric as shown in the document" },
            color: { type: "string", description: "Hex color code for highlighting (e.g., '#3b82f6')" }
          },
          required: ["label", "value", "color"]
        },
        description: "Array of key metrics to highlight in the PDF"
      }
    },
    required: ["metrics"],
  },
};

// Service Class
class GeminiService {
  private ai: GoogleGenAI;
  private chatHistory: any[];
  private apiKey: string;

  constructor() {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
        console.error("VITE_GEMINI_API_KEY is missing in .env.local file");
        console.log("Please add VITE_GEMINI_API_KEY to your .env.local file");
    } else {
        console.log("API Key loaded successfully");
    }
    this.apiKey = key || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.chatHistory = [];
  }

  public async startChat() {
    try {
      console.log("Chat initialized");
      this.chatHistory = [];
    } catch (e) {
      console.error("Failed to initialize chat:", e);
      throw e;
    }
  }

  public async sendMessage(
    message: string, 
    attachment: { mimeType: string; data: string } | null,
    onChartUpdate: (chart: ChartConfig) => void,
    onTableUpdate: (table: TableConfig) => void,
    onHighlightMetrics?: (metrics: Array<{ label: string; value: string; color: string }>) => void
  ): Promise<string> {
    try {
      console.log("Sending message:", message.substring(0, 50) + "...");
      
      // Construct parts array for content
      let parts: any[] = [];

      if (attachment) {
        parts = [
          { text: message },
          {
            inlineData: {
              mimeType: attachment.mimeType,
              data: attachment.data
            }
          }
        ];
      } else {
        parts = [{ text: message }];
      }

      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        parts: parts
      });

      // Generate content with history
      const result = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: this.chatHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [
            {
              functionDeclarations: [renderChartTool, renderTableTool, highlightKeyMetricsTool]
            }
          ],
          temperature: 0.4,
        }
      });
      
      console.log("Received response from Gemini");
      
      // Handle Function Calls
      const functionCalls = result.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        console.log("Processing function calls:", functionCalls.length);
        
        for (const call of functionCalls) {
          const args = call.args;
          
          if (call.name === 'renderChart') {
             console.log("Rendering chart:", args.title);
             const chartConfig: ChartConfig = {
                title: args.title as string,
                type: args.type as any,
                xAxisKey: args.xAxisKey as string,
                dataKeys: args.dataKeys as string[],
                data: args.data as any[],
                description: args.description as string
             };
             onChartUpdate(chartConfig);
          } else if (call.name === 'renderTable') {
             console.log("Rendering table:", args.title);
             const tableConfig: TableConfig = {
                title: args.title as string,
                columns: args.columns as string[],
                rows: args.rows as any[],
                description: args.description as string
             };
             onTableUpdate(tableConfig);
          } else if (call.name === 'highlightKeyMetrics' && onHighlightMetrics) {
             console.log("Highlighting key metrics:", args.metrics);
             onHighlightMetrics(args.metrics as Array<{ label: string; value: string; color: string }>);
          }
        }
      }

      const responseText = result.text || "";
      
      // Add model response to history
      if (responseText) {
        this.chatHistory.push({
          role: 'model',
          parts: [{ text: responseText }]
        });
      }

      return responseText;
    } catch (error: any) {
      console.error("Error sending message:", error);
      console.error("Error details:", error.message, error.stack);
      if (error.message) {
        console.error("Error message:", error.message);
      }
      return "Hệ thống đang nghẽn một chút, anh Trí chờ em một giây rồi thử lại nhé! Error: " + (error.message || "Unknown");
    }
  }
}

export const geminiService = new GeminiService();
