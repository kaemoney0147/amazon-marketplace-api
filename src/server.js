import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose, { Mongoose } from "mongoose";
import cors from "cors";
import productsRouter from "./api/product/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errrorHandlers.js";

const port = process.env.port || 3001;
const server = express();

//--------------------- MIDDDLEWARS------------------------
server.use(cors());
server.use(express.json());

//----------------endpoints---------------
server.use("/product", productsRouter);

//-------------------- ErrorHandlers-----------------------
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
