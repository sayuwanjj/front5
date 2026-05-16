import { useEffect, useState } from 'react';
import api from '../api/client';
import { formatMoney } from '../utils/cartStorage';

const emptyForm = { name: '', description: '', category: 'other', price: '', stock: '', image1: '', image2: '', image3: '', isActive: true };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [view, setView] = useState('list');
  const [activePreviewImage, setActivePreviewImage] = useState(0);

  const load = async () => {
    const response = await api.get('/products');
    setProducts(response.data.products);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    // Собираем ссылки из трёх инпутов в одну строку через запятую
    const joinedImages = [form.image1, form.image2, form.image3]
      .map(url => url.trim())
      .filter(Boolean)
      .join(',');

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: joinedImages,
      isActive: form.isActive
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Товар успешно обновлён');
      } else {
        await api.post('/products', payload);
        setMessage('Товар успешно создан');
      }
      setForm(emptyForm);
      setEditingId(null);
      setView('list');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (product) => {
    setEditingId(product.id);

    // Разбиваем полученную с бэкенда строку по запятым обратно на 3 инпута
    const imgs = product.imageUrl ? product.imageUrl.split(',').map(url => url.trim()) : [];

    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image1: imgs[0] || '',
      image2: imgs[1] || '',
      image3: imgs[2] || '',
      isActive: product.isActive,
    });
    setActivePreviewImage(0);
    setView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id, event) => {
    event.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    setError('');
    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Формируем массив непустых картинок для показа превью внутри админ-формы
  const previewImages = [form.image1, form.image2, form.image3]
    .map(url => url.trim())
    .filter(Boolean);

  if (previewImages.length === 0) {
    previewImages.push('https://placehold.co/600x400/f8fafc/4f46e5?text=Превью+картинки');
  }

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>{view === 'list' ? 'Админ-панель товаров' : editingId ? 'Редактирование карточки товара' : 'Создание новой карточки товара'}</h1>
        {view === 'list' && (
          <button className="primary nav-btn" onClick={() => { setForm(emptyForm); setEditingId(null); setView('edit'); }}>
            Добавить новый товар
          </button>
        )}
      </div>

      {error && <div className="alert error" style={{ marginBottom: '20px' }}>{error}</div>}
      {message && <div className="alert success" style={{ marginBottom: '20px' }}>{message}</div>}

      {view === 'list' ? (
        <section className="admin-table">
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '16px' }}>
            Кликните в любом месте на строку товара, чтобы открыть его подробную карточку для редактирования.
          </p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Превью</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th style={{ textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const firstImg = product.imageUrl ? product.imageUrl.split(',')[0].trim() : '';
                return (
                  <tr
                    key={product.id}
                    onClick={() => edit(product)}
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td>{product.id}</td>
                    <td>
                      <img
                        src={firstImg || 'https://placehold.co/600x400?text=No+Photo'}
                        alt={product.name}
                        style={{ width: '52px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                    </td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{product.name}</td>
                    <td><span className="category" style={{ fontSize: '0.75rem', padding: '3px 9px' }}>{product.category}</span></td>
                    <td style={{ fontWeight: '700' }}>{formatMoney(product.priceCents)}</td>
                    <td>
                      <span className={`stock ${product.stock > 0 ? 'ok' : 'empty'}`}>
                        {product.stock} шт.
                      </span>
                    </td>
                    <td className="table-actions">
                      <button className="danger small" onClick={(e) => remove(product.id, e)}>Удалить</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        <form onSubmit={submit}>
          <button type="button" className="primary nav-btn" onClick={() => setView('list')} style={{ marginBottom: '28px', background: '#eef2ff', color: '#4f46e5', border: '2px solid #4f46e5', fontWeight: '700' }}>
            ← Назад к таблице товаров
          </button>

          <div className="product-details-layout">

            {/* Левая колонка: Превью карусели */}
            <div className="carousel-section">
              <div className="main-image">
                <img src={previewImages[activePreviewImage] || previewImages[0]} alt="Превью" />
              </div>

              {previewImages.length > 1 && (
                <div className="thumbnails">
                  {previewImages.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Ракурс ${index + 1}`}
                      className={index === activePreviewImage ? 'active' : ''}
                      onClick={() => setActivePreviewImage(index)}
                    />
                  ))}
                </div>
              )}

              {/* Ссылки на картинки */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>Главная картинка товара (URL):</label>
                  <input
                    placeholder="https://images.unsplash.com/... (Главное фото)"
                    value={form.image1}
                    onChange={(e) => setForm({ ...form, image1: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>Второе изображение карусели (URL):</label>
                  <input
                    placeholder="https://images.unsplash.com/... (Второй ракурс)"
                    value={form.image2}
                    onChange={(e) => setForm({ ...form, image2: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.85rem', color: '#475569', display: 'block', marginBottom: '4px' }}>Третье изображение карусели (URL):</label>
                  <input
                    placeholder="https://images.unsplash.com/... (Третий ракурс)"
                    value={form.image3}
                    onChange={(e) => setForm({ ...form, image3: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Правая колонка: Характеристики */}
            <div className="product-info-section" style={{ gap: '16px', display: 'flex', flexDirection: 'column' }}>
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Категория:</label>
                <input placeholder="Например: electronics, office, accessories..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>

              <div>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Название товара:</label>
                <input placeholder="Введите название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ fontSize: '1.2rem', fontWeight: '700' }} />
              </div>

              <div>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Цена ($):</label>
                <input placeholder="0.00" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={{ fontSize: '1.1rem', fontWeight: '700', color: '#4f46e5' }} />
              </div>

              <div className="description" style={{ margin: 0 }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Описание характеристик:</label>
                <textarea placeholder="Напишите здесь подробную информацию о товаре..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: '130px', lineHeight: '1.5' }} />
              </div>

              <div>
                <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Остаток инвентаря на складе (шт):</label>
                <input placeholder="0" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="primary full large-btn">
                  {editingId ? 'Сохранить изменения' : 'Опубликовать товар'}
                </button>
                <button type="button" className="ghost large-btn" onClick={() => setView('list')} style={{ width: '160px' }}>
                  Отмена
                </button>
              </div>
            </div>

          </div>
        </form>
      )}
    </main>
  );
}