import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  "wishlistId": String,
  "wishlistItemIds": {
    type: Array,
    minCount: 1
  },
  "wishlistItemIds.$": String,
  "wishlistToken": {
    type: String,
    optional: true
  }
});

/**
 * @method removeWishlistItems
 * @summary Removes one or more items from a wishlist
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - Necessary input
 * @param {String} input.wishlistId - The ID of the wishlist in which all of the items exist
 * @param {String[]} input.wishlistItemIds - Array of wishlist item IDs to remove
 * @param {String} input.wishlistToken - The wishlistToken if the wishlist is an anonymous wishlist
 * @returns {Promise<Object>} An object containing the updated wishlist in a `wishlist` property
 */
export default async function removeWishlistItems(context, input) {
  inputSchema.validate(input || {});

  const { accountId, collections } = context;
  const { Wishlist } = collections;
  const { wishlistId, wishlistItemIds } = input;

  const selector = { _id: wishlistId };
  if (accountId) {
    selector.accountId = accountId;
  } else {
    throw new ReactionError("invalid-param", "A wishlistToken is required when updating an anonymous wishlist");
  }

  const wishlist = await Wishlist.findOne(selector);
  if (!wishlist) throw new ReactionError("not-found", "Wishlist not found");

  const updatedWishlist = {
    ...wishlist,
    items: wishlist.items.filter((item) => !wishlistItemIds.includes(item._id)),
    updatedAt: new Date()
  };

  const savedWishlist = await context.mutations.saveWishlist(context, updatedWishlist);

  return { wishlist: savedWishlist };
}
