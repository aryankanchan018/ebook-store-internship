import { useState } from "react";
import { bfsRecommend, useStore } from "../store/useStore";
import ProductCard from "../components/ProductCard";

export default function RecommendationsPage({ setPage }) {
  const { state } = useStore();
  const { catalog } = state;
  const [selected, setSelected] = useState(null);

  const book = selected ?? catalog[0];
  const recs = book ? bfsRecommend(book.id, catalog, 2) : [];

  if (!catalog.length) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Personalised for you</span>
          <h2>🤝 You May Also Like</h2>
        </div>
      </div>

      <div className="rec-controls">
        <label>
          Based on:
          <select value={book?.id ?? ""} onChange={e => setSelected(catalog.find(p => p.id === e.target.value))}>
            {catalog.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>

      <div className="rec-seed">
        <p>Readers who enjoyed <strong>{book?.name}</strong> also loved:</p>
      </div>

      {recs.length === 0
        ? <p className="empty">No recommendations found for this title.</p>
        : <div className="product-grid">{recs.map(p => <ProductCard key={p.id} product={p} setPage={setPage} />)}</div>
      }
    </div>
  );
}
