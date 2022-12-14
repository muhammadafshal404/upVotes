import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Takes a new or updated wishlist, runs it through all registered transformations,
 *   validates, and upserts to database.
 * @param {Object} context - App context
 * @param {Object} wishlist - The wishlist to transform and insert or replace
 * @returns {Object} Transformed and saved wishlist
 */
export default async function saveWishlist(context, wishlist) {
  const { appEvents, collections: { Wishlist }, userId = null } = context;


  // These will mutate `wishlist`
  await context.mutations.removeMissingItemsFromWishlist(context, wishlist);

  const { result, upsertedCount } = await Wishlist.replaceOne({ _id: wishlist._id }, wishlist, { upsert: true });
  console.log("here is we removing the item from wishList", result, upsertedCount)

  if (result.ok !== 1) throw new ReactionError("server-error", "Unable to save wishlist");

  if (upsertedCount === 1) {
    console.log("first if")
    appEvents.emit("afterWishlistCreate", {
      wishlist,
      createdBy: userId
    });
  } else {
    console.log("else")
    appEvents.emit("afterWishlistUpdate", {
      wishlist,
      updatedBy: userId
    });
  }

  return wishlist;
}
