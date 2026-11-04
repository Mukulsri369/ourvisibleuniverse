import { createIsomorphicFn } from '@tanstack/react-start';
import type { ConversationalTurnContext } from './cosmos-types';

// Node validation tools have no HTTP request context. Keep their server fallback
// behind a compile-time boundary so browser bundles cannot import API-key code.
export const converseWithoutRequestContext = createIsomorphicFn()
  .server(async (question: string, context: ConversationalTurnContext) => {
    const { AIServiceProviderServer } = await import('./AIServiceProvider.server');
    return AIServiceProviderServer.answerConversationalTurn(question, context);
  })
  .client(async () => { throw new Error('A server request context is required'); });

export const liveSessionWithoutRequestContext = createIsomorphicFn()
  .server(async (data: { moduleId: string; userId?: string }) => {
    const { AIServiceProviderServer } = await import('./AIServiceProvider.server');
    return AIServiceProviderServer.createLiveSession(data);
  })
  .client(async () => { throw new Error('A server request context is required'); });
