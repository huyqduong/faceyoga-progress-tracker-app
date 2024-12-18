import { toast } from 'react-hot-toast';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
}

class Logger {
  private static logs: LogEntry[] = [];
  private static maxLogs = 1000; // Keep last 1000 logs

  static log(level: LogLevel, component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    // Add to logs array
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Also log to console for development
    const logMessage = `[${entry.component}] ${entry.message}`;
    switch (level) {
      case 'debug':
        console.debug(logMessage, data || '');
        break;
      case 'info':
        console.info(logMessage, data || '');
        break;
      case 'warn':
        console.warn(logMessage, data || '');
        break;
      case 'error':
        console.error(logMessage, data || '');
        if (typeof window !== 'undefined') {
          toast.error(message);
        }
        break;
    }
  }

  static debug(component: string, message: string, data?: any) {
    this.log('debug', component, message, data);
  }

  static info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  static warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data);
  }

  static error(component: string, message: string, data?: any) {
    this.log('error', component, message, data);
  }

  static getLogs() {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
  }

  // Get logs for a specific component
  static getComponentLogs(component: string) {
    return this.logs.filter(log => log.component === component);
  }

  // Export logs as JSON
  static exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export default Logger;
