import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));

import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

const product = {
  id: 1,
  name: 'Keyboard',
  description: 'Mechanical keyboard',
  category: 'electronics',
  priceCents: 1299,
  price: 12.99,
  stock: 5,
  imageUrl: '',
};

describe('ProductCard', () => {
  test('renders product data and adds item', async () => {
    const addItem = vi.fn().mockResolvedValue(undefined);
    useCart.mockReturnValue({ addItem });

    render(<ProductCard product={product} />);

    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    fireEvent.click(screen.getByText('В корзину'));

    expect(addItem).toHaveBeenCalledWith(product, 1);
  });

  test('disables add button when out of stock', () => {
    useCart.mockReturnValue({ addItem: vi.fn() });
    render(<ProductCard product={{ ...product, stock: 0 }} />);
    expect(screen.getByText('В корзину')).toBeDisabled();
  });
});
