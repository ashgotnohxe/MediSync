import { Link } from "react-router-dom";
import Button from "./common/Button";


export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: "72px", margin: "0 0 10px 0", color: "#0284c7" }}>404</h1>
      <h2 style={{ fontSize: "24px", margin: "0 0 16px 0", color: "#1e293b" }}>Page Not Found</h2>
      <p style={{ color: "#64748b", maxWidth: "450px", margin: "0 auto 24px auto" }}>
        The healthcare page or portal route you requested does not exist or has been moved.
      </p>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button variant="primary">← Return to Home Portal</Button>
      </Link>
    </div>
  );
}
