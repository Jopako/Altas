import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'ALTAS API',
      version: '1.0.0',
      description: 'Documentação da API ALTAS'
    },

    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local'
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },

    security: [
      {
        bearerAuth: []
      }
    ]
  },

  apis: [
    './routes/*.js'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
