// ==========================================
// CONFIG.JS - Environment Configuration
// ==========================================

class Config {
  static getBackendUrl() {
    // Check if running in development or production
    if (typeof window !== 'undefined') {
      // Browser environment
      const isDev = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1';

      if (isDev) {
        return 'http://localhost:3000';
      } else {
        // Production: use same origin as frontend or from env variable
        const backendUrl = this.getEnvVariable('REACT_APP_BACKEND_URL');
        if (backendUrl) return backendUrl;

        // Default: assume backend is on same domain
        return `${window.location.protocol}//${window.location.hostname}:3000`;
      }
    }

    // Node.js environment (server-side)
    return process.env.BACKEND_URL || 'http://localhost:3000';
  }

  static getEnvironment() {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV || 'development';
    }
    return 'production';
  }

  static isDevelopment() {
    return this.getEnvironment() === 'development';
  }

  static isProduction() {
    return this.getEnvironment() === 'production';
  }

  static getEnvVariable(key) {
    // Try to get from window.__ENV__ (set by build system)
    if (typeof window !== 'undefined' && window.__ENV__) {
      return window.__ENV__[key];
    }

    // For Node.js
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }

    return undefined;
  }

  static getSupabaseUrl() {
    return this.getEnvVariable('REACT_APP_SUPABASE_URL') || 'https://supabase.co';
  }

  static getSupabaseKey() {
    return this.getEnvVariable('REACT_APP_SUPABASE_KEY') || '';
  }

  static getApiTimeout() {
    const timeout = this.getEnvVariable('REACT_APP_API_TIMEOUT');
    return timeout ? parseInt(timeout) : 10000; // 10 seconds default
  }

  static getRetryConfig() {
    return {
      maxRetries: this.isDevelopment() ? 2 : 3,
      retryDelay: 1000, // 1 second
      backoffMultiplier: 2,
      maxDelay: 10000, // 10 seconds
    };
  }

  static log(message) {
    if (this.isDevelopment()) {
      console.log(`[CONFIG] ${message}`);
    }
  }

  static logError(message, error) {
    console.error(`[CONFIG ERROR] ${message}`, error);
  }
}

export default Config;
