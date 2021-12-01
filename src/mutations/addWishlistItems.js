import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import ReactionError from "@reactioncommerce/reaction-error";
import addWishlistItemsUtil from "../util/addWishlistItems.js";

/**
 * @method addWishlistItems
 * @summary Add one or more items to a wishlist
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {Object} [options] - Options
 * @param {Boolean} [options.skipPriceCheck] - For backwards compatibility, set to `true` to skip checking price.
 *   Skipping this is not recommended for new code.
 * @returns {Promise<Object>} An object with `wishlist`, `minOrderQuantityFailures`, and `incorrectPriceFailures` properties.
 *   `wishlist` will always be the full updated wishlist document, but `incorrectPriceFailures` and
 *   `minOrderQuantityFailures` may still contain other failures that the caller should
 *   optionally retry with the corrected price or quantity.
 */
export default async function addWishlistItems(context, input, options = {}) {
  const { wishlistId, items, wishlistToken } = input;
  const { collections, accountId = null } = context;
  const { Wishlist } = collections;

  let selector;
  if (accountId) {
    // Account wishlist
    selector = { _id: wishlistId, accountId };
  } else {
    // Anonymous wishlist
    if (!wishlistToken) {
      throw new ReactionError("not-found", "Wishlist not found");
    }

    selector = { _id: wishlistId, anonymousAccessToken: hashToken(wishlistToken) };
  }

  const wishlist = await Wishlist.findOne(selector);
  if (!wishlist) {
    throw new ReactionError("not-found", "Wishlist not found");
  }

  const {
    incorrectPriceFailures,
    minOrderQuantityFailures,
    updatedItemList
  } = await addWishlistItemsUtil(context, wishlist.items, items, { skipPriceCheck: options.skipPriceCheck });

  const updatedWishlist = {
    ...wishlist,
    items: updatedItemList,
    updatedAt: new Date()
  };

  const savedWishlist = await context.mutations.saveWishlist(context, updatedWishlist);

  return { wishlist: savedWishlist, incorrectPriceFailures, minOrderQuantityFailures };
}
