import { Sprout } from "lucide-react";

interface LogoProps {
  light?: boolean;
}

function Logo({ light = false }: LogoProps) {
  return (
    <div className={`logo ${light ? "logo-light" : ""}`}>
      <div className="logo-icon">
        <Sprout size={25} strokeWidth={2.2} />
      </div>

      <span className="logo-name">
        AgriLink <span>AI</span>
      </span>
    </div>
  );
}

export default Logo;