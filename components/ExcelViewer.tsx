import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Download, ZoomIn, ZoomOut, Search, Grid3x3 } from 'lucide-react';

interface ExcelViewerProps {
  documentName: string | null;
  documentData: string | null; // Base64
  onDataExtracted?: (data: any[]) => void;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({
  documentName,
  documentData,
  onDataExtracted
}) => {
  const [sheets, setSheets] = useState<{ name: string; data: any[][] }[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (documentData) {
      parseExcel(documentData);
    }
  }, [documentData]);

  const parseExcel = (base64Data: string) => {
    try {
      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Read workbook
      const workbook = XLSX.read(bytes, { type: 'array' });
      
      // Parse all sheets
      const parsedSheets = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        return {
          name: sheetName,
          data: data as any[][]
        };
      });

      setSheets(parsedSheets);

      // Extract data for AI analysis
      if (onDataExtracted && parsedSheets.length > 0) {
        const allData = parsedSheets.map(sheet => ({
          sheetName: sheet.name,
          rows: sheet.data
        }));
        onDataExtracted(allData);
      }
    } catch (error) {
      console.error('Error parsing Excel:', error);
    }
  };

  const downloadExcel = () => {
    if (!documentData || !documentName) return;
    
    const link = document.createElement('a');
    link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${documentData}`;
    link.download = documentName;
    link.click();
  };

  const filterData = (data: any[][]) => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      row.some(cell =>
        String(cell).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  if (!documentData || sheets.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900">
        <FileSpreadsheet size={64} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No Excel File Loaded</p>
        <p className="text-sm mt-2 opacity-70">Upload an Excel file to view data</p>
      </div>
    );
  }

  const currentSheet = sheets[activeSheet];
  const filteredData = currentSheet ? filterData(currentSheet.data) : [];

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Toolbar */}
      <div className="h-14 bg-slate-50 dark:bg-slate-800 flex items-center px-4 border-b border-slate-200 dark:border-slate-700 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={16} className="text-green-600" />
          <span className="text-slate-700 dark:text-slate-300 text-sm font-medium truncate max-w-md">
            {documentName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ width: '150px' }}
            />
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-600">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={14} className="text-slate-600 dark:text-slate-400" />
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title="Zoom In"
            >
              <ZoomIn size={14} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Download */}
          <button
            onClick={downloadExcel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Download"
          >
            <Download size={14} className="text-slate-600 dark:text-slate-400" />
          </button>

          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded text-[10px] uppercase tracking-wide font-bold">
            Excel
          </span>
        </div>
      </div>

      {/* Sheet Tabs */}
      {sheets.length > 1 && (
        <div className="flex gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {sheets.map((sheet, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSheet(idx)}
              className={`px-4 py-1.5 text-xs font-medium rounded-t transition-colors ${
                activeSheet === idx
                  ? 'bg-white dark:bg-slate-900 text-green-600 dark:text-green-400 border-t-2 border-green-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Grid3x3 size={12} className="inline mr-1" />
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Spreadsheet View */}
      <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
        <div style={{ fontSize: `${zoom}%` }}>
          {filteredData.length > 0 ? (
            <table className="w-full border-collapse">
              <tbody>
                {filteredData.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx === 0 ? 'bg-slate-100 dark:bg-slate-800 font-medium' : ''}>
                    {/* Row number */}
                    <td className="border border-slate-300 dark:border-slate-600 px-2 py-1 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 sticky left-0 min-w-[40px]">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={`border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm ${
                          typeof cell === 'number'
                            ? 'text-right text-blue-700 dark:text-blue-400 font-mono'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No data found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="h-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 text-xs text-slate-600 dark:text-slate-400">
        <span>
          Sheet: {currentSheet.name} • {filteredData.length} rows × {filteredData[0]?.length || 0} columns
        </span>
        {searchTerm && (
          <span className="text-green-600 dark:text-green-400">
            Filtered: {filteredData.length} / {currentSheet.data.length} rows
          </span>
        )}
      </div>
    </div>
  );
};

export default ExcelViewer;

