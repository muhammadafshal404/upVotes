import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import addWishlistItems from "../util/addWishlistItems.js";

/**
 * @method createWishlist
 * @summary Create a new wishlist for a shop with an initial list of items in it.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @param {String} input.items - An array of wishlist items to add to the new wishlist. Must not be empty.
 * @param {String} input.shopId - The ID of the shop that will own this wishlist
 * @param {Boolean} [input.shouldCreateWithoutItems] - Create even if `items` is empty or becomes empty
 *   due to price mismatches? Default is false. This is for backwards compatibility with old Meteor code
 *   that creates the wishlist prior to adding items and should not be set to `true` in new code.
 * @returns {Promise<Object>} An object with `wishlist`, `minOrderQuantityFailures`, and `incorrectPriceFailures` properties.
 *   `wishlist` will be null if all prices were incorrect. If at least one item could be added,
 *   then the wishlist will have been created and returned, but `incorrectPriceFailures` and
 *   `minOrderQuantityFailures` may still contain other failures that the caller should
 *   optionally retry with the correct price or quantity.
 */
export default async function createWishlist(context, input) {
  const { items, shopId, shouldCreateWithoutItems = false } = input;
  const { collections, accountId = null } = context;
  const { Wishlist, Shops } = collections;

  if (shouldCreateWithoutItems !== true && (!Array.isArray(items) || !items.length)) {
    throw new ReactionError("invalid-param", "A wishlist may not be created without at least one item in it");
  }

  // If we have an accountId and that account already has a wishlist for this shop, throw
  if (accountId) {
    const existingWishlist = await Wishlist.findOne({ accountId, shopId }, { projection: { _id: 1 } });

    if (existingWishlist) {
      throw new ReactionError("wishlist-found", "Each account may have only one wishlist per shop at a time");
    }
  } else {
    throw new ReactionError("access-denied", "Unauthorized users cannot create wishlists");
  }

  const {
    incorrectPriceFailures,
    minOrderQuantityFailures,
    updatedItemList
  } = await addWishlistItems(context, [], items);

  // If all input items were invalid, don't create a wishlist
  if (!updatedItemList.length && shouldCreateWithoutItems !== true) {
    return { wishlist: null, incorrectPriceFailures, minOrderQuantityFailures, token: null };
  }

  const shop = await Shops.findOne({ _id: shopId }, { projection: { currency: 1 } });
  const wishlistCurrencyCode = (shop && shop.currency) || "USD";

  const createdAt = new Date();
  const newWishlist = {
    _id: Random.id(),
    accountId,
    currencyCode: wishlistCurrencyCode,
    createdAt,
    items: updatedItemList,
    shopId,
    updatedAt: createdAt,
    workflow: {
      status: "new"
    }
  };

  const savedWishlist = await context.mutations.saveWishlist(context, newWishlist);

  return { wishlist: savedWishlist, incorrectPriceFailures, minOrderQuantityFailures };
}
