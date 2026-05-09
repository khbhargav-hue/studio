export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
  message?: string;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = context.message || `Missing or insufficient permissions: ${context.operation} at ${context.path}`;
    super(message);
    this.name = 'FirestorePermissionError';
    // Ensure the context is directly accessible and enumerable
    this.context = {
      path: context.path,
      operation: context.operation,
      requestResourceData: context.requestResourceData,
      message: message
    };
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }

  // Ensure JSON.stringify works as expected for logging
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      stack: this.stack
    };
  }
}