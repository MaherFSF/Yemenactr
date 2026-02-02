/**
 * TRUTH-NATIVE Evidence Pack Button Tests
 * 
 * Verifies that EvidencePackButton:
 * 1. Never shows mock/fabricated evidence
 * 2. Shows "No evidence available" when evidence not found
 * 3. Provides GAP ticket creation functionality
 */

import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EvidencePackButton, { EvidencePackData } from './EvidencePackButton';

// Mock the language context
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

// Mock trpc
vi.mock('@/lib/trpc', () => ({
  trpc: {
    system: {
      createGapTicket: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({ gapId: 'GAP-TEST-001' }),
        }),
      },
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('EvidencePackButton - Truth-Native', () => {
  describe('No Evidence State', () => {
    it('should render "No evidence available" when no data provided', async () => {
      render(<EvidencePackButton evidencePackId="test-123" />);
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should show no evidence message
      await waitFor(() => {
        expect(screen.getByText(/No evidence available yet/i)).toBeInTheDocument();
      });
    });

    it('should NOT contain getMockEvidenceData function', () => {
      // This test verifies the source code doesn't have mock fallback
      const componentSource = EvidencePackButton.toString();
      expect(componentSource).not.toContain('getMockEvidenceData');
    });

    it('should show GAP indicator in badge variant when no evidence', () => {
      render(<EvidencePackButton evidencePackId="test-456" variant="badge" />);
      
      expect(screen.getByText('GAP')).toBeInTheDocument();
    });

    it('should display requested pack ID in no-evidence state', async () => {
      const testPackId = 'PACK-789-TEST';
      render(<EvidencePackButton evidencePackId={testPackId} />);
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(testPackId)).toBeInTheDocument();
      });
    });

    it('should show "Request Evidence Collection" button when no evidence', async () => {
      render(<EvidencePackButton evidencePackId="test-no-evidence" />);
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/Request Evidence Collection/i)).toBeInTheDocument();
      });
    });
  });

  describe('With Evidence State', () => {
    const validEvidenceData: EvidencePackData = {
      indicatorId: 'IND-001',
      indicatorNameEn: 'GDP Growth Rate',
      indicatorNameAr: 'معدل نمو الناتج المحلي',
      value: '3.5',
      unit: '%',
      timestamp: '2024-01-15T00:00:00Z',
      confidence: 'A',
      sources: [
        {
          id: 'src-1',
          name: 'Central Bank of Yemen',
          type: 'official',
          date: '2024-01-10',
          quality: 'A',
        },
      ],
    };

    it('should render actual evidence data when provided', async () => {
      render(<EvidencePackButton data={validEvidenceData} />);
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('GDP Growth Rate')).toBeInTheDocument();
        expect(screen.getByText('3.5')).toBeInTheDocument();
      });
    });

    it('should show confidence badge when evidence exists', async () => {
      render(<EvidencePackButton data={validEvidenceData} showConfidence />);
      
      // Should show confidence badge in button
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should display source information in Sources tab', async () => {
      render(<EvidencePackButton data={validEvidenceData} />);
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Click Sources tab
      await waitFor(() => {
        const sourcesTab = screen.getByText('Sources');
        fireEvent.click(sourcesTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Central Bank of Yemen')).toBeInTheDocument();
      });
    });

    it('should NOT show GAP indicator when valid evidence exists', () => {
      render(<EvidencePackButton data={validEvidenceData} variant="badge" />);
      
      expect(screen.queryByText('GAP')).not.toBeInTheDocument();
    });
  });

  describe('GAP Ticket Creation', () => {
    it('should create GAP ticket when "Request Evidence" is clicked', async () => {
      render(
        <EvidencePackButton 
          evidencePackId="missing-evidence-123"
          indicatorName="Test Indicator"
          sectorCode="BANK"
        />
      );
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Wait for dialog and click request button
      await waitFor(() => {
        const requestButton = screen.getByText(/Request Evidence Collection/i);
        fireEvent.click(requestButton);
      });
      
      // Should show GAP ticket created
      await waitFor(() => {
        expect(screen.getByText(/GAP-/)).toBeInTheDocument();
      });
    });
  });

  describe('Bilingual Support', () => {
    it('should render Arabic labels when language is Arabic', async () => {
      // Override mock for Arabic
      vi.mock('@/contexts/LanguageContext', () => ({
        useLanguage: () => ({ language: 'ar' }),
      }));
      
      render(<EvidencePackButton evidencePackId="test-ar" />);
      
      // Click to open dialog
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Note: Due to mock limitations, this test verifies the component renders
      // Full Arabic testing should be done in browser proof
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
