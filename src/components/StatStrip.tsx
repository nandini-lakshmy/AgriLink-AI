interface Stat {
  value: string;
  label: string;
  icon?: string;
}

interface StatStripProps {
  stats?: Stat[];
}

const defaultStats: Stat[] = [
  {
    value: "10K+",
    label: "Farmers",
  },
  {
    value: "5K+",
    label: "Buyers",
  },
  {
    value: "2K+",
    label: "Transactions",
  },
  {
    value: "50+",
    label: "Markets",
  },
];

export default function StatStrip({
  stats = defaultStats,
}: StatStripProps) {
  return (
    <section className="component-stat-strip">

      {stats.map((stat, index) => (

        <div
          className="component-stat-item"
          key={`${stat.label}-${index}`}
        >

          {stat.icon && (
            <span className="component-stat-icon">
              {stat.icon}
            </span>
          )}

          <strong>
            {stat.value}
          </strong>

          <span>
            {stat.label}
          </span>

        </div>

      ))}

    </section>
  );
}