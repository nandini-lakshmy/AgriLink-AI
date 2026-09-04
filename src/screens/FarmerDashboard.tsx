import {
  LayoutDashboard,
  ClipboardList,
  Store,
  MessageCircle,
  UserRound,
  LogOut,
  Plus,
  Bell,
  MapPin,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import onion from "../assets/onion.png";
import tomato from "../assets/tomato.png";

export default function FarmerDashboard() {
  const navigate = useNavigate();

  const farmerName =
    localStorage.getItem("farmerName") || "Ramesh";

  const menu = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/farmer/dashboard",
    },
    {
      label: "My Listings",
      icon: ClipboardList,
      path: "/farmer/listings",
    },
    {
      label: "Sell New Crop",
      icon: Plus,
      path: "/farmer/listing/new",
    },
    {
      label: "Nearby Buyers",
      icon: Store,
      path: "/farmer/buyers",
    },
    {
      label: "Market Prices",
      icon: Store,
      path: "/farmer/market",
    },
    {
      label: "Messages",
      icon: MessageCircle,
      path: "/farmer/messages",
    },
    {
      label: "Profile",
      icon: UserRound,
      path: "/farmer/profile",
    },
  ];

  return (
    <div className="desktop-dashboard">

      {/* SIDEBAR */}
      <aside className="desktop-sidebar">

        <button
          className="sidebar-logo"
          onClick={() => navigate("/farmer/dashboard")}
        >
          <span>🌿</span>
          <strong>
            AgriLink <em>AI</em>
          </strong>
        </button>


        <div className="sidebar-user">

          <div className="sidebar-avatar">
            {farmerName.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{farmerName}</strong>
            <span>Farmer</span>
          </div>

        </div>


        <nav className="sidebar-menu">

          {menu.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={
                  item.path === "/farmer/dashboard"
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


      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back, {farmerName} 👋
            </p>
          </div>

          <div className="dashboard-header-actions">

            <button className="notification-button">
              <Bell size={21} />
              <span />
            </button>

            <div className="header-profile">
              <div className="header-avatar">
                {farmerName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{farmerName}</strong>
                <small>Perumbavoor, Kerala</small>
              </div>
            </div>

          </div>

        </header>


        {/* LOCATION */}
        <div className="location-bar">
          <MapPin size={17} />
          <span>Perumbavoor, Kerala</span>
          <span className="location-status">
            Location active
          </span>
        </div>


        {/* OVERVIEW */}
        <section className="farmer-overview">

          <div className="overview-heading">
            <div>
              <span>MY OVERVIEW</span>
              <h2>Your marketplace activity</h2>
            </div>

            <button
              onClick={() =>
                navigate("/farmer/listings")
              }
            >
              View all activity
              <ChevronRight size={17} />
            </button>
          </div>


          <div className="overview-cards">

            <div className="overview-stat">
              <span>My Listings</span>
              <strong>3</strong>
              <small>+1 this week</small>
            </div>

            <div className="overview-stat">
              <span>Offers Received</span>
              <strong>8</strong>
              <small>3 new offers</small>
            </div>

            <div className="overview-stat highlight">
              <span>Best Offer</span>
              <strong>₹32/kg</strong>
              <small>↑ 8.5% market price</small>
            </div>

            <div className="overview-stat">
              <span>Nearby Buyers</span>
              <strong>12</strong>
              <small>Within 15 km</small>
            </div>

          </div>

        </section>


        {/* LISTINGS */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>My Listings</h2>
              <p>Your currently available crops</p>
            </div>

            <button
              onClick={() =>
                navigate("/farmer/listings")
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
              <span>Posted</span>
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
                  <small>Fresh harvest</small>
                </div>

              </div>

              <span>1000 kg</span>
              <span>2 hours ago</span>

              <b className="offer-badge">
                5 Offers
              </b>

              <button
                onClick={() =>
                  navigate("/farmer/offers")
                }
              >
                View Offers
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
                  <small>Fresh harvest</small>
                </div>

              </div>

              <span>500 kg</span>
              <span>1 day ago</span>

              <b className="offer-badge">
                3 Offers
              </b>

              <button
                onClick={() =>
                  navigate("/farmer/offers")
                }
              >
                View Offers
                <ChevronRight size={15} />
              </button>

            </div>

          </div>

        </section>


        {/* QUICK ACTIONS */}
        <section className="quick-actions">

          <button
            onClick={() =>
              navigate("/farmer/listing/new")
            }
          >
            <div className="quick-icon">
              <Plus size={22} />
            </div>

            <div>
              <strong>Sell a New Crop</strong>
              <span>
                Create a new crop listing
              </span>
            </div>

            <ChevronRight size={18} />
          </button>


          <button
            onClick={() =>
              navigate("/farmer/buyers")
            }
          >
            <div className="quick-icon">
              <Store size={22} />
            </div>

            <div>
              <strong>Find Nearby Buyers</strong>
              <span>
                Compare buyers and prices
              </span>
            </div>

            <ChevronRight size={18} />
          </button>


          <button
            onClick={() =>
              navigate("/farmer/market")
            }
          >
            <div className="quick-icon">
              <ClipboardList size={22} />
            </div>

            <div>
              <strong>Check Market Prices</strong>
              <span>
                View current market intelligence
              </span>
            </div>

            <ChevronRight size={18} />
          </button>

        </section>

      </main>

    </div>
  );
}