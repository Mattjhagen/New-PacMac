#!/usr/bin/env node

/**
 * Render MCP Server
 * A simple MCP server for interacting with Render API
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

class RenderMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'render-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.renderApiKey = process.env.RENDER_API_KEY;
    this.renderBaseUrl = 'https://api.render.com/v1';

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_services',
            description: 'Get all Render services',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_service',
            description: 'Get details of a specific service',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The service ID',
                },
              },
              required: ['serviceId'],
            },
          },
          {
            name: 'get_deployments',
            description: 'Get deployments for a service',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The service ID',
                },
              },
              required: ['serviceId'],
            },
          },
          {
            name: 'get_deployment_logs',
            description: 'Get logs for a specific deployment',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The service ID',
                },
                deploymentId: {
                  type: 'string',
                  description: 'The deployment ID',
                },
              },
              required: ['serviceId', 'deploymentId'],
            },
          },
          {
            name: 'trigger_deploy',
            description: 'Trigger a new deployment for a service',
            inputSchema: {
              type: 'object',
              properties: {
                serviceId: {
                  type: 'string',
                  description: 'The service ID',
                },
              },
              required: ['serviceId'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_services':
            return await this.getServices();
          case 'get_service':
            return await this.getService(args.serviceId);
          case 'get_deployments':
            return await this.getDeployments(args.serviceId);
          case 'get_deployment_logs':
            return await this.getDeploymentLogs(args.serviceId, args.deploymentId);
          case 'trigger_deploy':
            return await this.triggerDeploy(args.serviceId);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    if (!this.renderApiKey) {
      throw new Error('RENDER_API_KEY environment variable is required');
    }

    const url = `${this.renderBaseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.renderApiKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Render API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getServices() {
    const services = await this.makeRequest('/services');
    return {
      content: [
        {
          type: 'text',
          text: `Found ${services.length} services:\n\n${services.map(service => 
            `• ${service.name} (${service.id})\n  Type: ${service.type}\n  Status: ${service.serviceDetails?.buildCommand ? 'Web Service' : 'Other'}\n  URL: ${service.serviceDetails?.url || 'N/A'}\n`
          ).join('\n')}`,
        },
      ],
    };
  }

  async getService(serviceId) {
    const service = await this.makeRequest(`/services/${serviceId}`);
    return {
      content: [
        {
          type: 'text',
          text: `Service Details:\n\n` +
                `Name: ${service.name}\n` +
                `ID: ${service.id}\n` +
                `Type: ${service.type}\n` +
                `Status: ${service.serviceDetails?.buildCommand ? 'Web Service' : 'Other'}\n` +
                `URL: ${service.serviceDetails?.url || 'N/A'}\n` +
                `Build Command: ${service.serviceDetails?.buildCommand || 'N/A'}\n` +
                `Start Command: ${service.serviceDetails?.startCommand || 'N/A'}\n` +
                `Environment: ${service.serviceDetails?.env || 'N/A'}\n`,
        },
      ],
    };
  }

  async getDeployments(serviceId) {
    const deployments = await this.makeRequest(`/services/${serviceId}/deploys`);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${deployments.length} deployments:\n\n${deployments.map(deploy => 
            `• ${deploy.id}\n  Status: ${deploy.status}\n  Created: ${new Date(deploy.createdAt).toLocaleString()}\n  Commit: ${deploy.commit?.message || 'N/A'}\n`
          ).join('\n')}`,
        },
      ],
    };
  }

  async getDeploymentLogs(serviceId, deploymentId) {
    const logs = await this.makeRequest(`/services/${serviceId}/deploys/${deploymentId}/logs`);
    return {
      content: [
        {
          type: 'text',
          text: `Deployment Logs:\n\n${logs}`,
        },
      ],
    };
  }

  async triggerDeploy(serviceId) {
    const result = await this.makeRequest(`/services/${serviceId}/deploys`, 'POST');
    return {
      content: [
        {
          type: 'text',
          text: `Deployment triggered successfully!\n\nDeployment ID: ${result.id}\nStatus: ${result.status}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Render MCP server running on stdio');
  }
}

const server = new RenderMCPServer();
server.run().catch(console.error);
