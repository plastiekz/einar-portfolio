import React from 'react';
import { render, screen } from '@testing-library/react';
import { AudioOverview } from '../components/AudioOverview';
import { PodcastTurn } from '../types';
import { describe, it, expect } from 'vitest';

describe('AudioOverview', () => {
  const mockScript: PodcastTurn[] = [
    { speaker: 'Host', text: 'Hello' },
    { speaker: 'Expert', text: 'Hi there' }
  ];

  it('renders loading state', () => {
    render(<AudioOverview script={null} isLoading={true} onGenerate={() => {}} />);
    expect(screen.getByText('Synthesizing Audio Overview...')).toBeDefined();
  });

  it('renders initial state', () => {
    render(<AudioOverview script={null} isLoading={false} onGenerate={() => {}} />);
    expect(screen.getByText('Generate Audio Overview')).toBeDefined();
  });

  it('renders script content', () => {
    render(<AudioOverview script={mockScript} isLoading={false} onGenerate={() => {}} />);
    expect(screen.getByText('Hello')).toBeDefined();
    expect(screen.getByText('Hi there')).toBeDefined();
  });
});
