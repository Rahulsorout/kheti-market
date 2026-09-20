import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from"swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KhetiMarket API Documentation",
      version: "1.0.0",
      description: "API documentation for the KhetiMarket platform",
    },
    servers: [{ url: "http://localhost:5000" }],
  },

  apis: ["./src/routes/*.js"], // auto-documents routes
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
