
import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ChartConfig, TableConfig } from "../types";

// Tool Definitions
const renderChartTool: FunctionDeclaration = {
  name: "renderChart",
  description: "Render a financial chart (bar, line, area) on the user dashboard. Use this when the user asks to visualize data or when you analyze a PDF/Table and find trends.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the chart" },
      type: { type: Type.STRING, enum: ["bar", "line", "area", "composed"], description: "Type of chart" },
      xAxisKey: { type: Type.STRING, description: "Key in data objects to use for X-axis (e.g., 'month', 'quarter')" },
      dataKeys: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: "Array of keys to plot values for (e.g., ['Revenue', 'Cost'])" 
      },
      data: {
        type: Type.ARRAY,
        items: { type: Type.OBJECT },
        description: "Array of data objects. Example: [{'month': 'Jan', 'Revenue': 100}]"
      },
      description: { type: Type.STRING, description: "Brief analysis of the chart data." }
    },
    required: ["title", "type", "xAxisKey", "dataKeys", "data"],
  },
};

const renderTableTool: FunctionDeclaration = {
  name: "renderTable",
  description: "Render a detailed financial table on the user dashboard. Use this to present structured data extracted from PDFs or generated from analysis.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the table" },
      columns: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of column headers"
      },
      rows: {
        type: Type.ARRAY,
        items: { type: Type.OBJECT },
        description: "List of row objects where keys match column headers generally"
      },
      description: { type: Type.STRING, description: "Brief context for the table." }
    },
    required: ["title", "columns", "rows"],
  },
};

const tools: Tool[] = [
  { functionDeclarations: [renderChartTool, renderTableTool] }
];

// Service Class
class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: any;
  private apiKey: string;

  constructor() {
    const key = process.env.API_KEY;
    if (!key) {
        console.error("API_KEY is missing");
    }
    this.apiKey = key || '';
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  public async startChat() {
    try {
      this.chatSession = this.ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: tools,
          temperature: 0.4, // Slightly higher for natural/playful persona
        },
      });
    } catch (e) {
      console.error("Failed to start chat session", e);
    }
  }

  public async sendMessage(
    message: string, 
    attachment: { mimeType: string; data: string } | null,
    onChartUpdate: (chart: ChartConfig) => void,
    onTableUpdate: (table: TableConfig) => void
  ): Promise<string> {
    if (!this.chatSession) {
      await this.startChat();
    }

    try {
      // Construct content. If attachment exists, it's a multipart message.
      // Note: for chat.sendMessage, we pass the message/parts directly.
      let content: any;

      if (attachment) {
        content = [
          { text: message },
          {
            inlineData: {
              mimeType: attachment.mimeType,
              data: attachment.data
            }
          }
        ];
      } else {
        content = message;
      }

      const result = await this.chatSession.sendMessage(content);
      
      // Handle Function Calls automatically
      const functionCalls = result.functionCalls;
      
      // Process tools
      if (functionCalls && functionCalls.length > 0) {
        let toolResponseParts: any[] = [];

        for (const call of functionCalls) {
          const args = call.args;
          
          if (call.name === 'renderChart') {
             const chartConfig: ChartConfig = {
                title: args.title as string,
                type: args.type as any,
                xAxisKey: args.xAxisKey as string,
                dataKeys: args.dataKeys as string[],
                data: args.data as any[],
                description: args.description as string
             };
             onChartUpdate(chartConfig);
             toolResponseParts.push({
                functionResponse: {
                    name: call.name,
                    id: call.id,
                    response: { result: "Chart rendered successfully on dashboard." }
                }
             });
          } else if (call.name === 'renderTable') {
             const tableConfig: TableConfig = {
                title: args.title as string,
                columns: args.columns as string[],
                rows: args.rows as any[],
                description: args.description as string
             };
             onTableUpdate(tableConfig);
             toolResponseParts.push({
                functionResponse: {
                    name: call.name,
                    id: call.id,
                    response: { result: "Table rendered successfully on dashboard." }
                }
             });
          }
        }

        // Send the tool response back to Gemini to get the final text response
        if (toolResponseParts.length > 0) {
            const followUp = await this.chatSession.sendMessage(toolResponseParts);
            return followUp.text || "Dashboard updated.";
        }
      }

      return result.text || "";
    } catch (error) {
      console.error("Error sending message:", error);
      return "Hệ thống đang nghẽn một chút, anh Trí chờ em một giây rồi thử lại nhé!";
    }
  }
}

export const geminiService = new GeminiService();
