import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/cartStorage';

export default function CartPage() {
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, totalCents } = useCart();

  return (
    <main>
      <h1>Корзина</h1>
      {items.length === 0 ? (
        <div className="empty-card">
          <p>Корзина пуста.</p>
          <Link className="primary" to="/">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {items.map((item) => (
              <article key={item.productId} className="cart-item">
                <img src={item.imageUrl || 'https://placehold.co/160x120?text=Product'} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{formatMoney(item.priceCents)} · На складе: {item.stock}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                />
                <strong>{formatMoney(item.priceCents * item.quantity)}</strong>
                <button className="danger" onClick={() => removeItem(item.productId)}>Удалить</button>
              </article>
            ))}
          </section>
          <aside className="summary-card">
            <h2>Итого</h2>
            <strong className="total">{formatMoney(totalCents)}</strong>
            {user ? (
              <Link className="primary full" to="/checkout">Оформить заказ</Link>
            ) : (
              <Link className="primary full" to="/login">Войти для оформления</Link>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
