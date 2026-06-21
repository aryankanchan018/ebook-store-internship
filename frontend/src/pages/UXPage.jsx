const uiElements = [
  "Login and registration screens",
  "Book catalog grid with price, author, genre, and actions",
  "Search bar with genre, author, tag, and price filters",
  "Book detail and recommendation views",
  "Wishlist, cart, undo remove, coupon, and checkout controls",
  "Order queue, payment status, and delivery route tracking",
];

const flow = [
  "Login or create an account",
  "Browse genres or search by keyword",
  "Review a book and save it to wishlist or cart",
  "Adjust the cart, undo accidental removals, and apply coupons",
  "Place a standard or premium order",
  "Track the shortest delivery route and discover related books",
];

const issues = [
  "Search and filter controls must stay easy to find when the catalog grows.",
  "Cart removal needs recovery so users do not lose buying intent.",
  "Coupon logic can feel opaque unless the best discount is made visible.",
  "Premium queue priority needs clear status feedback.",
  "Delivery routes should be shown as a path, not only raw graph data.",
  "Recommendations need context so they feel connected to the current book.",
];

const improvements = [
  ["Fast search", "HashMap indexes tags so book lookup feels immediate."],
  ["Clear browsing", "Genre tree navigation mirrors how readers scan categories."],
  ["Recoverable cart", "Stack-based undo restores the last removed book."],
  ["Better discounts", "Dynamic programming selects the strongest coupon result."],
  ["Visible priority", "PriorityQueue processing makes premium status meaningful."],
  ["Readable tracking", "Dijkstra routes turn the delivery graph into a shortest path."],
];

const principles = [
  ["Clarity", "Every screen highlights a primary next action."],
  ["Consistency", "Book cards, filters, buttons, and status chips behave predictably."],
  ["Feedback", "Search, wishlist, cart, coupon, order, and route actions respond immediately."],
  ["Error prevention", "Duplicate wishlist items are blocked and removals can be undone."],
  ["Efficiency", "Indexes, queues, sorted maps, and graphs reduce repeated user effort."],
  ["Accessibility", "Controls use readable labels, strong contrast, and keyboard-friendly inputs."],
];

const challenges = [
  ["Too many books", "Search, filters, genre tree", "HashMap, Tree, TreeMap"],
  ["Accidental removal", "Undo remove action", "Stack"],
  ["Duplicate wishlist", "Unique saved books", "HashSet"],
  ["Confusing coupons", "Automatic best discount", "Dynamic Programming"],
  ["Mixed order priority", "Queue status and premium badge", "Queue, PriorityQueue"],
  ["Complex delivery", "Shortest route display", "Graph + Dijkstra"],
  ["Weak discovery", "Related book suggestions", "Graph + BFS"],
];

const organization = [
  ["Discovery", "Catalog, genres, search, filters, recommendations"],
  ["Evaluation", "Book details, author, genre, price, rating"],
  ["Decision", "Wishlist, cart, quantity, coupon, checkout"],
  ["Fulfillment", "Order queue, payment, delivery path"],
  ["Retention", "Recently viewed books and personalized recommendations"],
];

export default function UXPage() {
  return (
    <div className="ux-page">
      <section className="ux-hero">
        <div>
          <span className="eyebrow">UX blueprint</span>
          <h1>BookSphere experience map</h1>
          <p>
            A user-facing view of how the bookstore organizes interface elements,
            shopping flow, usability risks, and data-structure-backed improvements.
          </p>
        </div>
        <div className="ux-flow-preview" aria-label="BookSphere user flow">
          {["Search", "Save", "Cart", "Order", "Track"].map((step, index) => (
            <span key={step}>
              {step}
              {index < 4 ? <i>→</i> : null}
            </span>
          ))}
        </div>
      </section>

      <section className="ux-grid">
        <article className="ux-panel ux-span-2">
          <span className="eyebrow">Identify UI Elements</span>
          <h2>Interface inventory</h2>
          <div className="ux-chip-grid">
            {uiElements.map(item => <span key={item}>{item}</span>)}
          </div>
        </article>

        <article className="ux-panel">
          <span className="eyebrow">User Interaction Flow</span>
          <h2>Reader journey</h2>
          <ol className="ux-timeline">
            {flow.map(item => <li key={item}>{item}</li>)}
          </ol>
        </article>

        <article className="ux-panel">
          <span className="eyebrow">Usability Issues</span>
          <h2>Risks to watch</h2>
          <ul className="ux-list">
            {issues.map(item => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="ux-panel ux-span-2">
          <span className="eyebrow">UX Improvements</span>
          <h2>Better experiences through DSA</h2>
          <div className="ux-improvement-grid">
            {improvements.map(([title, copy]) => (
              <div key={title}>
                <strong>{title}</strong>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="ux-panel ux-span-2">
          <span className="eyebrow">UX/UI Principles</span>
          <h2>Design rules in use</h2>
          <div className="ux-principles">
            {principles.map(([title, copy]) => (
              <section key={title}>
                <strong>{title}</strong>
                <p>{copy}</p>
              </section>
            ))}
          </div>
        </article>

        <article className="ux-panel ux-span-2">
          <span className="eyebrow">Overcoming Usability Challenges</span>
          <h2>Challenge response map</h2>
          <div className="ux-table-wrap">
            <table className="ux-table">
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>UX Response</th>
                  <th>Data Structure Support</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map(([challenge, response, support]) => (
                  <tr key={challenge}>
                    <td>{challenge}</td>
                    <td>{response}</td>
                    <td><span>{support}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="ux-panel ux-span-2">
          <span className="eyebrow">Information Organization</span>
          <h2>How content is grouped</h2>
          <div className="ux-org-grid">
            {organization.map(([title, copy]) => (
              <section key={title}>
                <strong>{title}</strong>
                <p>{copy}</p>
              </section>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
