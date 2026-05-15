export default function ProductFilters({ filters, categories, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  return (
    <section className="filters">
      <input
        aria-label="Поиск"
        placeholder="Поиск товаров"
        value={filters.q}
        onChange={(event) => update('q', event.target.value)}
      />
      <select aria-label="Категория" value={filters.category} onChange={(event) => update('category', event.target.value)}>
        <option value="">Все категории</option>
        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
      </select>
      <input
        aria-label="Минимальная цена"
        placeholder="Цена от"
        type="number"
        min="0"
        value={filters.minPrice}
        onChange={(event) => update('minPrice', event.target.value)}
      />
      <input
        aria-label="Максимальная цена"
        placeholder="Цена до"
        type="number"
        min="0"
        value={filters.maxPrice}
        onChange={(event) => update('maxPrice', event.target.value)}
      />
      <select aria-label="Сортировка" value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
        <option value="newest">Сначала новые</option>
        <option value="price_asc">Цена ↑</option>
        <option value="price_desc">Цена ↓</option>
        <option value="name">Название</option>
      </select>
    </section>
  );
}
