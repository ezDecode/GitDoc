// Production-ready logging utility for GitDocify
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(
      `[INFO] ${new Date().toISOString()} - ${message}`,
      meta ? JSON.stringify(meta) : ""
    );
  },

  warn: (message: string, meta?: any) => {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ${message}`,
      meta ? JSON.stringify(meta) : ""
    );
  },

  error: (message: string, error?: any, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
      console.error("Error details:", error);
    }
    if (meta) {
      console.error("Additional context:", JSON.stringify(meta));
    }
  },

  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        meta ? JSON.stringify(meta) : ""
      );
    }
  },

  // API request logging
  apiRequest: (method: string, url: string, userId?: string) => {
    logger.info(`API ${method} ${url}`, {
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  // API response logging
  apiResponse: (
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string
  ) => {
    const level = statusCode >= 400 ? "error" : "info";
    logger[level](`API ${method} ${url} - ${statusCode} (${duration}ms)`, {
      userId,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
    });
  },

  // User action logging
  userAction: (action: string, userId: string, meta?: any) => {
    logger.info(`User action: ${action}`, {
      userId,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  },

  // GitHub API usage logging
  githubApi: (
    endpoint: string,
    rateLimitRemaining?: number,
    userId?: string
  ) => {
    logger.debug(`GitHub API: ${endpoint}`, {
      userId,
      rateLimitRemaining,
      timestamp: new Date().toISOString(),
    });
  },

  // Gemini AI usage logging
  geminiApi: (tokensUsed?: number, userId?: string) => {
    logger.info(`Gemini AI request`, {
      userId,
      tokensUsed,
      timestamp: new Date().toISOString(),
    });
  },
};

// Performance monitoring utility
export const performance = {
  startTimer: () => {
    return Date.now();
  },

  endTimer: (startTime: number, operation: string) => {
    const duration = Date.now() - startTime;
    logger.info(`Performance: ${operation} completed in ${duration}ms`);
    return duration;
  },
};

// Rate limiting utility
export const rateLimiter = {
  // Simple in-memory rate limiter for development
  // In production, use Redis or similar
  requests: new Map<string, { count: number; resetTime: number }>(),

  isAllowed: (
    key: string,
    limit: number = 100,
    windowMs: number = 60000
  ): boolean => {
    const now = Date.now();
    const record = rateLimiter.requests.get(key);

    if (!record || now > record.resetTime) {
      rateLimiter.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      logger.warn(`Rate limit exceeded for ${key}`);
      return false;
    }

    record.count++;
    return true;
  },

  // Clean up expired entries
  cleanup: () => {
    const now = Date.now();
    for (const [key, record] of rateLimiter.requests.entries()) {
      if (now > record.resetTime) {
        rateLimiter.requests.delete(key);
      }
    }
  },
};
