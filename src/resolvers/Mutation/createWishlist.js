import { decodeWishlistItemsOpaqueIds, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/createWishlist
 * @method
 * @memberof Wishlist/GraphQL
 * @summary resolver for the createWishlist GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} args.input.items - An array of wishlist items to add to the new wishlist. Must not be empty.
 * @param {String} args.input.shopId - The ID of the shop that will own this wishlist
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CreateWishlistPayload
 */
export default async function createWishlist(parentResult, { input }, context) {
  const { clientMutationId = null, items: itemsInput, shopId: opaqueShopId } = input;
  const shopId = decodeShopOpaqueId(opaqueShopId);
  const items = decodeWishlistItemsOpaqueIds(itemsInput);

  const {
    wishlist,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    token
  } = await context.mutations.createWishlist(context, {
    items,
    shopId
  });

  return {
    wishlist,
    clientMutationId,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    token
  };
}
