import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSubscriptionAdminStatus } from "@/lib/subscription-admin.functions";
export function AdminAccessLink() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let alive = true;
    getSubscriptionAdminStatus()
      .then((r) => {
        if (alive) setShow(r.isAdmin || r.setupRequired);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return show ? (
    <Link
      to="/admin/subscribers"
      className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-4 text-sm text-white hover:bg-white/10"
    >
      Manage subscribers
    </Link>
  ) : null;
}
