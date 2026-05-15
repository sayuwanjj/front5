import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { cartTotalCents, clearLocalCart, readLocalCart, upsertLocalCartItem, writeLocalCart } from '../utils/cartStorage';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(() => readLocalCart());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      const localItems = readLocalCart();
      setItems(localItems);
      return;
    }

    const sync = async () => {
      setLoading(true);
      try {
        const localItems = readLocalCart();
        const response = await api.post('/cart/sync', { items: localItems.map(({ productId, quantity }) => ({ productId, quantity })) });
        setItems(response.data.cart.items);
        clearLocalCart();
      } finally {
        setLoading(false);
      }
    };

    sync();
  }, [user?.id]);

  const persist = async (nextItems) => {
    if (!user) {
      writeLocalCart(nextItems);
      setItems(nextItems);
      return;
    }

    const response = await api.post('/cart/sync', { items: nextItems.map(({ productId, quantity }) => ({ productId, quantity })) });
    setItems(response.data.cart.items);
  };

  const addItem = async (product, quantity = 1) => {
    const nextItems = upsertLocalCartItem(items, product, quantity);
    await persist(nextItems);
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }
    const nextItems = items.map((item) => (item.productId === productId ? { ...item, quantity } : item));
    await persist(nextItems);
  };

  const removeItem = async (productId) => {
    const nextItems = items.filter((item) => item.productId !== productId);
    await persist(nextItems);
  };

  const clearCart = () => {
    clearLocalCart();
    setItems([]);
  };

  const value = useMemo(() => ({
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalCents: cartTotalCents(items),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  }), [items, loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
