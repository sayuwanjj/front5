import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ProductFilters from './ProductFilters';

describe('ProductFilters', () => {
  test('updates search field', () => {
    const onChange = vi.fn();
    render(<ProductFilters filters={{ q: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' }} categories={['electronics']} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Поиск'), { target: { value: 'mouse' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ q: 'mouse' }));
  });

  test('renders categories', () => {
    render(<ProductFilters filters={{ q: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' }} categories={['office']} onChange={() => {}} />);
    expect(screen.getByText('office')).toBeInTheDocument();
  });
});
