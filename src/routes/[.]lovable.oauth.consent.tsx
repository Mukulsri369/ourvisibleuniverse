import { createFileRoute, redirect } from "@tanstack/react-router";
// Compatibility URL for existing OAuth clients; no vendor service is called.
export const Route = createFileRoute("/.lovable/oauth/consent")({
  beforeLoad: ({ location }) => { throw redirect({ href: `/oauth/consent${location.searchStr}`, replace: true }); },
});
