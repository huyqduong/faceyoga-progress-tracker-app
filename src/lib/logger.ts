type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  static debug(component: string, message: string, data?: any) {
    this.log('debug', component, message, data);
  }

  static info(component: string, message: string, data?: any) {
    this.log('info', component, message, data);
  }

  static warn(component: string, message: string, data?: any) {
    this.log('warn', component, message, data);
  }

  static error(component: string, message: string, error?: any) {
    this.log('error', component, message, error);
  }

  private static log(level: LogLevel, component: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${component}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data);
        break;
    }
  }
}
