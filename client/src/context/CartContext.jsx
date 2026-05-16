import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Импортируем хук авторизации

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();

  // Определяем уникальный префикс для ключа (ID пользователя или 'guest')
  const userId = user ? user.id : 'guest';

  const [items, setItems] = useState([]);
  const [loadedUserId, setLoadedUserId] = useState(null);

  // 1. ЗАГРУЗКА: Автоматически переключаем и загружаем корзину при смене пользователя (или выходе)
  useEffect(() => {
    const savedCart = localStorage.getItem(`sayuwanj_cart_${userId}`);
    setItems(savedCart ? JSON.parse(savedCart) : []);

    // Фиксируем, что текущие элементы в состоянии памяти соответствуют именно этому пользователю
    setLoadedUserId(userId);
  }, [userId]);

  // 2. СОХРАНЕНИЕ: Записываем изменения в localStorage конкретного пользователя
  useEffect(() => {
    // Проверка предотвращает баг, когда при выходе из аккаунта данные старого пользователя 
    // стирали или перезаписывали корзину следующего сеанса до того, как сработал первый useEffect
    if (loadedUserId === userId) {
      localStorage.setItem(`sayuwanj_cart_${userId}`, JSON.stringify(items));
    }
  }, [items, userId, loadedUserId]);

  const addItem = (product, quantity) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: Number(quantity) } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          stock: product.stock,
          imageUrl: product.imageUrl,
          quantity: Number(quantity),
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalCents, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}