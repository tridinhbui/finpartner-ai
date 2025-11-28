import React, { useState, useEffect } from 'react';
import { FileText, ZoomIn, ZoomOut, Search, ChevronRight, ChevronLeft } from 'lucide-react';

interface PDFViewerProps {
  documentName: string | null;
  documentUrl: string | null;
  documentData: string | null;
  documentMimeType: string | null;
  highlightedNumbers?: Array<{
    value: string;
    label: string;
    color: string;
  }>;
}

const PDFViewerWithHighlight: React.FC<PDFViewerProps> = ({
  documentName,
  documentUrl,
  documentData,
  documentMimeType,
  highlightedNumbers = []
}) => {
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHighlights, setShowHighlights] = useState(true);
  const [showMetricsPanel, setShowMetricsPanel] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('📄 PDFViewer Props:', {
      hasDocumentName: !!documentName,
      hasDocumentUrl: !!documentUrl,
      hasDocumentData: !!documentData,
      documentMimeType,
      highlightsCount: highlightedNumbers.length
    });
  }, [documentName, documentUrl, documentData, documentMimeType, highlightedNumbers]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  if (!documentData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-slate-900">
        <FileText size={64} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No Document Loaded</p>
        <p className="text-sm mt-2 opacity-70">Upload a financial report to begin analysis</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-800 dark:bg-slate-950">
      {/* Toolbar */}
      <div className="h-14 bg-slate-900 dark:bg-slate-900 flex items-center px-4 border-b border-slate-700 dark:border-slate-800 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <FileText size={16} className="text-slate-400" />
          <span className="text-slate-300 text-sm font-medium truncate max-w-md">
            {documentName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800 dark:bg-slate-800 rounded-lg px-2 py-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-700 dark:hover:bg-slate-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={14} className="text-slate-400" />
            </button>
            <span className="text-xs text-slate-400 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-700 dark:hover:bg-slate-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={14} className="text-slate-400" />
            </button>
          </div>

          {/* Highlight Toggle */}
          {highlightedNumbers.length > 0 && (
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showHighlights
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 dark:bg-slate-800 text-slate-400 hover:bg-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              Highlights {showHighlights ? 'ON' : 'OFF'}
            </button>
          )}

          <span className="bg-slate-700 dark:bg-slate-800 px-3 py-1 rounded text-[10px] text-slate-400 uppercase tracking-wide">
            Read-Only
          </span>
        </div>
      </div>

      {/* Highlighted Numbers Legend - Enhanced */}
      {showHighlights && highlightedNumbers.length > 0 && (
        <div className="bg-slate-900 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800 px-4 py-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                Extracted Key Metrics
              </span>
              <span className="text-[10px] text-slate-500">{highlightedNumbers.length} metrics found</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {highlightedNumbers.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-800 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}
                >
                  <div className="flex-1">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-0.5">
                      {item.label}
                    </div>
                    <div className="text-sm text-white font-bold">
                      {item.value}
                    </div>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: item.color }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PDF Content with Floating Metrics Panel */}
      <div className="flex-1 relative bg-slate-200 dark:bg-slate-950 w-full h-full overflow-hidden flex">
        {/* Main PDF Viewer */}
        <div className="flex-1 overflow-auto">
          {documentMimeType === 'application/pdf' ? (
            <div className="w-full h-full" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
              <iframe
                src={documentUrl || `data:application/pdf;base64,${documentData}`}
                className="w-full h-full border-0"
                title="PDF Preview"
                style={{ minHeight: '100vh' }}
              />
            </div>
          ) : documentMimeType?.includes('image') ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto bg-slate-900 dark:bg-slate-950 p-4">
              <img
                src={documentUrl || `data:${documentMimeType};base64,${documentData}`}
                className="max-w-full max-h-full object-contain"
                alt="Preview"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Preview not available for this file type.</p>
            </div>
          )}
        </div>

        {/* Visual Highlight Markers with Arrows on PDF */}
        {showHighlights && highlightedNumbers.length > 0 && showMetricsPanel && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Visual markers with connecting lines to metrics panel */}
            {highlightedNumbers.slice(0, 6).map((item, idx) => {
              const leftPos = 20 + (idx % 3) * 25; // 3 columns
              const topPos = 20 + Math.floor(idx / 3) * 30; // Multiple rows
              
              return (
                <div key={idx}>
                  {/* Highlight Box on PDF */}
                  <div
                    className="absolute"
                    style={{
                      left: `${leftPos}%`,
                      top: `${topPos}%`,
                    }}
                  >
                    <div className="relative">
                      {/* Pulsing highlight box */}
                      <div 
                        className="w-40 h-10 rounded-lg opacity-40 animate-pulse border-2"
                        style={{ 
                          backgroundColor: item.color,
                          borderColor: item.color
                        }}
                      ></div>
                      
                      {/* Pin/Marker */}
                      <div 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-lg flex items-center justify-center animate-bounce"
                        style={{ backgroundColor: item.color }}
                      >
                        <span className="text-white text-xs font-bold">{idx + 1}</span>
                      </div>
                      
                      {/* Label badge */}
                      <div 
                        className="absolute -bottom-6 left-0 text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap"
                        style={{ 
                          backgroundColor: item.color,
                          color: 'white'
                        }}
                      >
                        {item.label}
                      </div>

                      {/* Arrow/Line pointing to metrics panel (SVG) */}
                      <svg
                        className="absolute left-full top-1/2 pointer-events-none"
                        style={{
                          width: '200px',
                          height: '100px',
                          marginLeft: '10px',
                          marginTop: '-50px'
                        }}
                      >
                        <defs>
                          <marker
                            id={`arrowhead-${idx}`}
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3, 0 6"
                              fill={item.color}
                            />
                          </marker>
                        </defs>
                        <path
                          d="M 0 50 Q 100 50, 190 50"
                          stroke={item.color}
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="5,5"
                          markerEnd={`url(#arrowhead-${idx})`}
                          opacity="0.6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Metrics Panel */}
        {showHighlights && highlightedNumbers.length > 0 && (
          <div className={`absolute top-4 right-4 transition-all duration-300 z-20 ${showMetricsPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 dark:border-slate-700 overflow-hidden" style={{ width: '280px', maxHeight: 'calc(100vh - 200px)' }}>
              {/* Panel Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-sm font-bold">Extracted Metrics</span>
                </div>
                <button
                  onClick={() => setShowMetricsPanel(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Metrics List */}
              <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                {highlightedNumbers.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 dark:bg-slate-800 rounded-lg p-3 border-l-4 hover:bg-slate-750 transition-colors relative"
                    style={{ borderLeftColor: item.color }}
                  >
                    {/* Number Badge */}
                    <div 
                      className="absolute -left-3 top-2 w-6 h-6 rounded-full shadow-lg flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {idx + 1}
                    </div>
                    
                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                          {item.label}
                        </div>
                        <div className="text-lg text-white font-bold">
                          {item.value}
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full mt-1 animate-pulse"
                        style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Panel Footer */}
              <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700">
                <p className="text-[10px] text-slate-400 text-center">
                  💡 These metrics were extracted from the document
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button when panel is hidden */}
        {showHighlights && highlightedNumbers.length > 0 && !showMetricsPanel && (
          <button
            onClick={() => setShowMetricsPanel(true)}
            className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 shadow-lg transition-all flex items-center gap-2 animate-bounce"
          >
            <ChevronLeft size={16} />
            <span className="text-xs font-bold">{highlightedNumbers.length} Metrics</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PDFViewerWithHighlight;

