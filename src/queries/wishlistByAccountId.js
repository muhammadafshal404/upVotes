import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name accountWishlistByAccountId
 * @method
 * @memberof Wishlist/NoMeteorQueries
 * @summary Query the Wishlist collection for a wishlist with the provided accountId and shopId
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.accountId] - An account ID
 * @param {String} [params.shopId] - A shop ID
 * @returns {Promise<Object>|undefined} A Wishlist document, if one is found
 */
export default async function accountWishlistByAccountId(context, { accountId, shopId } = {}) {
  const { collections } = context;
  const { Wishlist } = collections;

  await context.validatePermissions(`reaction:legacy:accounts:${accountId._id}`, "read", { shopId, owner: accountId });

  if (!accountId) {
    throw new ReactionError("invalid-param", "You must provide accountId");
  }
  if (!shopId) {
    throw new ReactionError("invalid-param", "You must provide shopId");
  }

  return Wishlist.findOne({ accountId, shopId });
}
