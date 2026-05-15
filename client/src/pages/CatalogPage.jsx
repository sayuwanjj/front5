import { useEffect, useState } from 'react';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';

const initialFilters = { q: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' };

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
        const response = await api.get('/products', { params });
        setProducts(response.data.products);
        setCategories(response.data.categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters]);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Stripe + Inventory</p>
          <h1>Интернет-магазин с оплатой и управлением остатками</h1>
          <p>Каталог, корзина, JWT-авторизация, история заказов и админ-панель в одном проекте.</p>
        </div>
      </section>

      <ProductFilters filters={filters} categories={categories} onChange={setFilters} />

      {error && <div className="alert error">{error}</div>}
      {loading ? <p>Загрузка товаров...</p> : null}

      <section className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </section>

      {!loading && products.length === 0 && <p className="empty">Товары не найдены.</p>}
    </main>
  );
}
