import { Bell, ArrowLeft, SlidersHorizontal } from "lucide-react";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  filter?: boolean;
}

function MobileHeader({
  title,
  subtitle,
  back = false,
  filter = false,
}: MobileHeaderProps) {
  return (
    <div className="mobile-header">

      <div className="mobile-header-left">

        {back && (
          <button className="mobile-icon-button">
            <ArrowLeft size={20} />
          </button>
        )}

        <div>
          <h2>{title}</h2>

          {subtitle && (
            <p>{subtitle}</p>
          )}
        </div>

      </div>

      <div className="mobile-header-actions">

        {filter && (
          <button className="mobile-icon-button">
            <SlidersHorizontal size={18} />
          </button>
        )}

        {!filter && (
          <button className="mobile-icon-button">
            <Bell size={20} />
          </button>
        )}

      </div>

    </div>
  );
}

export default MobileHeader;