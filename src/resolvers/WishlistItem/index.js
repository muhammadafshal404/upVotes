import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeWishlistItemOpaqueId } from "../../xforms/id.js";
import productTags from "./productTags.js";
import imageURLs from "./imageURLs.js";

export default {
  _id: (node) => encodeWishlistItemOpaqueId(node._id),
  imageURLs: (node, args, context) => imageURLs(node, context),
  productTags,
  shop: resolveShopFromShopId
};
