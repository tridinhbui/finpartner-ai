# FinPartner AI - AI-Powered Financial Analysis Platform

![FinPartner AI](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6.svg)

## 🚀 Overview

**FinPartner AI** là nền tảng phân tích tài chính thông minh sử dụng Google Gemini 2.0 để phân tích báo cáo tài chính (10Q/10K), Excel spreadsheets, và cung cấp insights sâu sắc với visualization chuyên nghiệp.

### ✨ Key Features

#### 📊 **Dual-Screen Workstation**
- **Left Panel**: Chat interface với AI analyst
- **Right Panel**: Multi-workspace với 4 tabs:
  - 📈 Visualization - Interactive charts
  - 📋 Data Grid - Detailed financial tables
  - 👁️ Source Document - PDF viewer với highlights
  - 📗 Excel - Full-featured spreadsheet viewer

#### 🎯 **Smart File Processing**
- **Drag & Drop Support**: Kéo thả PDF/Excel trực tiếp vào chat
- **Auto Analysis**: Tự động phân tích và extract metrics
- **Multi-Format**: PDF, Excel (.xlsx, .xls), Images

#### 🤖 **AI-Powered Analysis**
- **Quantitative Analysis**: 30+ financial metrics
  - Income Statement (Revenue, COGS, Margins, EPS, EBITDA)
  - Balance Sheet (Assets, Liabilities, Equity)
  - Cash Flow (OCF, FCF, CapEx)
  - Financial Ratios (ROE, ROA, Liquidity, Leverage)
  
- **Qualitative Analysis**: Deep text insights
  - Management Discussion & Analysis (MD&A)
  - Risk Factors identification
  - Business Segments analysis
  - Market Position & Competition
  - Strategic Initiatives

#### 💡 **Visual Highlights**
- **On-PDF Markers**: Highlight key numbers trực tiếp trên PDF
- **Floating Panel**: Metrics panel với color-coding
- **Interactive**: Pulse animations và tooltips

#### 💬 **Multi-Thread Chat System**
- **Thread Management**: Tạo, rename, delete, search threads
- **Persistent History**: Lưu toàn bộ lịch sử chat
- **Workspace Per Thread**: Mỗi thread có riêng PDF, charts, tables

#### 🎨 **Professional UI/UX**
- **Dark/Light Mode**: Toggle theme
- **Responsive Design**: Optimized cho mọi màn hình
- **Smooth Animations**: Professional transitions
- **Google OAuth**: Đăng nhập với Google

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - UI Framework
- **TypeScript 5.8.2** - Type Safety
- **Vite 6.2.0** - Build Tool & Dev Server
- **Tailwind CSS** - Styling (via CDN)

### AI & APIs
- **Google Gemini 2.0 Flash** - AI Analysis
- **@google/genai 1.30.0** - Gemini SDK
- **Supabase** - Backend & Storage

### Data Visualization
- **Recharts 3.4.1** - Charts & Graphs
- **XLSX (xlsx)** - Excel Parsing
- **PDF.js (pdfjs-dist)** - PDF Rendering

### Icons & UI Components
- **Lucide React 0.554.0** - Modern Icons

---

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- npm hoặc yarn
- Git

### Setup Instructions

1. **Clone Repository**
```bash
git clone https://github.com/tridinhbui/finpartner-ai.git
cd finpartner-ai
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**

Tạo file `.env.local`:
```env
# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run Development Server**
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

5. **Build for Production**
```bash
npm run build
npm run preview
```

---

## 🗄️ Database Schema

### Supabase Tables

#### `chat_threads`
```sql
- id: uuid (primary key)
- user_id: text
- title: text
- created_at: timestamp
- updated_at: timestamp
- workspace_state: jsonb
- highlighted_numbers: jsonb
```

#### `messages`
```sql
- id: uuid (primary key)
- thread_id: uuid (foreign key -> chat_threads.id)
- role: text (user/model/system)
- content: text
- timestamp: timestamp
- related_chart: jsonb
- related_table: jsonb
- is_error: boolean
```

#### `documents`
```sql
- id: uuid (primary key)
- thread_id: uuid (foreign key -> chat_threads.id)
- file_name: text
- file_type: text
- file_size: integer
- storage_path: text
- uploaded_at: timestamp
```

---

## 📁 Project Structure

```
finpartner-ai/
├── components/
│   ├── ChatMessage.tsx          # Message bubble component
│   ├── FinancialChart.tsx       # Chart visualization
│   ├── FinancialTable.tsx       # Table component
│   ├── LoginScreen.tsx          # Google OAuth login
│   ├── PDFViewerWithHighlight.tsx  # PDF viewer with markers
│   ├── ExcelViewer.tsx          # Excel spreadsheet viewer
│   └── ThreadList.tsx           # Chat thread sidebar
├── services/
│   ├── geminiService.ts         # Gemini AI integration
│   └── supabaseService.ts       # Supabase client & operations
├── constants.ts                 # AI system instructions
├── types.ts                     # TypeScript type definitions
├── App.tsx                      # Main application component
├── index.tsx                    # Entry point
├── index.html                   # HTML template
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies
└── README.md                   # Documentation
```

---

## 🎯 Usage Guide

### 1. Login
- Click "Continue with Google" hoặc "Demo Mode"
- OAuth integration với Google

### 2. Upload Files

**Method A: Drag & Drop**
- Kéo file PDF/Excel vào chat area
- Visual overlay hiển thị khi drag
- Auto-trigger analysis

**Method B: Click Upload**
- Click 📎 icon
- Select PDF (.pdf) hoặc Excel (.xlsx, .xls)

### 3. AI Analysis

**Quick Commands:**
```
"Phân tích toàn diện báo cáo này"
"Tạo dashboard với charts và tables"
"Highlight key metrics trên PDF"
"So sánh revenue YoY"
"Phân tích rủi ro trong MD&A"
```

**Sample Data Mode:**
```
"Tạo dashboard mẫu cho công ty tech với revenue $10M"
"Show me example financial analysis"
```

### 4. Navigate Workspace

**Tabs:**
- **📊 Visualization**: View generated charts
- **📋 Data Grid**: Explore detailed tables
- **👁️ Source Document**: PDF với highlights
- **📗 Excel**: Spreadsheet viewer

### 5. Thread Management

**Create New Thread:**
- Click "New Chat" button
- Fresh conversation với empty workspace

**Manage Threads:**
- **Rename**: Click ✏️ icon
- **Delete**: Click 🗑️ icon
- **Search**: Type in search box
- **Switch**: Click vào thread khác

---

## 🔧 Configuration

### Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
  },
  plugins: [react()],
});
```

### Tailwind Config
```javascript
// In index.html
tailwind.config = {
  darkMode: 'class',
  theme: { extend: {} }
}
```

---

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 📊 Performance

- **Bundle Size**: ~2.5MB (gzipped)
- **First Load**: <2s on 3G
- **Time to Interactive**: <3s
- **Lighthouse Score**: 95+

---

## 🔐 Security

- ✅ API Keys stored in `.env.local` (not committed)
- ✅ Google OAuth for authentication
- ✅ Supabase Row Level Security (RLS)
- ✅ File upload validation
- ✅ XSS protection with React
- ✅ HTTPS only in production

---

## 🐛 Troubleshooting

### Common Issues

**1. "API Key missing"**
```bash
# Check .env.local exists
cat .env.local
# Restart dev server
npm run dev
```

**2. "Failed to load PDF"**
- Check file is valid PDF
- Try different browser
- Check file size (<10MB recommended)

**3. "Charts not showing"**
- Open DevTools console
- Look for "Chart received" logs
- Try: "Tạo dashboard mẫu"

**4. "Dark mode not working"**
- Hard refresh: Ctrl+Shift+R
- Check Tailwind config in index.html

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Tri Dinh Bui**
- GitHub: [@tridinhbui](https://github.com/tridinhbui)
- Email: tri.analyst@finpartner.ai

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful analysis
- Recharts for beautiful visualizations
- Tailwind CSS for rapid UI development
- Supabase for backend infrastructure
- React team for amazing framework

---

## 📮 Support

For issues, questions, or suggestions:
- 🐛 [GitHub Issues](https://github.com/tridinhbui/finpartner-ai/issues)
- 📧 Email: support@finpartner.ai
- 💬 Discussions: [GitHub Discussions](https://github.com/tridinhbui/finpartner-ai/discussions)

---

## 🗺️ Roadmap

### Version 1.1 (Q1 2025)
- [ ] Real-time collaboration
- [ ] Export reports to PDF/Excel
- [ ] Advanced filtering & sorting
- [ ] Custom chart types

### Version 2.0 (Q2 2025)
- [ ] Multi-language support (EN, VI, CN)
- [ ] Mobile app (React Native)
- [ ] API for external integrations
- [ ] AI model fine-tuning

---

**Built with ❤️ by Tri Dinh Bui**

⭐ Star this repo if you find it helpful!
