import Link from "next/link";

const ENDPOINT_INDEX = "/dashboard/home";

export function AuthLogo() {
  return (
    <Link href={ENDPOINT_INDEX} className="auth-logo">
      <div className="logo-container">
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
