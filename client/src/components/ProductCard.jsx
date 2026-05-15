import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/cartStorage';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem(product, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      <img src={product.imageUrl || 'https://placehold.co/600x400?text=Product'} alt={product.name} />
      <div className="product-info">
        <span className="category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-footer">
          <strong>{formatMoney(product.priceCents)}</strong>
          <span className={product.stock > 0 ? 'stock ok' : 'stock empty'}>На складе: {product.stock}</span>
        </div>
        <button className="primary full" disabled={product.stock <= 0 || adding} onClick={handleAdd}>
          {adding ? 'Добавление...' : 'В корзину'}
        </button>
      </div>
    </article>
  );
}
