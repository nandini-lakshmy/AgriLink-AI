import {
  House,
  ClipboardList,
  Store,
  MessageCircle,
  UserRound,
} from "lucide-react";

interface MobileBottomNavProps {
  active?: string;
}

function MobileBottomNav({
  active = "home",
}: MobileBottomNavProps) {

  const items = [
    {
      id: "home",
      label: "Home",
      icon: House,
    },
    {
      id: "listings",
      label: "Listings",
      icon: ClipboardList,
    },
    {
      id: "market",
      label: "Market",
      icon: Store,
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
    },
    {
      id: "profile",
      label: "Profile",
      icon: UserRound,
    },
  ];

  return (
    <nav className="mobile-bottom-nav">

      {items.map((item) => {

        const Icon = item.icon;

        return (
          <button
            key={item.id}
            className={
              active === item.id
                ? "bottom-nav-item active"
                : "bottom-nav-item"
            }
          >

            <Icon size={18} />

            <span>
              {item.label}
            </span>

          </button>
        );
      })}

    </nav>
  );
}

export default MobileBottomNav;