import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';

describe('Navbar', () => {
  test('renders guest links and cart count', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn(), isAdmin: false });
    useCart.mockReturnValue({ count: 2 });

    render(<MemoryRouter><Navbar /></MemoryRouter>);

    expect(screen.getByText('E-Shop')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('renders admin link for admin user', () => {
    useAuth.mockReturnValue({ user: { name: 'Admin', role: 'admin' }, logout: vi.fn(), isAdmin: true });
    useCart.mockReturnValue({ count: 0 });

    render(<MemoryRouter><Navbar /></MemoryRouter>);

    expect(screen.getByText('Админ-панель')).toBeInTheDocument();
    expect(screen.getByText('Admin · admin')).toBeInTheDocument();
  });
});
