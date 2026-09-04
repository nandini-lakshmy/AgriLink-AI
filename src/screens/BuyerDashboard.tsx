import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  MessageCircle,
  UserRound,
  LogOut,
  Store,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import onion from "../assets/onion.png";
import tomato from "../assets/tomato.png";

export default function BuyerDashboard() {
  const navigate = useNavigate();

  const companyName =
    localStorage.getItem("buyerCompany") ||
    "ABC Traders";

  const menu = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/buyer/dashboard",
    },
    {
      label: "Post Demand",
      icon: PlusCircle,
      path: "/buyer/demand/new",
    },
    {
      label: "My Demands",
      icon: ClipboardList,
      path: "/buyer/demands",
    },
    {
      label: "Received Listings",
      icon: Store,
      path: "/buyer/listings",
    },
    {
      label: "Messages",
      icon: MessageCircle,
      path: "/buyer/messages",
    },
    {
      label: "Profile",
      icon: UserRound,
      path: "/buyer/profile",
    },
  ];

  return (
    <div className="desktop-dashboard">

      {/* SIDEBAR */}
      <aside className="desktop-sidebar">

        <button
          className="sidebar-logo"
          onClick={() => navigate("/buyer/dashboard")}
        >
          <span>🌿</span>

          <strong>
            AgriLink <em>AI</em>
          </strong>
        </button>


        <div className="sidebar-user">

          <div className="sidebar-avatar">
            AT
          </div>

          <div>
            <strong>{companyName}</strong>
            <span>Buyer · Perumbavoor</span>
          </div>

        </div>


        <nav className="sidebar-menu">

          {menu.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={
                  item.path === "/buyer/dashboard"
                    ? "sidebar-menu-item active"
                    : "sidebar-menu-item"
                }
                onClick={() => navigate(item.path)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );

          })}

        </nav>


        <button
          className="sidebar-logout"
          onClick={() => navigate("/")}
        >
          <LogOut size={19} />
          Logout
        </button>

      </aside>


      {/* MAIN */}
      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>
            <p>
              Manage your crop requirements and
              connect with farmers.
            </p>
          </div>

          <div className="header-profile">

            <div className="header-avatar">
              AT
            </div>

            <div>
              <strong>{companyName}</strong>
              <small>Perumbavoor · Buyer</small>
            </div>

          </div>

        </header>


        {/* STATS */}
        <section className="overview-cards buyer-overview">

          <div className="overview-stat">
            <span>Active Demands</span>
            <strong>5</strong>
            <small>2 need attention</small>
          </div>

          <div className="overview-stat">
            <span>Listings Received</span>
            <strong>12</strong>
            <small>4 new today</small>
          </div>

          <div className="overview-stat">
            <span>Deals Closed</span>
            <strong>3</strong>
            <small>This month</small>
          </div>

          <div className="overview-stat highlight">
            <span>Average Savings</span>
            <strong>₹4.2/kg</strong>
            <small>Compared to market</small>
          </div>

        </section>


        {/* ACTIVE DEMANDS */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>My Active Demands</h2>
              <p>
                Your current crop requirements
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/buyer/demands")
              }
            >
              View All
              <ChevronRight size={16} />
            </button>

          </div>


          <div className="listing-table">

            <div className="listing-table-header">
              <span>Crop</span>
              <span>Quantity</span>
              <span>Offer Price</span>
              <span>Offers</span>
              <span />
            </div>


            <div className="listing-row">

              <div className="crop-cell">

                <img
                  src={onion}
                  alt="Onion"
                />

                <div>
                  <strong>Onion</strong>
                  <small>Fresh quality required</small>
                </div>

              </div>

              <span>1000 kg</span>

              <strong>₹32/kg</strong>

              <b className="offer-badge">
                5 Offers
              </b>

              <button
                onClick={() =>
                  navigate("/buyer/listings")
                }
              >
                View
                <ChevronRight size={15} />
              </button>

            </div>


            <div className="listing-row">

              <div className="crop-cell">

                <img
                  src={tomato}
                  alt="Tomato"
                />

                <div>
                  <strong>Tomato</strong>
                  <small>Grade A preferred</small>
                </div>

              </div>

              <span>500 kg</span>

              <strong>₹25/kg</strong>

              <b className="offer-badge">
                3 Offers
              </b>

              <button
                onClick={() =>
                  navigate("/buyer/listings")
                }
              >
                View
                <ChevronRight size={15} />
              </button>

            </div>

          </div>

        </section>


        {/* RECENT LISTINGS */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Recent Farmer Listings</h2>
              <p>
                Fresh crops available nearby
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/buyer/listings")
              }
            >
              View All
              <ChevronRight size={16} />
            </button>

          </div>


          <div className="recent-farmer-card">

            <div className="farmer-avatar">
              R
            </div>

            <div>
              <strong>Ramesh</strong>
              <span>Perumbavoor · 2 km away</span>
            </div>

            <strong>Onion</strong>

            <span>1000 kg</span>

            <strong>₹32/kg</strong>

            <button
              onClick={() =>
                navigate("/buyer/listings")
              }
            >
              Make Offer
            </button>

          </div>

        </section>


        {/* POST DEMAND */}
        <button
          className="large-action-button"
          onClick={() =>
            navigate("/buyer/demand/new")
          }
        >
          <PlusCircle size={22} />
          Post a New Crop Requirement
        </button>

      </main>

    </div>
  );
}