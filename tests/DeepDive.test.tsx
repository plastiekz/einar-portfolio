import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import 'fake-indexeddb/auto';
import { DeepDive } from '../components/DeepDive';
import * as geminiService from '../services/geminiService';

// Mock the geminiService
vi.mock('../services/geminiService', () => ({
  performDeepAnalysis: vi.fn(),
  generateAdversarialDebate: vi.fn(),
  generateSuggestedQuestions: vi.fn(),
}));

describe('DeepDive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<DeepDive />);
    expect(screen.getByText('Deep Thinking Engine')).toBeTruthy();
  });

  it('calls performDeepAnalysis and generates questions on standard analysis', async () => {
    const mockAnalysis = '## Analysis Result\n\nThis is a test analysis.';
    const mockQuestions = ['Question 1', 'Question 2'];

    (geminiService.performDeepAnalysis as any).mockResolvedValue(mockAnalysis);
    (geminiService.generateSuggestedQuestions as any).mockResolvedValue(mockQuestions);

    render(<DeepDive />);

    const textarea = screen.getByPlaceholderText(/e\.g\., Sparse Autoencoders/i);
    fireEvent.change(textarea, { target: { value: 'Test Topic' } });

    const button = screen.getByText('INITIALIZE DEEP ANALYSIS');
    fireEvent.click(button);

    await waitFor(() => {
      expect(geminiService.performDeepAnalysis).toHaveBeenCalledWith('Test Topic');
    });

    await waitFor(() => {
      expect(geminiService.generateSuggestedQuestions).toHaveBeenCalledWith(mockAnalysis);
    });

    // Check if analysis is displayed
    expect(screen.getByText('Analysis Result')).toBeTruthy();
    expect(screen.getByText('This is a test analysis.')).toBeTruthy();

    // Check if questions are displayed
    expect(screen.getByText('Question 1')).toBeTruthy();
    expect(screen.getByText('Question 2')).toBeTruthy();
  });

    it('renders bold text correctly', async () => {
     const mockAnalysis = 'This is **bold** text.';
     (geminiService.performDeepAnalysis as any).mockResolvedValue(mockAnalysis);
     (geminiService.generateSuggestedQuestions as any).mockResolvedValue([]);

     render(<DeepDive />);
     const textarea = screen.getByPlaceholderText(/e\.g\., Sparse Autoencoders/i);
     fireEvent.change(textarea, { target: { value: 'Test Topic' } });
     fireEvent.click(screen.getByText('INITIALIZE DEEP ANALYSIS'));

     await waitFor(() => {
         // Check for the strong tag presence which indicates bold rendering
         const boldElement = screen.getByText('bold');
         expect(boldElement.tagName).toBe('STRONG');
     });
  });
});
