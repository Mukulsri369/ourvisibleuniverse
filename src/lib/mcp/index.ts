import { McpServer } from "@modelcontextprotocol/server";
import { CfWorkerJsonSchemaValidator } from "@modelcontextprotocol/server/validators/cf-worker";
import type { ToolContext } from "./tool";
import searchCatalog from "./tools/search-catalog";
import getCatalogEntry from "./tools/get-catalog-entry";
import listAccessPlans from "./tools/list-access-plans";
import getMyAccess from "./tools/get-my-access";

export function createUniverseMcpServer(context: ToolContext) {
  const server = new McpServer({ name: "stellar-journeys", title: "Stellar Journeys", version: "0.2.0" }, {
    instructions: "Search and read the OVU scientific catalog, view pass prices, and check only the signed-in user's access. Tools cannot grant access or make payments.",
    jsonSchemaValidator: new CfWorkerJsonSchemaValidator(),
  });
  for (const tool of [searchCatalog, getCatalogEntry, listAccessPlans, getMyAccess]) tool.register(server, context);
  return server;
}
