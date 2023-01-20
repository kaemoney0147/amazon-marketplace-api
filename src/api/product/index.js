import express, { query } from "express";
import productModel from "./model.js";
import createHttpError from "http-errors";
import multer from "multer";
import q2m from "query-to-mongo";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const productsRouter = express.Router();

productsRouter.post("/", async (req, res, next) => {
  try {
    const product = new productModel(req.body);
    const { _id } = await product.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});
productsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const total = await productModel.countDocuments(mongoQuery.criteria);
    const products = await productModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links(process.env.QUERY_URL, total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
});
productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (product) {
      res.send(product);
    } else {
      next(
        createHttpError(404, `ProductID ${req.params.productId} not found.`)
      );
    }
  } catch (err) {
    next(err);
  }
});
productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const Updateproduct = await productModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (Updateproduct) {
      res.send(Updateproduct);
    } else {
      next(
        createHttpError(404, `ProductID ${req.params.productId} not found.`)
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletProduct = await productModel.findByIdAndDelete(
      req.params.productId
    );
    if (deletProduct) {
      res.status(204).send("this product as being deleted sucessfully");
    } else {
      createHttpError(404, `ProductID ${req.params.productId} not found.`);
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const reviewToInsert = {
      ...req.body,
      createdAt: new Date(),
    };

    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.productId,
      { $push: { reviews: reviewToInsert } },
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (product) {
      res.send(product.reviews);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (product) {
      const review = product.reviews.find(
        (review) => review._id.toString() === req.params.reviewId
      );

      if (review) {
        res.send(review);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (product) {
      const index = product.reviews.findIndex(
        (review) => review._id.toString() === req.params.reviewId
      );

      if (index !== -1) {
        product.reviews[index] = {
          ...product.reviews[index].toObject(),
          ...req.body,
          updatedAt: new Date(),
        };
        await product.save();
        res.send(product);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
productsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true }
      );
      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default productsRouter;
