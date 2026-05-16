import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();

  return (
    <header className="navbar">
      {/* Левая часть (Логотип) */}
      <div className="navbar-left">
        <Link to="/" className="brand">sayuwanj market</Link>
      </div>

      {/* Центральная часть (Навигация) */}
      <nav className="navlinks">
        <NavLink to="/" className="catalog-btn">Каталог</NavLink>
        {user && <NavLink to="/orders" className="nav-link-item">Заказы</NavLink>}
        {isAdmin && <NavLink to="/admin/products" className="nav-link-item">Админ-панель</NavLink>}
      </nav>

      {/* Правая часть (Корзина и Профиль) */}
      <div className="nav-actions">
        <Link to="/cart" className="cart-link" aria-label="Корзина">
          <ShoppingCart size={20} />
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
        {user ? (
          <>
            <span className="user-badge">{user.name}</span>
            <button className="ghost small" onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link className="ghost small" to="/login">Войти</Link>
            <Link className="primary small" to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
}