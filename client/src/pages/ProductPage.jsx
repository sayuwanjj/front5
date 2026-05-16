import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/cartStorage';

export default function ProductPage() {
    const { id } = useParams();
    const { addItem, items } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then((res) => setProduct(res.data.product))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <main><p>Загрузка товара...</p></main>;
    if (error) return <main><div className="alert error">{error}</div><br /><Link to="/" className="primary">В каталог</Link></main>;
    if (!product) return <main><p>Товар не найден</p></main>;

    const cartItem = items?.find((item) => item.productId === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    const isOutOfStock = product.stock <= 0 || quantityInCart >= product.stock;

    const handleAdd = async () => {
        setAdding(true);
        try {
            await addItem(product, quantityInCart + 1);
        } finally {
            setAdding(false);
        }
    };

    // Парсим строку картинок из БД в массив
    const images = product.imageUrl
        ? product.imageUrl.split(',').map(url => url.trim()).filter(Boolean)
        : [];

    if (images.length === 0) {
        images.push('https://placehold.co/600x400?text=No+Image+Available');
    }

    return (
        <main className="product-page">
            <Link
                to="/"
                className="primary nav-btn"
                style={{
                    marginBottom: '32px',
                    background: '#eef2ff',
                    color: '#4f46e5',
                    border: '2px solid #4f46e5',
                    fontWeight: '700',
                    padding: '12px 28px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.15)',
                    display: 'inline-flex'
                }}
            >
                ← Вернуться в каталог
            </Link>

            <div className="product-details-layout">

                {/* Левая колонка: Карусель изображений */}
                <div className="carousel-section">
                    <div className="main-image">
                        <img src={images[activeImage] || images[0]} alt={product.name} />
                    </div>

                    {/* Показываем миниатюры только если картинок больше, чем 1 */}
                    {images.length > 1 && (
                        <div className="thumbnails">
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={index === activeImage ? 'active' : ''}
                                    onClick={() => setActiveImage(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Правая колонка: Описание и добавление */}
                <div className="product-info-section">
                    <span className="category">{product.category}</span>
                    <h1>{product.name}</h1>
                    <p className="price">{formatMoney(product.priceCents)}</p>

                    <div className="description">
                        <h3>Описание товара</h3>
                        <p>{product.description}</p>
                    </div>

                    <div className="stock-info">
                        <span className={product.stock > 0 ? 'stock ok' : 'stock empty'}>
                            {product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии'}
                        </span>
                    </div>

                    <button
                        className={`primary full large-btn ${quantityInCart > 0 ? 'in-cart' : ''}`}
                        disabled={isOutOfStock || adding}
                        onClick={handleAdd}
                    >
                        {adding ? 'Добавление...' : quantityInCart > 0 ? `В корзине: ${quantityInCart}` : 'Добавить в корзину'}
                    </button>
                </div>
            </div>
        </main>
    );
}