import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const handleCancel = async (orderId) => {
    if (!window.confirm('Вы уверены, что хотите отменить этот заказ?')) return;

    try {
      await api.post(`/orders/${orderId}/cancel`);
      // Обновляем статус заказа локально, чтобы не перезагружать страницу
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'cancelled': return 'Отменён';
      default: return 'Ожидает оплаты';
    }
  };

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

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className={`status ${order.status}`}>
                  {getStatusText(order.status)}
                </span>

                {order.status === 'pending_payment' && (
                  <>
                    <Link to={`/checkout?orderId=${order.id}`} className="primary small">
                      Оплатить
                    </Link>
                    <button className="danger small" onClick={() => handleCancel(order.id)}>
                      Отменить
                    </button>
                  </>
                )}
              </div>

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