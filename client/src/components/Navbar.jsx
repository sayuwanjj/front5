import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();

  return (
    <header className="navbar">
      {/* Левая часть */}
      <div className="navbar-left">
        <Link to="/" className="brand">E-Shop</Link>
      </div>

      {/* Центральная часть */}
      <nav className="navlinks">
        <NavLink to="/" className="catalog-btn">Каталог</NavLink>
        {user && <NavLink to="/orders" className="nav-link-item">Заказы</NavLink>}
        {isAdmin && <NavLink to="/admin/products" className="nav-link-item">Админ-панель</NavLink>}
      </nav>

      {/* Правая часть */}
      <div className="nav-actions">
        <Link to="/cart" className="cart-link" aria-label="Корзина">
          <ShoppingCart size={20} />
          {count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
        {user ? (
          <>
            <span className="user-badge">{user.name}</span>
            <button className="nav-btn ghost" onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link className="nav-btn ghost" to="/login">Войти</Link>
            <Link className="nav-btn primary" to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
}