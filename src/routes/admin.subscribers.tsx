import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SubscriptionAdmin } from "@/components/admin/SubscriptionAdmin";
export const Route = createFileRoute("/admin/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — Our Visible Universe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <PublicLayout>
      <SubscriptionAdmin />
    </PublicLayout>
  ),
});
