import { AsyncLocalStorage } from 'node:async_hooks';

export interface ITenantContext {
  tenantId: string;
  branchId?: string;
}

/**
 * Utility to propagate the current Tenant/Branch context across all layers.
 * Uses AsyncLocalStorage to avoid passing these IDs through every function signature.
 */
export class TenantContext {
  private static readonly storage = new AsyncLocalStorage<ITenantContext>();

  /** Starts a new context for the current execution flow. */
  static run<T>(context: ITenantContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  /** Gets the current context. Returns undefined if not in a running context. */
  static current(): ITenantContext | undefined {
    return this.storage.getStore();
  }

  /** Gets the current tenantId. Throws if not set. */
  static get tenantId(): string {
    const context = this.current();
    if (!context?.tenantId) {
      throw new Error('Tenant context not found in the current execution flow');
    }
    return context.tenantId;
  }

  /** Gets the current branchId. Might be undefined for organization-level actions. */
  static get branchId(): string | undefined {
    return this.current()?.branchId;
  }
}
