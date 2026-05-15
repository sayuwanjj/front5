import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function renderRoute(user, role) {
  useAuth.mockReturnValue({ user });
  render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/" element={<div>home page</div>} />
        <Route path="/private" element={<ProtectedRoute role={role}><div>private page</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  test('redirects guest to login', () => {
    renderRoute(null);
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  test('renders for authenticated user', () => {
    renderRoute({ role: 'customer' });
    expect(screen.getByText('private page')).toBeInTheDocument();
  });

  test('redirects when role is not enough', () => {
    renderRoute({ role: 'customer' }, 'admin');
    expect(screen.getByText('home page')).toBeInTheDocument();
  });
});
