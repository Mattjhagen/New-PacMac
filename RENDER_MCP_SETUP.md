# 🚀 Render MCP Server Setup Guide

## 📋 **What is the Render MCP Server?**

The Render MCP Server allows you to interact with your Render deployments directly from your development environment through the Model Context Protocol (MCP). You can:

- ✅ **Monitor deployments** in real-time
- ✅ **View build logs** and status
- ✅ **Trigger new deployments**
- ✅ **Check service status**
- ✅ **Get deployment history**

## 🔧 **Setup Instructions**

### **Step 1: Get Your Render API Key**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your profile** → **Account Settings**
3. **Go to "API Keys"** section
4. **Click "Create API Key"**
5. **Copy the API key** (starts with `rnd_`)

### **Step 2: Configure MCP Server**

1. **Update the MCP configuration**:
   ```bash
   # Edit your MCP config file
   nano ~/.cursor/mcp.json
   ```

2. **Replace the API key**:
   ```json
   {
     "servers": {
       "github": {
         "url": "https://api.githubcopilot.com/mcp/"
       },
       "render": {
         "command": "node",
         "args": ["/Users/matty/Desktop/New-PacMac/render-mcp-server.js"],
         "env": {
           "RENDER_API_KEY": "rnd_your_actual_api_key_here"
         }
       }
     }
   }
   ```

### **Step 3: Test the MCP Server**

1. **Test the server directly**:
   ```bash
   cd /Users/matty/Desktop/New-PacMac
   RENDER_API_KEY="your_api_key" node render-mcp-server.js
   ```

2. **Restart Cursor** to load the new MCP configuration

## 🛠️ **Available Tools**

### **1. Get All Services**
```bash
# Lists all your Render services
get_services
```

### **2. Get Service Details**
```bash
# Get detailed info about a specific service
get_service --serviceId "srv_abc123"
```

### **3. Get Deployments**
```bash
# List all deployments for a service
get_deployments --serviceId "srv_abc123"
```

### **4. Get Deployment Logs**
```bash
# View logs for a specific deployment
get_deployment_logs --serviceId "srv_abc123" --deploymentId "dpl_xyz789"
```

### **5. Trigger New Deployment**
```bash
# Trigger a new deployment
trigger_deploy --serviceId "srv_abc123"
```

## 🎯 **Usage Examples**

### **Monitor Your PacMac Mobile Deployment**

1. **Get your service ID**:
   ```bash
   get_services
   ```

2. **Check deployment status**:
   ```bash
   get_deployments --serviceId "your_service_id"
   ```

3. **View build logs**:
   ```bash
   get_deployment_logs --serviceId "your_service_id" --deploymentId "latest_deployment_id"
   ```

4. **Trigger a new deployment**:
   ```bash
   trigger_deploy --serviceId "your_service_id"
   ```

## 🔍 **Troubleshooting**

### **Common Issues:**

**"RENDER_API_KEY environment variable is required"**
- Make sure you've set the API key in the MCP config
- Restart Cursor after updating the config

**"Render API error: 401 Unauthorized"**
- Check that your API key is correct
- Ensure the API key has proper permissions

**"Unknown tool" error**
- Make sure the MCP server is running
- Check that Cursor has loaded the new configuration

### **Debug Commands:**

```bash
# Test API key directly
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.render.com/v1/services

# Check MCP server logs
RENDER_API_KEY="your_key" node render-mcp-server.js
```

## 📊 **API Key Permissions**

Your Render API key needs these permissions:
- ✅ **Read services** - View service details
- ✅ **Read deployments** - View deployment history
- ✅ **Read logs** - Access build and runtime logs
- ✅ **Write deployments** - Trigger new deployments

## 🎊 **You're Ready!**

Once configured, you can:

1. **Monitor deployments** in real-time
2. **Debug build issues** by viewing logs
3. **Trigger deployments** without leaving your editor
4. **Check service status** anytime

**Your Render MCP server is now ready to help you manage your PacMac Mobile deployment!** 🚀

## 📞 **Support**

- **Render API Docs**: https://render.com/docs/api
- **MCP Documentation**: https://modelcontextprotocol.io
- **Cursor MCP Guide**: https://cursor.sh/docs/mcp
