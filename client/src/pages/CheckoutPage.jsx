import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/cartStorage';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_replace_me');

function PaymentForm({ orderInfo }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message);
      setProcessing(false);
      return;
    }

    try {
      const paymentIntentId = result.paymentIntent?.id;
      await api.post('/orders/confirm', { paymentIntentId });
      clearCart();
      navigate('/orders?paid=1');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form className="checkout-card" onSubmit={submit}>
      <h2>Оплата заказа #{orderInfo.orderId}</h2>
      <p>Сумма к оплате: <strong>{formatMoney(orderInfo.totalCents)}</strong></p>
      {error && <div className="alert error">{error}</div>}
      <PaymentElement />
      <button className="primary full" disabled={!stripe || processing}>
        {processing ? 'Обработка...' : 'Оплатить'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [orderInfo, setOrderInfo] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Достаем ID заказа из ссылки (если он есть)
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const createIntent = async () => {
      try {
        let response;
        if (orderId) {
          // Если пришли со страницы заказов — восстанавливаем платеж
          response = await api.post(`/orders/${orderId}/resume-payment`);
        } else {
          // Иначе создаем новый заказ из текущей корзины
          response = await api.post('/orders/create-payment-intent');
        }
        setOrderInfo(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    createIntent();
  }, [orderId]);

  if (loading) return <main><p>Загрузка платежа...</p></main>;
  if (error) return <main><div className="alert error">{error}</div></main>;

  return (
    <main className="checkout-page">
      <Elements stripe={stripePromise} options={{ clientSecret: orderInfo.clientSecret }}>
        <PaymentForm orderInfo={orderInfo} />
      </Elements>
    </main>
  );
}