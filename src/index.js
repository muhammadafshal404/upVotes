import pkg from "../package.json";
import mutations from "./mutations/index.js";
import policies from "./policies.json";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";
import { registerPluginHandlerForWishlist } from "./registration.js";
import { Wishlist, WishlistItem } from "./simpleSchemas.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Wishlists",
    name: "wishlists",
    version: pkg.version,
    collections: {
      Wishlist: {
        name: "Wishlist",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ accountId: 1 }, { name: "c2_accountId" }],
          [{ accountId: 1, shopId: 1 }],
          [{ anonymousAccessToken: 1 }, { name: "c2_anonymousAccessToken" }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ "items.productId": 1 }, { name: "c2_items.$.productId" }],
          [{ "items.variantId": 1 }, { name: "c2_items.$.variantId" }]
        ]
      }
    },
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForWishlist],
      startup: [startup]
    },
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    queries,
    policies,
    simpleSchemas: {
      Wishlist,
      WishlistItem
    }
  });
}
