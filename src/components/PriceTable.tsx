import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface PriceRow {
  crop: string;
  min: string;
  max: string;
  modal: string;
  change?: string;
}

interface PriceTableProps {
  data?: PriceRow[];
}

const defaultData: PriceRow[] = [
  {
    crop: "Onion",
    min: "₹20/kg",
    max: "₹40/kg",
    modal: "₹29.8/kg",
    change: "+8.5%",
  },
  {
    crop: "Tomato",
    min: "₹15/kg",
    max: "₹30/kg",
    modal: "₹25/kg",
    change: "+4.2%",
  },
  {
    crop: "Potato",
    min: "₹18/kg",
    max: "₹28/kg",
    modal: "₹22/kg",
    change: "-1.1%",
  },
  {
    crop: "Chilli",
    min: "₹80/kg",
    max: "₹150/kg",
    modal: "₹120/kg",
    change: "+6.4%",
  },
];

export default function PriceTable({
  data = defaultData,
}: PriceTableProps) {
  return (
    <section className="component-price-table">

      <div className="component-table-header">

        <div>
          <span>
            MARKET PRICES
          </span>

          <h2>
            Today's Crop Prices
          </h2>

          <p>
            Current market prices near your location.
          </p>
        </div>

        <span className="table-updated">
          Updated today
        </span>

      </div>

      <div className="component-table-scroll">

        <table>

          <thead>
            <tr>
              <th>Crop</th>
              <th>Minimum</th>
              <th>Modal</th>
              <th>Maximum</th>
              <th>Change</th>
            </tr>
          </thead>

          <tbody>

            {data.map((row) => {

              const positive =
                row.change?.startsWith("+");

              return (
                <tr key={row.crop}>

                  <td>
                    <strong>
                      {row.crop}
                    </strong>
                  </td>

                  <td>
                    {row.min}
                  </td>

                  <td>
                    <strong className="modal-price">
                      {row.modal}
                    </strong>
                  </td>

                  <td>
                    {row.max}
                  </td>

                  <td>
                    <span
                      className={
                        positive
                          ? "table-change positive"
                          : "table-change negative"
                      }
                    >
                      {positive ? (
                        <TrendingUp size={13} />
                      ) : (
                        <TrendingDown size={13} />
                      )}

                      {row.change}
                    </span>
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </section>
  );
}