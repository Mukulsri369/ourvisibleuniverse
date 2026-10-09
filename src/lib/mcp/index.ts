import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchCatalog from "./tools/search-catalog";
import getCatalogEntry from "./tools/get-catalog-entry";
import listAccessPlans from "./tools/list-access-plans";
import getMyAccess from "./tools/get-my-access";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "stellar-journeys",
  title: "Stellar Journeys",
  version: "0.1.0",
  instructions: "Tools for Our Visible Universe: search and read the scientific catalog of stars, galaxies and exotic objects, view access pass prices, and check the signed-in user's pass status.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: true,
  }),
  tools: [searchCatalog, getCatalogEntry, listAccessPlans, getMyAccess],
});
