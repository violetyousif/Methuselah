// src/__tests__/ProfileForm.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from '../pages/profile';
import '@testing-library/jest-dom';

describe('Profile Form', () => {
  test('renders Save button', () => {
    render(<Profile />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
});
