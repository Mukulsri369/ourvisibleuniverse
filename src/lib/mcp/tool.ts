import { McpServer, type CallToolResult, type ToolAnnotations } from "@modelcontextprotocol/server";
import { z } from "zod";

export type ToolContext = { getToken(): string; getUserId(): string; isAuthenticated(): boolean };
export class ToolError extends Error {}

/** The official SDK owns protocol validation; tool data and business rules stay local. */
export function defineTool<S extends z.ZodRawShape>(definition: {
  name: string; title: string; description: string; inputSchema: S; annotations: ToolAnnotations;
  handler(input: z.output<z.ZodObject<S>>, context: ToolContext): CallToolResult | Promise<CallToolResult>;
}) {
  return { ...definition, register(server: McpServer, context: ToolContext) {
    server.registerTool(definition.name, {
      title: definition.title, description: definition.description,
      inputSchema: z.object(definition.inputSchema), annotations: definition.annotations,
    }, async (input) => definition.handler(input as z.output<z.ZodObject<S>>, context));
  } };
}
