const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inhale Music API',
      version: '1.0.0',
      description: 'AI-powered music generation API using Lyria RealTime for breathing exercises and meditation',
      contact: {
        name: 'Inhale Team',
        email: 'support@inhale.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.inhale.app',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        MusicGenerationRequest: {
          type: 'object',
          required: ['mood'],
          properties: {
            mood: {
              type: 'string',
              enum: ['Anxiety Relief', 'Meditate', 'Wind Down', 'Focus'],
              description: 'Mood for music generation',
              example: 'Anxiety Relief'
            },
            bpm: {
              type: 'integer',
              minimum: 60,
              maximum: 200,
              description: 'Beats per minute',
              example: 80
            },
            instruments: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of instruments to include',
              example: ['Soft Pads', 'Ocean Waves']
            },
            breathingPattern: {
              type: 'object',
              properties: {
                inhale: { type: 'integer', example: 4 },
                hold1: { type: 'integer', example: 4 },
                exhale: { type: 'integer', example: 6 },
                hold2: { type: 'integer', example: 2 }
              },
              description: 'Breathing pattern for BPM calculation'
            },
            duration: {
              type: 'integer',
              minimum: 10,
              maximum: 300,
              description: 'Duration in seconds',
              example: 30
            }
          }
        },
        MusicGenerationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            sessionId: {
              type: 'string',
              format: 'uuid',
              example: 'ec82517c-0f72-43ea-82bb-fb5c618b7a33'
            },
            music: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'ec82517c-0f72-43ea-82bb-fb5c618b7a33' },
                name: { type: 'string', example: 'AI Generated - Anxiety Relief' },
                mood: { type: 'string', example: 'Anxiety Relief' },
                bpm: { type: 'integer', example: 80 },
                instruments: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Soft Pads', 'Ocean Waves']
                },
                duration: { type: 'integer', example: 30 },
                generated_at: { type: 'string', format: 'date-time' },
                is_lyria_generated: { type: 'boolean', example: true },
                prompts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: { type: 'string', example: 'Ambient' },
                      weight: { type: 'number', example: 1.0 }
                    }
                  }
                },
                config: {
                  type: 'object',
                  properties: {
                    bpm: { type: 'integer', example: 80 },
                    density: { type: 'number', example: 0.5 },
                    brightness: { type: 'number', example: 0.4 },
                    guidance: { type: 'number', example: 4.0 },
                    temperature: { type: 'number', example: 1.1 }
                  }
                },
                audio_file: {
                  type: 'object',
                  properties: {
                    filename: { type: 'string', example: 'lyria_uuid_1234567890.wav' },
                    duration: { type: 'integer', example: 30 },
                    sampleRate: { type: 'integer', example: 48000 },
                    size: { type: 'integer', example: 5760044 }
                  }
                }
              }
            }
          }
        },
        SessionStatus: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            session: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'ec82517c-0f72-43ea-82bb-fb5c618b7a33' },
                status: { type: 'string', enum: ['initializing', 'connected', 'stopped', 'error'], example: 'connected' },
                createdAt: { type: 'string', format: 'date-time' },
                audioChunksCount: { type: 'integer', example: 150 },
                params: { $ref: '#/components/schemas/MusicGenerationRequest' },
                prompts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: { type: 'string' },
                      weight: { type: 'number' }
                    }
                  }
                },
                config: {
                  type: 'object',
                  properties: {
                    bpm: { type: 'integer' },
                    density: { type: 'number' },
                    brightness: { type: 'number' },
                    guidance: { type: 'number' },
                    temperature: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Session not found' },
            details: { type: 'string', example: 'The requested session does not exist' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Music Generation',
        description: 'AI-powered music generation using Lyria RealTime'
      },
      {
        name: 'Session Management',
        description: 'Manage music generation sessions'
      },
      {
        name: 'Audio Streaming',
        description: 'Real-time audio streaming and file downloads'
      },
      {
        name: 'Health',
        description: 'API health and status checks'
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
