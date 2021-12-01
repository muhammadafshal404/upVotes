import { decodeAccountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query/wishlistByAccountId
 * @method
 * @memberof Wishlist/GraphQL
 * @summary resolver for the accountWishlistByAccountId GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.accountId - The account for which to generate an account wishlist
 * @param {String} args.shopId - The shop that will own this wishlist
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>|undefined} A Wishlist object
 */
export default async function wishlistByAccountId(parentResult, args, context) {
  const { accountId, shopId } = args;

  return context.queries.wishlistByAccountId(context, {
    accountId: decodeAccountOpaqueId(accountId),
    shopId: decodeShopOpaqueId(shopId)
  });
}
