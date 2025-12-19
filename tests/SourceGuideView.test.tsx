import React from 'react';
import { render, screen } from '@testing-library/react';
import { SourceGuideView } from '../components/SourceGuideView';
import { SourceGuide } from '../types';
import { describe, it, expect } from 'vitest';

describe('SourceGuideView', () => {
  const mockGuide: SourceGuide = {
    summary: 'Test Summary',
    keyTopics: [{ name: 'Topic 1', description: 'Desc 1' }],
    suggestedQuestions: ['Question 1?']
  };

  it('renders loading state', () => {
    render(<SourceGuideView guide={null} isLoading={true} onSelectQuestion={() => {}} />);
    expect(screen.getByText('Analyzing Source Material...')).toBeDefined();
  });

  it('renders empty state', () => {
    render(<SourceGuideView guide={null} isLoading={false} onSelectQuestion={() => {}} />);
    expect(screen.getByText('Select sources to generate a guide.')).toBeDefined();
  });

  it('renders guide content', () => {
    render(<SourceGuideView guide={mockGuide} isLoading={false} onSelectQuestion={() => {}} />);
    expect(screen.getByText('Test Summary')).toBeDefined();
    expect(screen.getByText('Topic 1')).toBeDefined();
    expect(screen.getByText('Question 1?')).toBeDefined();
  });
});
