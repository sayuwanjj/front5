import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { formatMoney } from '../utils/cartStorage';

export default function CartPage() {
  const { items, addItem, removeItem, totalCents } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (item, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) return;
    if (qty > item.stock) {
      alert(`Доступно только ${item.stock} шт.`);
      return;
    }
    await addItem(item, qty);
  };

  return (
    <main>
      <h1>Корзина</h1>

      {items.length === 0 ? (
        <div className="empty-cart" style={{ marginTop: '24px' }}>
          <p className="empty">Ваша корзина пуста</p>
          <br />
          <Link to="/" className="primary">В каталог</Link>
        </div>
      ) : (
        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start', marginTop: '24px' }}>

          {/* Список товаров в корзине */}
          <section className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => {
              // ИСПРАВЛЕНИЕ: Безопасно отсекаем лишние ссылки и берем только ПЕРВУЮ картинку товара
              const rawImage = item.imageUrl || item.productImageUrl || '';
              const imageList = rawImage ? rawImage.split(',').map(url => url.trim()).filter(Boolean) : [];
              const displayImage = imageList.length > 0 ? imageList[0] : 'https://placehold.co/600x400?text=Product';

              return (
                <article className="order-card" key={item.productId} style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img
                    src={displayImage}
                    alt={item.name}
                    style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{item.name}</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                      {formatMoney(item.priceCents)} &bull; На складе: {item.stock}
                    </p>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, e.target.value)}
                      style={{ width: '60px', padding: '8px', textAlign: 'center' }}
                    />
                  </div>

                  <strong style={{ minWidth: '80px', textAlign: 'right' }}>
                    {formatMoney(item.priceCents * item.quantity)}
                  </strong>

                  <button className="danger small" onClick={() => removeItem(item.productId)} style={{ padding: '8px 12px' }}>
                    Удалить
                  </button>
                </article>
              );
            })}
          </section>

          {/* Блок итоговой суммы */}
          <section className="checkout-card" style={{ padding: '24px' }}>
            <h2>Итого</h2>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: '#4f46e5', margin: '16px 0' }}>
              {formatMoney(totalCents)}
            </p>
            <button className="primary full" onClick={() => navigate('/checkout')} style={{ height: '48px', fontSize: '1rem' }}>
              Оформить заказ
            </button>
          </section>

        </div>
      )}
    </main>
  );
}