# AI GitHub Interface - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Access to your GitHub MCP server
- GitHub personal access token

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**Configure `.env` file:**
```env
PORT=3001
MCP_SERVER_URL=https://github-mcp-remote.metamike.workers.dev/sse
MCP_ACCESS_TOKEN=your_access_token_from_oauth_flow
```

**Start the backend:**
```bash
npm run dev
```

### 2. Frontend Setup

Open `frontend/index.html` in a web browser, or serve it with a simple HTTP server:

```bash
cd frontend
python -m http.server 8000
# Open http://localhost:8000
```

## 🌐 Production Deployment

### Backend Deployment Options

#### Option 1: Railway
1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically from GitHub

#### Option 2: Render
1. Create account at [render.com](https://render.com)
2. Create new Web Service from GitHub repo
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables

#### Option 3: Heroku
```bash
# Install Heroku CLI
cd backend
heroku create your-app-name
heroku config:set MCP_SERVER_URL=https://github-mcp-remote.metamike.workers.dev/sse
heroku config:set MCP_ACCESS_TOKEN=your_token
git push heroku main
```

### Frontend Deployment

#### Option 1: Netlify
1. Drag and drop the `frontend` folder to [netlify.com](https://netlify.com)
2. Update the API URL in `index.html` to point to your deployed backend

#### Option 2: Vercel
```bash
cd frontend
npx vercel --prod
```

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MCP_SERVER_URL=https://github-mcp-remote.metamike.workers.dev/sse
      - MCP_ACCESS_TOKEN=${MCP_ACCESS_TOKEN}
  
  frontend:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 3001) |
| `MCP_SERVER_URL` | Your MCP server endpoint | Yes |
| `MCP_ACCESS_TOKEN` | OAuth access token | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### Frontend Configuration

Update the API URL in `frontend/index.html`:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## 🔒 Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Rate Limiting**: Configure appropriate rate limits
3. **CORS**: Restrict CORS to your frontend domain
4. **Environment Variables**: Never commit secrets to Git
5. **Token Security**: Rotate access tokens regularly

## 🧪 Testing

### Backend API Tests
```bash
cd backend
# Test health endpoint
curl http://localhost:3001/api/health

# Test tools endpoint
curl http://localhost:3001/api/tools
```

### Frontend Testing
1. Open the frontend in a browser
2. Check browser console for errors
3. Test chat functionality
4. Verify connection status

## 📊 Monitoring

### Health Checks
- Backend: `GET /api/health`
- MCP Connection: Included in health response

### Logging
- Server logs include MCP connection status
- All API requests are logged with Morgan
- WebSocket connections are tracked

## 🔧 Troubleshooting

### Common Issues

1. **MCP Connection Failed**
   - Verify MCP_SERVER_URL is correct
   - Check access token validity
   - Ensure MCP server is running

2. **CORS Issues**
   - Update CORS configuration in backend
   - Check frontend URL matches CORS settings

3. **Frontend Can't Connect**
   - Verify API_BASE_URL in frontend
   - Check backend is running and accessible
   - Inspect browser network tab for errors

### Debug Mode
Set `NODE_ENV=development` for verbose logging

## 📈 Scaling

### Horizontal Scaling
- Deploy multiple backend instances
- Use load balancer (nginx, HAProxy)
- Implement session management if needed

### Performance Optimization
- Enable gzip compression
- Use CDN for frontend assets
- Implement response caching
- Add database for persistent storage

## 🚦 Health Monitoring

### Uptime Monitoring
- Use services like UptimeRobot or Pingdom
- Monitor both `/api/health` and frontend

### Application Monitoring
- Consider APM tools (New Relic, DataDog)
- Monitor MCP connection stability
- Track API response times