import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Users,
  Map,
  Store,
  TrendingUp,
  MessageCircle,
  UserRound,
  LogOut,
  FileText,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  role?: "farmer" | "buyer";
  name?: string;
  location?: string;
}

export default function DashboardSidebar({
  role = "farmer",
  name = "Ramesh",
  location = "Perumbavoor, Kerala",
}: DashboardSidebarProps) {

  const navigate = useNavigate();
  const currentLocation = useLocation();

  const farmerItems = [
    {
      label: "Dashboard",
      path: "/farmer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Listings",
      path: "/farmer/listings",
      icon: ClipboardList,
    },
    {
      label: "Sell New Crop",
      path: "/farmer/listing/new",
      icon: PlusCircle,
    },
    {
      label: "Offers",
      path: "/farmer/offers",
      icon: FileText,
    },
    {
      label: "Nearby Buyers",
      path: "/farmer/buyers",
      icon: Users,
    },
    {
      label: "Map",
      path: "/farmer/map",
      icon: Map,
    },
    {
      label: "Market Intelligence",
      path: "/farmer/market",
      icon: Store,
    },
    {
      label: "Crop Demand",
      path: "/farmer/demand",
      icon: TrendingUp,
    },
    {
      label: "Messages",
      path: "/farmer/messages",
      icon: MessageCircle,
    },
    {
      label: "Profile",
      path: "/farmer/profile",
      icon: UserRound,
    },
  ];

  const buyerItems = [
    {
      label: "Dashboard",
      path: "/buyer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Post Demand",
      path: "/buyer/demand/new",
      icon: PlusCircle,
    },
    {
      label: "My Demands",
      path: "/buyer/demands",
      icon: ClipboardList,
    },
    {
      label: "Farmer Listings",
      path: "/buyer/listings",
      icon: FileText,
    },
    {
      label: "My Bids",
      path: "/buyer/bids",
      icon: TrendingUp,
    },
    {
      label: "Matching Farmers",
      path: "/buyer/farmers",
      icon: Users,
    },
    {
      label: "Messages",
      path: "/buyer/messages",
      icon: MessageCircle,
    },
    {
      label: "Profile",
      path: "/buyer/profile",
      icon: UserRound,
    },
  ];

  const items =
    role === "farmer"
      ? farmerItems
      : buyerItems;

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="component-dashboard-sidebar">

      <button
        type="button"
        className="component-sidebar-logo"
        onClick={() => navigate("/")}
      >
        <span>🌿</span>

        <strong>
          AgriLink <em>AI</em>
        </strong>
      </button>

      <div className="component-sidebar-user">

        <div className="component-sidebar-avatar">
          {name.charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>{name}</strong>

          <span>
            {location}
          </span>

          <small>
            {role === "farmer"
              ? "Farmer"
              : "Buyer"}
          </small>
        </div>

      </div>

      <nav className="component-sidebar-nav">

        <span className="component-sidebar-label">
          MENU
        </span>

        {items.map((item) => {

          const Icon = item.icon;

          const active =
            currentLocation.pathname ===
            item.path;

          return (
            <button
              type="button"
              key={item.path}
              className={
                active
                  ? "component-sidebar-item active"
                  : "component-sidebar-item"
              }
              onClick={() =>
                navigate(item.path)
              }
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}

      </nav>

      <div className="component-sidebar-bottom">

        <button
          type="button"
          className="component-sidebar-item logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}