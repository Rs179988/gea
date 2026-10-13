import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { derivePhysicsConstants } from '../domain/physicsExtractor.js';
import { generateGodot4CharacterBody2D } from '../domain/godotGenerator.js';
import { generatePlayableHtmlCanvas } from '../domain/webCanvasGenerator.js';

export function runMcpServer() {
  const server = new Server(
    {
      name: 'gea-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'infer_physics_invariants',
          description: 'Calculates exact kinematic constants (gravity, jump velocity, acceleration, friction) from jump height and time to apex.',
          inputSchema: {
            type: 'object',
            properties: {
              jumpHeightPixels: { type: 'number', description: 'Peak jump height in pixels (e.g. 120)' },
              timeToApexSeconds: { type: 'number', description: 'Seconds to reach apex (e.g. 0.35)' },
              horizontalSpeedPixelsPerSec: { type: 'number', description: 'Max horizontal run speed (e.g. 300)' },
            },
            required: ['jumpHeightPixels', 'timeToApexSeconds'],
          },
        },
        {
          name: 'synthesize_godot_controller',
          description: 'Synthesizes clean-room Godot 4 CharacterBody2D GDScript with variable jumping, coyote time, and buffering.',
          inputSchema: {
            type: 'object',
            properties: {
              jumpHeightPixels: { type: 'number' },
              timeToApexSeconds: { type: 'number' },
              horizontalSpeedPixelsPerSec: { type: 'number' },
            },
            required: ['jumpHeightPixels', 'timeToApexSeconds'],
          },
        },
        {
          name: 'synthesize_web_prototype',
          description: 'Generates a standalone, playable single-file HTML5 Canvas platformer prototype matching exact kinematics.',
          inputSchema: {
            type: 'object',
            properties: {
              jumpHeightPixels: { type: 'number' },
              timeToApexSeconds: { type: 'number' },
              horizontalSpeedPixelsPerSec: { type: 'number' },
            },
            required: ['jumpHeightPixels', 'timeToApexSeconds'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const height = (args?.jumpHeightPixels as number) || 120;
    const timeToApex = (args?.timeToApexSeconds as number) || 0.35;
    const speed = (args?.horizontalSpeedPixelsPerSec as number) || 300;

    const physics = derivePhysicsConstants({
      jumpHeightPixels: height,
      timeToApexSeconds: timeToApex,
      horizontalSpeedPixelsPerSec: speed,
    });

    switch (name) {
      case 'infer_physics_invariants':
        return { content: [{ type: 'text', text: JSON.stringify(physics, null, 2) }] };

      case 'synthesize_godot_controller':
        return { content: [{ type: 'text', text: generateGodot4CharacterBody2D(physics) }] };

      case 'synthesize_web_prototype':
        return { content: [{ type: 'text', text: generatePlayableHtmlCanvas(physics) }] };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  server.connect(transport);
}
