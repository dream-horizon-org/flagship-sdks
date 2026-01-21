import type { EvaluationContext } from '@openfeature/web-sdk';

export class ContextManager {
  private context: EvaluationContext = {};

  setContext(context: EvaluationContext): void {
    this.context = { ...this.context, ...context };
  }

  getContext(): EvaluationContext {
    return { ...this.context };
  }

  updateContext(updates: Partial<EvaluationContext>): void {
    this.context = { ...this.context, ...updates };
  }
}

