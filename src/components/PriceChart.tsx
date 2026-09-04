import { useState } from "react";

type PricePoint = {
  day: string;
  date: string;
  price: number;
};

const priceData: PricePoint[] = [
  {
    day: "Mon",
    date: "Aug 25",
    price: 24,
  },
  {
    day: "Tue",
    date: "Aug 26",
    price: 26,
  },
  {
    day: "Wed",
    date: "Aug 27",
    price: 25,
  },
  {
    day: "Thu",
    date: "Aug 28",
    price: 28,
  },
  {
    day: "Fri",
    date: "Aug 29",
    price: 27,
  },
  {
    day: "Sat",
    date: "Aug 30",
    price: 30,
  },
  {
    day: "Sun",
    date: "Aug 31",
    price: 29.8,
  },
];

export default function PriceChart() {
  const [activePoint, setActivePoint] =
    useState<number | null>(null);

  const width = 1000;
  const height = 390;

  const padding = {
    left: 70,
    right: 35,
    top: 35,
    bottom: 60,
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const minPrice = 20;
  const maxPrice = 32;

  const getX = (index: number) =>
    padding.left +
    (index / (priceData.length - 1)) *
      chartWidth;

  const getY = (price: number) =>
    padding.top +
    ((maxPrice - price) /
      (maxPrice - minPrice)) *
      chartHeight;

  const linePoints = priceData
    .map(
      (item, index) =>
        `${getX(index)},${getY(item.price)}`
    )
    .join(" ");

  const areaPoints = `
    ${padding.left},${height - padding.bottom}
    ${linePoints}
    ${getX(priceData.length - 1)},${height - padding.bottom}
  `;

  const yValues = [
    20,
    22,
    24,
    26,
    28,
    30,
    32,
  ];

  return (
    <section className="price-chart-card">

      {/* CHART HEADER */}
      <div className="price-chart-header">

        <div>
          <span className="price-chart-label">
            7 DAY TREND
          </span>

          <h2>
            Onion Market Price
          </h2>

          <p>
            Average modal price per kilogram
          </p>
        </div>

        <div className="price-current">

          <span>
            Current modal price
          </span>

          <strong>
            ₹29.8/kg
          </strong>

          <div>
            <b>▲ 8.5%</b>
            <small>
              vs last week
            </small>
          </div>

        </div>

      </div>

      {/* CHART */}
      <div className="chart-wrapper">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="price-chart-svg"
        >

          <defs>

            <linearGradient
              id="chartGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#138a4b"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#138a4b"
                stopOpacity="0"
              />
            </linearGradient>

          </defs>

          {/* GRID */}
          {yValues.map((value) => {
            const y = getY(value);

            return (
              <g key={value}>

                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="chart-grid-line"
                />

                <text
                  x={padding.left - 15}
                  y={y + 5}
                  textAnchor="end"
                  className="chart-axis-label"
                >
                  ₹{value}
                </text>

              </g>
            );
          })}

          {/* AREA */}
          <polygon
            points={areaPoints}
            fill="url(#chartGradient)"
          />

          {/* LINE */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#138a4b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* POINTS */}
          {priceData.map((item, index) => {

            const x = getX(index);
            const y = getY(item.price);

            const active =
              activePoint === index;

            return (
              <g
                key={item.day}
                className="chart-point-group"
                onMouseEnter={() =>
                  setActivePoint(index)
                }
                onMouseLeave={() =>
                  setActivePoint(null)
                }
              >

                {/* Invisible hit area */}
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill="transparent"
                />

                {/* Active ring */}
                {active && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    className="chart-active-ring"
                  />
                )}

                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 7 : 6}
                  className="chart-point"
                />

                {/* Tooltip */}
                {active && (
                  <g>

                    <rect
                      x={x - 58}
                      y={y - 65}
                      width="116"
                      height="48"
                      rx="9"
                      className="chart-tooltip"
                    />

                    <text
                      x={x}
                      y={y - 43}
                      textAnchor="middle"
                      className="chart-tooltip-price"
                    >
                      ₹{item.price.toFixed(1)}/kg
                    </text>

                    <text
                      x={x}
                      y={y - 27}
                      textAnchor="middle"
                      className="chart-tooltip-date"
                    >
                      {item.date}
                    </text>

                  </g>
                )}

                {/* DAY */}
                <text
                  x={x}
                  y={height - 32}
                  textAnchor="middle"
                  className="chart-day"
                >
                  {item.day}
                </text>

              </g>
            );
          })}

        </svg>

      </div>

      {/* FOOTER */}
      <div className="price-chart-footer">

        <div className="chart-legend">
          <span className="legend-dot" />

          <span>
            Modal price
          </span>
        </div>

        <span>
          Data updated today
        </span>

      </div>

    </section>
  );
}