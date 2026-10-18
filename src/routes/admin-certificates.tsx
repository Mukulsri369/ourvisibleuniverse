import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { CertificateAdminDashboard } from "@/components/academy/CertificateAdminDashboard";

export const Route = createFileRoute("/admin-certificates")({
  head: () => ({
    meta: [
      { title: "Academy Certificate Administration — Our Visible Universe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCertificatesPage,
});

function AdminCertificatesPage() {
  return (
    <PublicLayout>
      <main className="min-h-screen pt-24 pb-16">
        <CertificateAdminDashboard />
      </main>
    </PublicLayout>
  );
}
