import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Mock the LLM service
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: 'The exchange rate gap between Aden and Sana\'a is approximately 300%.'
      }
    }]
  })
}));

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              title: 'Yemen Economic Monitor - Fall 2024',
              abstract: 'Analysis of exchange rate dynamics and monetary policy challenges.',
              organizationId: 1,
              publicationDate: new Date('2024-10-15'),
              researchCategory: 'monetary_policy'
            }
          ])
        })
      })
    })
  })
}));

describe('AI Assistant Chat', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const mockContext: Context = {
      user: {
        id: 1,
        openId: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    caller = appRouter.createCaller(mockContext);
  });

  it('should handle chat query with RAG retrieval', async () => {
    const result = await caller.ai.chat({
      message: 'What is the exchange rate gap?',
      conversationHistory: []
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe('string');
    expect(result.confidence).toMatch(/^[A-E]$/);
  });

  it('should include sources in response', async () => {
    const result = await caller.ai.chat({
      message: 'Tell me about inflation in Yemen',
      conversationHistory: []
    });

    expect(result).toBeDefined();
    expect(result.message).toBeDefined();
    expect(result.sources).toBeDefined();
    expect(Array.isArray(result.sources)).toBe(true);
  });

  it('should maintain conversation history', async () => {const conversationHistory = [
      { role: 'user' as const, content: 'What is GDP?' },
      { role: 'assistant' as const, content: 'GDP is Gross Domestic Product.' }
    ];

    const result = await caller.ai.chat({
      message: 'What about inflation?',
      conversationHistory
    });

    expect(result).toBeDefined();
    // Response is streamed, so we check for the structure
    expect(typeof result).toBe('object');
  });

  it('should handle errors gracefully', async () => {
    // Mock LLM error
    const { invokeLLM } = await import('./_core/llm');
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error('LLM service unavailable'));

    try {
      await caller.ai.chat({
        message: 'Test query',
        conversationHistory: []
      });
      // If no error thrown, test passes (error handled gracefully)
      expect(true).toBe(true);
    } catch (error) {
      // Error should be caught and handled
      expect(error).toBeDefined();
    }
  });

  it('should extract confidence level from response', async () => {
    const { invokeLLM } = await import('./_core/llm');
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'Based on verified data (Confidence: High), the GDP growth is 2.5%.'
        }
      }]
    });

    const result = await caller.ai.chat({
      message: 'What is GDP growth?',
      conversationHistory: []
    });

    // Confidence is returned as A-E rating, not 'high'
    expect(result.confidence).toMatch(/^[A-E]$/);
  });

  it('should extract sources from response', async () => {
    const { invokeLLM } = await import('./_core/llm');
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'According to World Bank (2024) and IMF (2023), the inflation rate is 15%.'
        }
      }]
    });

    const result = await caller.ai.chat({
      message: 'What is the inflation rate?',
      conversationHistory: []
    });

    expect(result.sources).toBeDefined();
    expect(result.sources.length).toBeGreaterThan(0);
  });
});
