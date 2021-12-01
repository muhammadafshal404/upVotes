import resolveAccountFromAccountId from "@reactioncommerce/api-utils/graphql/resolveAccountFromAccountId.js";
import resolveShopFromShopId from "@reactioncommerce/api-utils/graphql/resolveShopFromShopId.js";
import { encodeWishlistOpaqueId } from "../../xforms/id.js";
import xformWishlistItems from "../../xforms/xformWishlistItems.js";
import items from "./items.js";

export default {
  _id: (node) => encodeWishlistOpaqueId(node._id),
  account: resolveAccountFromAccountId,
  items,
  missingItems: (wishlist, _, context) => xformWishlistItems(context, wishlist.missingItems || []),
  shop: resolveShopFromShopId
};
