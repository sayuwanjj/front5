import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/cartStorage';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const [adding, setAdding] = useState(false);

  const cartItem = items?.find((item) => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = async (e) => {
    e.preventDefault(); // Предотвращаем переход на страницу товара при клике по кнопке
    setAdding(true);
    try {
      await addItem(product, quantityInCart + 1);
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stock <= 0 || quantityInCart >= product.stock;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} style={{ display: 'block', overflow: 'hidden' }}>
        <img src={product.imageUrl || 'https://placehold.co/600x400?text=Product'} alt={product.name} />
      </Link>
      <div className="product-info">
        <span className="category">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description}</p>
        <div className="product-footer">
          <strong>{formatMoney(product.priceCents)}</strong>
          <span className={product.stock > 0 ? 'stock ok' : 'stock empty'}>На складе: {product.stock}</span>
        </div>

        <button
          className={`primary full ${quantityInCart > 0 ? 'in-cart' : ''}`}
          disabled={isOutOfStock || adding}
          onClick={handleAdd}
        >
          {adding ? 'Добавление...' : quantityInCart > 0 ? `В корзине: ${quantityInCart}` : 'В корзину'}
        </button>
      </div>
    </article>
  );
}