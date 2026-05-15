import { useEffect, useState } from 'react';
import api from '../api/client';
import { formatMoney } from '../utils/cartStorage';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((response) => setOrders(response.data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <h1>История заказов</h1>
      {error && <div className="alert error">{error}</div>}
      {loading && <p>Загрузка заказов...</p>}
      <section className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-head">
              <div>
                <h2>Заказ #{order.id}</h2>
                <p>{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
              </div>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>{item.productName} × {item.quantity} — {formatMoney(item.lineTotalCents)}</li>
              ))}
            </ul>
            <strong>Итого: {formatMoney(order.totalCents)}</strong>
          </article>
        ))}
      </section>
      {!loading && orders.length === 0 && <p className="empty">Заказов пока нет.</p>}
    </main>
  );
}
