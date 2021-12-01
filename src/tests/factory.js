import { createFactoryForSchema, Factory } from "@reactioncommerce/data-factory";

import {
  Wishlist,
  WishlistItem
} from "../simpleSchemas.js";

const schemasToAddToFactory = {
  Wishlist,
  WishlistItem
};

// Adds each to `Factory` object. For example, `Factory.Wishlist`
// will be the factory that builds an object that matches the
// `Wishlist` schema.
Object.keys(schemasToAddToFactory).forEach((key) => {
  createFactoryForSchema(key, schemasToAddToFactory[key]);
});

export default Factory;
