import { useState, useEffect } from 'react';
import Logger from '@/utils/logger';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<ReturnType<typeof Logger.getLogs>>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const updateLogs = () => {
      setLogs(Logger.getLogs());
    };

    // Update logs every second
    const interval = setInterval(updateLogs, 1000);
    
    // Initial load
    updateLogs();

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(log => 
    filter === '' || 
    log.component.toLowerCase().includes(filter.toLowerCase()) ||
    log.message.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700"
      >
        Show Debug Logs
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[600px] h-[400px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Debug Logs</h3>
          <input
            type="text"
            placeholder="Filter logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1 border rounded-md text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => Logger.clearLogs()}
            className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const blob = new Blob([Logger.exportLogs()], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'debug-logs.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            Export
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {filteredLogs.map((log, index) => (
          <div
            key={index}
            className={`mb-1 ${
              log.level === 'error'
                ? 'text-red-600'
                : log.level === 'warn'
                ? 'text-yellow-600'
                : log.level === 'info'
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <span className="opacity-50">{new Date(log.timestamp).toLocaleTimeString()}</span>
            {' ['}
            <span className="font-semibold">{log.component}</span>
            {'] '}
            {log.message}
            {log.data && (
              <pre className="ml-6 text-xs opacity-75">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
