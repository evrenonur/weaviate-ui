import React, { useState } from 'react';
import JsonView from '@uiw/react-json-view';
import { Button } from '@/components/ui/button';
import { Copy, Download, Maximize2, Minimize2 } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
  className?: string;
  maxHeight?: string;
  collapsedDepth?: number | false;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  showExpandButton?: boolean;
}

export function JsonViewer({
  data,
  title,
  className = '',
  maxHeight = '400px',
  collapsedDepth = 2,
  showCopyButton = true,
  showDownloadButton = false,
  showExpandButton = true,
}: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [collapsed, setCollapsed] = useState<number | false>(collapsedDepth);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadJson = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpanded = () => {
    if (collapsed === false) {
      setCollapsed(typeof collapsedDepth === 'number' ? collapsedDepth : 2);
    } else {
      setCollapsed(false);
    }
  };

  return (
    <div className={`bg-gray-900/50 border border-gray-700/50 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      {(title || showCopyButton || showDownloadButton || showExpandButton) && (
        <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700/50">
          {title && (
            <h3 className="text-sm font-medium text-gray-200">{title}</h3>
          )}
          <div className="flex items-center space-x-2">
            {showExpandButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-7 w-7 p-0 hover:bg-gray-700/50"
              >
                {collapsed === false ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
            {showCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-7 w-7 p-0 hover:bg-gray-700/50"
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
            {showDownloadButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadJson}
                className="h-7 w-7 p-0 hover:bg-gray-700/50"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* JSON Content */}
      <div 
        className="overflow-auto p-4" 
        style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
      >
        <JsonView 
          value={data}
          style={{
            backgroundColor: 'transparent',
            color: '#e5e7eb',
            fontSize: '13px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          }}
          displayDataTypes={false}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}

export default JsonViewer;