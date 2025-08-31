import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My App API",
      version: "1.0.0",
      description: "API docs cho ứng dụng review game 🚀",
    },
    servers: [
      {
        url: "http://localhost:8000", // URL base API
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // format token
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routers/*.js"], // nơi chứa mô tả API (JSDoc comments)
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
