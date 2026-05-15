import { useEffect, useState } from 'react';
import api from '../api/client';
import { formatMoney } from '../utils/cartStorage';

const emptyForm = { name: '', description: '', category: 'other', price: '', stock: '', imageUrl: '', isActive: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await api.get('/products');
    setProducts(response.data.products);
  };

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Товар обновлён');
      } else {
        await api.post('/products', payload);
        setMessage('Товар создан');
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive,
    });
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <h1>Админ-панель товаров</h1>
      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Категория" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input placeholder="Цена" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Остаток" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        <input placeholder="URL изображения" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <textarea placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="primary">{editingId ? 'Сохранить' : 'Создать товар'}</button>
        {editingId && <button type="button" className="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Отмена</button>}
      </form>

      <section className="admin-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatMoney(product.priceCents)}</td>
                <td>{product.stock}</td>
                <td className="table-actions">
                  <button className="ghost" onClick={() => edit(product)}>Редактировать</button>
                  <button className="danger" onClick={() => remove(product.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
