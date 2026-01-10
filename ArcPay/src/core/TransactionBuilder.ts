import type { TransferParams, Transaction, TransactionType } from '../types';

export interface TransactionStep {
  type: TransactionType;
  params: TransferParams;
  description?: string;
  dependsOn?: string[];
}

export interface BatchTransaction {
  id: string;
  steps: TransactionStep[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  results: Map<string, Transaction>;
  errors: Map<string, Error>;
  createdAt: Date;
  completedAt?: Date;
}

export interface TransactionBuilderConfig {
  maxBatchSize?: number;
  parallelExecution?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export class TransactionBuilder {
  private steps: TransactionStep[] = [];
  private config: TransactionBuilderConfig;
  private stepIdCounter = 0;
  private stepIds: Map<number, string> = new Map();

  constructor(config: TransactionBuilderConfig = {}) {
    this.config = {
      maxBatchSize: config.maxBatchSize || 10,
      parallelExecution: config.parallelExecution ?? false,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };
  }

  private generateStepId(): string {
    const id = `step-${++this.stepIdCounter}`;
    this.stepIds.set(this.stepIdCounter, id);
    return id;
  }

  addTransfer(params: TransferParams, description?: string): this {
    const stepId = this.generateStepId();
    this.steps.push({
      type: 'transfer',
      params: { ...params, id: stepId },
      description,
    });
    return this;
  }

  addPayment(
    recipient: string,
    amount: string | number,
    memo?: string,
    description?: string
  ): this {
    return this.addTransfer(
      {
        recipient,
        amount: typeof amount === 'number' ? amount.toString() : amount,
        memo,
      },
      description
    );
  }

  addBatchPayments(
    payments: Array<{ recipient: string; amount: string | number; memo?: string }>
  ): this {
    for (const payment of payments) {
      this.addPayment(payment.recipient, payment.amount, payment.memo);
    }
    return this;
  }

  addConditionalStep(
    condition: () => boolean,
    params: TransferParams,
    description?: string
  ): this {
    if (condition()) {
      this.addTransfer(params, description);
    }
    return this;
  }

  addDependentStep(
    params: TransferParams,
    dependsOn: string[],
    description?: string
  ): this {
    const stepId = this.generateStepId();
    this.steps.push({
      type: 'transfer',
      params: { ...params, id: stepId },
      description,
      dependsOn,
    });
    return this;
  }

  clear(): this {
    this.steps = [];
    this.stepIdCounter = 0;
    this.stepIds.clear();
    return this;
  }

  getSteps(): TransactionStep[] {
    return [...this.steps];
  }

  getStepCount(): number {
    return this.steps.length;
  }

  getTotalAmount(): string {
    return this.steps
      .reduce((total, step) => {
        const amountStr = typeof step.params.amount === 'number'
          ? step.params.amount.toString()
          : step.params.amount;
        const amount = parseFloat(amountStr) || 0;
        return total + amount;
      }, 0)
      .toFixed(2);
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.steps.length === 0) {
      errors.push('No transaction steps defined');
    }

    if (this.steps.length > (this.config.maxBatchSize || 10)) {
      errors.push(`Batch size exceeds maximum of ${this.config.maxBatchSize}`);
    }

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];

      if (!step.params.recipient && !step.params.to) {
        errors.push(`Step ${i + 1}: Recipient is required`);
      }

      const amountStr = typeof step.params.amount === 'number'
        ? step.params.amount.toString()
        : step.params.amount;
      if (!step.params.amount || parseFloat(amountStr) <= 0) {
        errors.push(`Step ${i + 1}: Amount must be greater than 0`);
      }

      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          const depExists = this.steps.some((s) => s.params.id === depId);
          if (!depExists) {
            errors.push(`Step ${i + 1}: Dependency "${depId}" not found`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  build(): BatchTransaction {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Invalid transaction batch: ${validation.errors.join(', ')}`);
    }

    return {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      steps: [...this.steps],
      status: 'pending',
      results: new Map(),
      errors: new Map(),
      createdAt: new Date(),
    };
  }

  async execute(
    executor: (params: TransferParams) => Promise<Transaction>
  ): Promise<BatchTransaction> {
    const batch = this.build();
    batch.status = 'processing';

    const executeStep = async (step: TransactionStep): Promise<void> => {
      const stepId = step.params.id || `step-${Math.random().toString(36).substr(2, 9)}`;

      for (let attempt = 0; attempt < (this.config.retryAttempts || 3); attempt++) {
        try {
          const result = await executor(step.params);
          batch.results.set(stepId, result);
          return;
        } catch (error) {
          if (attempt === (this.config.retryAttempts || 3) - 1) {
            batch.errors.set(stepId, error instanceof Error ? error : new Error(String(error)));
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, this.config.retryDelay || 1000)
            );
          }
        }
      }
    };

    if (this.config.parallelExecution) {
      const independentSteps = this.steps.filter((s) => !s.dependsOn || s.dependsOn.length === 0);
      const dependentSteps = this.steps.filter((s) => s.dependsOn && s.dependsOn.length > 0);

      await Promise.all(independentSteps.map(executeStep));

      for (const step of dependentSteps) {
        const allDepsCompleted = step.dependsOn?.every((depId) =>
          batch.results.has(depId)
        );
        if (allDepsCompleted) {
          await executeStep(step);
        } else {
          const failedDeps = step.dependsOn?.filter((depId) => batch.errors.has(depId));
          if (failedDeps && failedDeps.length > 0) {
            batch.errors.set(
              step.params.id || 'unknown',
              new Error(`Dependencies failed: ${failedDeps.join(', ')}`)
            );
          }
        }
      }
    } else {
      for (const step of this.steps) {
        if (step.dependsOn) {
          const allDepsCompleted = step.dependsOn.every((depId) =>
            batch.results.has(depId)
          );
          if (!allDepsCompleted) {
            const failedDeps = step.dependsOn.filter((depId) => batch.errors.has(depId));
            if (failedDeps.length > 0) {
              batch.errors.set(
                step.params.id || 'unknown',
                new Error(`Dependencies failed: ${failedDeps.join(', ')}`)
              );
              continue;
            }
          }
        }
        await executeStep(step);
      }
    }

    if (batch.errors.size === 0) {
      batch.status = 'completed';
    } else if (batch.results.size === 0) {
      batch.status = 'failed';
    } else {
      batch.status = 'partial';
    }

    batch.completedAt = new Date();
    return batch;
  }

  toJSON(): object {
    return {
      steps: this.steps,
      config: this.config,
      totalAmount: this.getTotalAmount(),
      stepCount: this.getStepCount(),
    };
  }

  static fromJSON(json: {
    steps: TransactionStep[];
    config?: TransactionBuilderConfig;
  }): TransactionBuilder {
    const builder = new TransactionBuilder(json.config);
    for (const step of json.steps) {
      builder.steps.push(step);
    }
    return builder;
  }
}

export function createTransactionBuilder(
  config?: TransactionBuilderConfig
): TransactionBuilder {
  return new TransactionBuilder(config);
}
