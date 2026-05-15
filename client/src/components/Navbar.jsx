import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();

  return (
    <header className="navbar">
      <Link to="/" className="brand">E-Shop</Link>
      <nav className="navlinks">
        <NavLink to="/">Каталог</NavLink>
        {user && <NavLink to="/orders">Заказы</NavLink>}
        {isAdmin && <NavLink to="/admin/products">Админ-панель</NavLink>}
      </nav>
      <div className="nav-actions">
        <Link to="/cart" className="cart-link" aria-label="Корзина">
          <ShoppingCart size={20} />
          <span>{count}</span>
        </Link>
        {user ? (
          <>
            <span className="user-badge">{user.name} · {user.role}</span>
            <button className="ghost" onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link className="ghost" to="/login">Войти</Link>
            <Link className="primary small" to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
}
