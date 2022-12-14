import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

export const MAX_WISHLIST_COUNT = 50;
const logCtx = { name: "wishlist", file: "saveManyWishlists" };

/**
 * @summary Takes a new or updated wishlist, runs it through all registered transformations,
 *   validates, and upserts to database.
 * @param {Object} context - App context
 * @param {Object[]} wishlists - The wishlists to transform and insert or replace. There is a limit
 *   of 50 wishlists. If the array has more than 50 items, an error is thrown.
 * @returns {undefined}
 */
export default async function saveManyWishlists(context, wishlists) {
  const { appEvents, collections: { Wishlist } } = context;

  if (!Array.isArray(wishlists) || wishlists.length > MAX_WISHLIST_COUNT) {
    throw new ReactionError("invalid-param", `wishlists must be an array of ${MAX_WISHLIST_COUNT} or fewer wishlists`);
  }

  // Transform and validate each wishlist and then add to `bulkWrites` array
  const bulkWritePromises = wishlists.map(async (wishlist) => {
    // These will mutate `wishlist`
    await context.mutations.removeMissingItemsFromWishlist(context, wishlist);

    return {
      replaceOne: {
        filter: { _id: wishlist._id },
        replacement: wishlist,
        upsert: true
      }
    };
  });

  const bulkWrites = await Promise.all(bulkWritePromises);

  let writeErrors;
  try {
    Logger.trace({ ...logCtx, bulkWrites }, "Running bulk op");
    const bulkWriteResult = await Wishlist.bulkWrite(bulkWrites, { ordered: false });
    console.log("bulkWriteResult", bulkWriteResult)
    ({ writeErrors } = bulkWriteResult.result);
  } catch (error) {
    if (!error.result || typeof error.result.getWriteErrors !== "function") throw error;
    // This happens only if all writes fail. `error` object has the result on it.
    writeErrors = error.result.getWriteErrors();
  }

  // Figure out which failed and which succeeded. Emit "after update" or log error
  const wishlistIds = [];
  await Promise.all(wishlists.map(async (wishlist, index) => {
    // If updating this wishlist failed, log the error details and stop
    const writeError = writeErrors.find((writeErr) => writeErr.index === index);
    if (writeError) {
      Logger.error({
        ...logCtx,
        errorCode: writeError.code,
        errorMsg: writeError.errmsg,
        wishlistId: wishlist._id
      }, "MongoDB writeError saving wishlist");
      return;
    }

    wishlistIds.push(wishlist._id);
    appEvents.emit("afterWishlistUpdate", { wishlist, updatedBy: null });
  }));

  Logger.debug({ ...logCtx, wishlistIds }, "Successfully saved multiple wishlists");
}
