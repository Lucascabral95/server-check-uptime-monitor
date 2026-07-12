import Link from "next/link";
import { LuActivity } from "react-icons/lu";

import "./AuthLogo.scss";

const ENDPOINT_INDEX = "/dashboard/home";

export function AuthLogo() {
  return (
    <Link href={ENDPOINT_INDEX} className="auth-logo">
      <div className="logo-container">
        <div className="logo-icon-badge">
          <LuActivity className="logo-icon" />
        </div>
        <div className="logo-text">
          <span className="logo-name">Server Check</span>
        </div>
        <div className="status-indicator">
          <span className="status-dot"></span>
        </div>
      </div>
    </Link>
  );
}
