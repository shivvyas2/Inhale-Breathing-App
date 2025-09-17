require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Import routes
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const musicRoutes = require('./routes/musicRoutes');
const streakRoutes = require('./routes/streakRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI
}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/swagger-ui', express.static('node_modules/swagger-ui-dist'));

// Serve Swagger YAML
app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.sendFile(path.join(__dirname, '../docs/swagger.yaml'));
});

// Simple & Modern Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: `
    /* Hide topbar */
    .swagger-ui .topbar { display: none !important; }
    
    /* Clean header */
    .swagger-ui .info { 
      margin: 0 0 40px 0 !important; 
      padding: 40px !important; 
      background: #ffffff !important; 
      border: 1px solid #e5e7eb !important;
      border-radius: 8px !important; 
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
    }
    
    .swagger-ui .info .title { 
      color: #111827 !important; 
      font-size: 2rem !important; 
      font-weight: 600 !important; 
      margin-bottom: 8px !important; 
    }
    
    .swagger-ui .info .description { 
      color: #6b7280 !important; 
      font-size: 1rem !important; 
      line-height: 1.5 !important; 
      margin-bottom: 16px !important; 
    }
    
    .swagger-ui .info .base-url { 
      background: #f9fafb !important; 
      color: #374151 !important; 
      padding: 8px 12px !important; 
      border-radius: 4px !important; 
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace !important; 
      font-size: 0.875rem !important; 
      border: 1px solid #e5e7eb !important; 
    }
    
    /* Simple operation blocks */
    .swagger-ui .opblock { 
      border: 1px solid #e5e7eb !important; 
      border-radius: 6px !important; 
      margin-bottom: 16px !important; 
      background: #ffffff !important;
      overflow: hidden !important; 
    }
    
    .swagger-ui .opblock.opblock-get { border-left: 3px solid #10b981 !important; }
    .swagger-ui .opblock.opblock-post { border-left: 3px solid #3b82f6 !important; }
    .swagger-ui .opblock.opblock-put { border-left: 3px solid #f59e0b !important; }
    .swagger-ui .opblock.opblock-delete { border-left: 3px solid #ef4444 !important; }
    
    /* Clean operation headers */
    .swagger-ui .opblock .opblock-summary { 
      padding: 16px 20px !important; 
      background: #ffffff !important; 
      border-bottom: 1px solid #f3f4f6 !important; 
    }
    
    .swagger-ui .opblock .opblock-summary-description { 
      color: #6b7280 !important; 
      font-size: 0.875rem !important; 
      margin-top: 4px !important; 
    }
    
    /* Simple method badges */
    .swagger-ui .opblock .opblock-summary-method { 
      font-size: 0.75rem !important; 
      font-weight: 600 !important; 
      padding: 4px 8px !important; 
      border-radius: 4px !important; 
      text-transform: uppercase !important; 
      letter-spacing: 0.025em !important; 
      min-width: 50px !important; 
      text-align: center !important; 
    }
    
    .swagger-ui .opblock.opblock-get .opblock-summary-method { 
      background: #d1fae5 !important; 
      color: #065f46 !important; 
    }
    
    .swagger-ui .opblock.opblock-post .opblock-summary-method { 
      background: #dbeafe !important; 
      color: #1e40af !important; 
    }
    
    .swagger-ui .opblock.opblock-put .opblock-summary-method { 
      background: #fef3c7 !important; 
      color: #92400e !important; 
    }
    
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { 
      background: #fee2e2 !important; 
      color: #991b1b !important; 
    }
    
    /* Clean operation content */
    .swagger-ui .opblock .opblock-body { 
      padding: 20px !important; 
      background: #fafafa !important; 
    }
    
    /* Simple buttons */
    .swagger-ui .btn { 
      border-radius: 4px !important; 
      font-weight: 500 !important; 
      padding: 8px 16px !important; 
      font-size: 0.875rem !important;
      border: 1px solid transparent !important;
    }
    
    .swagger-ui .btn.execute { 
      background: #3b82f6 !important; 
      color: white !important; 
    }
    
    .swagger-ui .btn.execute:hover { 
      background: #2563eb !important; 
    }
    
    .swagger-ui .btn.try-out__btn { 
      background: #10b981 !important; 
      color: white !important; 
    }
    
    .swagger-ui .btn.try-out__btn:hover { 
      background: #059669 !important; 
    }
    
    /* Simple tags */
    .swagger-ui .opblock-tag { 
      border: 1px solid #e5e7eb !important; 
      background: #ffffff !important; 
      border-radius: 6px !important; 
      margin-bottom: 16px !important; 
      overflow: hidden !important; 
    }
    
    .swagger-ui .opblock-tag .opblock-tag-section { 
      padding: 16px 20px !important; 
      background: #f9fafb !important; 
      border-bottom: 1px solid #e5e7eb !important; 
    }
    
    .swagger-ui .opblock-tag .opblock-tag-section h3 { 
      color: #111827 !important; 
      font-size: 1.25rem !important; 
      font-weight: 600 !important; 
      margin: 0 !important; 
    }
    
    /* Clean input fields */
    .swagger-ui .parameter input[type="text"],
    .swagger-ui .parameter input[type="email"],
    .swagger-ui .parameter input[type="number"],
    .swagger-ui .parameter textarea { 
      border: 1px solid #d1d5db !important; 
      border-radius: 4px !important; 
      padding: 8px 12px !important; 
      font-size: 0.875rem !important; 
    }
    
    .swagger-ui .parameter input:focus,
    .swagger-ui .parameter textarea:focus { 
      border-color: #3b82f6 !important; 
      outline: none !important; 
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; 
    }
    
    /* Clean response sections */
    .swagger-ui .responses-inner { 
      background: #ffffff !important; 
      border-radius: 4px !important; 
      padding: 16px !important; 
      border: 1px solid #e5e7eb !important; 
    }
    
    /* Simple code blocks */
    .swagger-ui .highlight-code { 
      background: #f8fafc !important; 
      color: #374151 !important; 
      border-radius: 4px !important; 
      padding: 16px !important; 
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace !important; 
      font-size: 0.875rem !important; 
      line-height: 1.5 !important; 
      border: 1px solid #e5e7eb !important;
    }
    
    /* Clean typography */
    .swagger-ui .parameter__name { 
      font-weight: 500 !important; 
      color: #111827 !important; 
    }
    
    .swagger-ui .parameter__type { 
      color: #6b7280 !important; 
      font-weight: 400 !important; 
    }
    
    /* Status codes */
    .swagger-ui .response-col_status-200 { color: #10b981 !important; }
    .swagger-ui .response-col_status-201 { color: #10b981 !important; }
    .swagger-ui .response-col_status-400 { color: #ef4444 !important; }
    .swagger-ui .response-col_status-404 { color: #ef4444 !important; }
    .swagger-ui .response-col_status-500 { color: #ef4444 !important; }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
      .swagger-ui .info { padding: 24px !important; }
      .swagger-ui .info .title { font-size: 1.75rem !important; }
      .swagger-ui .opblock .opblock-summary { padding: 12px 16px !important; }
      .swagger-ui .opblock .opblock-body { padding: 16px !important; }
    }
  `,
  customSiteTitle: 'Inhale API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Inhale API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Inhale API Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
