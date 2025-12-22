import { render, screen, fireEvent } from '@testing-library/react';
import AgentCommandCenter from '../components/AgentCommandCenter';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock services to prevent side effects
vi.mock('../services/geminiService', () => ({
  activateVanguard: vi.fn(),
}));
vi.mock('../services/legalAgent', () => ({
  findFirms: vi.fn(),
}));
vi.mock('../services/marketplaceAgent', () => ({
  findDeals: vi.fn(),
}));
// Mock child component
vi.mock('../components/RiskThermometer', () => ({
    default: () => <div data-testid="risk-thermometer">Risk Thermometer</div>
}));

describe('AgentCommandCenter Accessibility', () => {
  it('should have accessible inputs linked to labels in Vanguard mode', () => {
    render(<AgentCommandCenter />);

    // This looks for an input associated with the label "Target Designation"
    // It will fail if the label doesn't have htmlFor or the input doesn't have the matching id
    const input = screen.getByLabelText(/Target Designation/i);
    expect(input).toBeTruthy();
  });

  it('should have a live region for logs', () => {
      render(<AgentCommandCenter />);

      // Should find an element with role="log" (implicit or explicit)
      // The current implementation uses a div with custom classes but no role
      const logRegion = screen.getByRole('log');
      expect(logRegion).toBeTruthy();
      expect(logRegion.getAttribute('aria-live')).toBe('polite');
  });

  it('should have accessible inputs in Field Ops mode', () => {
      render(<AgentCommandCenter />);

      // Switch to FIELD_OPS
      const switchButton = screen.getByText('FIELD OPS');
      fireEvent.click(switchButton);

      const input = screen.getByLabelText(/Operation Query/i);
      expect(input).toBeTruthy();
  });
});
