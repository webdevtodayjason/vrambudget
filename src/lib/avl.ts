/**
 * AVL (Agent View Layer) glue for vrambudget.com.
 *
 * Re-exports the bits of `@frontier-infra/avl` we use, plus a small
 * project-local route registry that other modules push into so the
 * postbuild emitter (`scripts/emit-agent-views.ts`) can iterate without
 * importing every route file directly.
 */
import {
  defineAgentView,
  serialize,
  type AgentAction,
  type AgentIntent,
  type AgentMeta,
  type AgentNav,
  type AgentRequestContext,
  type AgentSession,
  type AgentViewConfig,
  type AgentViewDocument,
  type DefinedAgentView,
} from '@frontier-infra/avl';

export {
  defineAgentView,
  serialize,
};

export type {
  AgentAction,
  AgentIntent,
  AgentMeta,
  AgentNav,
  AgentRequestContext,
  AgentSession,
  AgentViewConfig,
  AgentViewDocument,
  DefinedAgentView,
};

/** A registered route: human URL pattern + the defined agent view. */
export type Route = {
  pattern: string;
  view: DefinedAgentView<unknown>;
};

/**
 * Central registry of routes that have an AVL companion view.
 * Other modules call `registerAgentRoute()` to add to this list.
 * The postbuild emitter reads it after all modules are loaded.
 */
export const AGENT_ROUTES: Route[] = [];

/**
 * Register an AVL view for a route pattern. Idempotent: if the pattern
 * is already registered, the second call is a no-op (the first wins).
 *
 * Generic over the view's state type so callers can hand in a tightly
 * typed `DefinedAgentView<TState>` without an explicit cast — the
 * registry stores it as `DefinedAgentView<unknown>` because consumers
 * only invoke `view.render(ctx)`, which returns `RenderedAgentView`
 * regardless of the original `S`.
 */
export function registerAgentRoute<S>(
  pattern: string,
  view: DefinedAgentView<S>,
): void {
  if (AGENT_ROUTES.some((r) => r.pattern === pattern)) return;
  AGENT_ROUTES.push({ pattern, view: view as DefinedAgentView<unknown> });
}

/**
 * Wrap a rendered view (the `Promise<RenderedAgentView>` shape returned
 * by `view.render(ctx)`) with the AVL-required `meta` block so the result
 * is a complete `AgentViewDocument` ready for `serialize()`.
 */
export function buildAgentDocument(
  pattern: string,
  rendered: Omit<AgentViewDocument, 'meta'>,
): AgentViewDocument {
  return {
    meta: {
      v: 1,
      route: pattern,
      generated: new Date().toISOString(),
    },
    intent: rendered.intent,
    state: rendered.state,
    actions: rendered.actions,
    context: rendered.context,
    nav: rendered.nav,
  };
}
