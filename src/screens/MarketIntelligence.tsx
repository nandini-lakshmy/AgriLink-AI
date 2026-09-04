import PriceChart from "../components/PriceChart";

export default function MarketIntelligence() {
  return (
    <div className="market-page">

      {/* PAGE HEADER */}
      <header className="market-header">
        <div className="market-header-text">
          <span className="market-eyebrow">
            MARKET INTELLIGENCE
          </span>

          <h1>
            Know the Market.
            <br />
            <span>Sell Smarter.</span>
          </h1>

          <p>
            Track crop prices, compare nearby markets and
            understand demand before selling your harvest.
          </p>
        </div>

        <div className="market-header-date">
          <span>Market data</span>
          <strong>Updated today</strong>
        </div>
      </header>

      {/* FILTERS */}
      <section className="market-filters">

        <div className="market-filter">
          <label>Crop</label>

          <select defaultValue="onion">
            <option value="onion">🧅 Onion</option>
            <option value="tomato">🍅 Tomato</option>
            <option value="chilli">🌶️ Chilli</option>
            <option value="potato">🥔 Potato</option>
          </select>
        </div>

        <div className="market-filter">
          <label>Market</label>

          <select defaultValue="perumbavoor">
            <option value="perumbavoor">
              Perumbavoor
            </option>

            <option value="aluva">
              Aluva
            </option>

            <option value="kochi">
              Kochi
            </option>
          </select>
        </div>

        <div className="market-filter">
          <label>Period</label>

          <select defaultValue="7">
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

      </section>

      {/* PRICE SUMMARY */}
      <section className="market-summary">

        <div className="market-summary-card">
          <span>Minimum Price</span>
          <strong>₹20/kg</strong>
          <small>Lowest market price</small>
        </div>

        <div className="market-summary-card active">
          <span>Modal Price</span>
          <strong>₹29.8/kg</strong>
          <small>Average selling price</small>
        </div>

        <div className="market-summary-card">
          <span>Maximum Price</span>
          <strong>₹40/kg</strong>
          <small>Highest market price</small>
        </div>

        <div className="market-summary-card positive">
          <span>Weekly Change</span>
          <strong>+8.5%</strong>
          <small>Price increased this week</small>
        </div>

      </section>

      {/* PRICE CHART */}
      <div className="market-chart-section">
        <PriceChart />
      </div>

      {/* MARKET COMPARISON */}
      <section className="market-comparison">

        <div className="section-heading">
          <div>
            <span>NEARBY MARKETS</span>
            <h2>Compare Selling Prices</h2>
          </div>

          <button className="view-all-button">
            View all markets →
          </button>
        </div>

        <div className="market-table">

          <div className="market-table-header">
            <span>Market</span>
            <span>Distance</span>
            <span>Current Price</span>
            <span>Change</span>
          </div>

          <div className="market-table-row">
            <div>
              <strong>Perumbavoor Market</strong>
              <small>Recommended</small>
            </div>

            <span>2 km</span>

            <strong className="market-price">
              ₹32/kg
            </strong>

            <span className="price-positive">
              ▲ 6.7%
            </span>
          </div>

          <div className="market-table-row">
            <div>
              <strong>Aluva Market</strong>
              <small>Wholesale</small>
            </div>

            <span>5 km</span>

            <strong className="market-price">
              ₹31/kg
            </strong>

            <span className="price-positive">
              ▲ 4.2%
            </span>
          </div>

          <div className="market-table-row">
            <div>
              <strong>Kochi Market</strong>
              <small>Retail</small>
            </div>

            <span>12 km</span>

            <strong className="market-price">
              ₹30/kg
            </strong>

            <span className="price-neutral">
              — 1.1%
            </span>
          </div>

        </div>

      </section>

    </div>
  );
}