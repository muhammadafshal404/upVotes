import { decodeWishlistItemsOpaqueIds, decodeWishlistOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/addWishlistItems
 * @method
 * @memberof Wishlist/GraphQL
 * @summary resolver for the addWishlistItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.wishlistId - The opaque ID of the wishlist to add the items to.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} args.input.items - An array of wishlist items to add to the new wishlist. Must not be empty.
 *   Required for anonymous wishlists.
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddWishlistItemsPayload
 */
export default async function addWishlistItems(parentResult, { input }, context) {
  const { wishlistId: opaqueWishlistId, clientMutationId = null, items: itemsInput } = input;
  const wishlistId = decodeWishlistOpaqueId(opaqueWishlistId);
  const items = decodeWishlistItemsOpaqueIds(itemsInput);

  const {
    wishlist,
    incorrectPriceFailures,
    minOrderQuantityFailures
  } = await context.mutations.addWishlistItems(context, {
    wishlistId,
    items
  });

  return {
    wishlist,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    clientMutationId
  };
}
