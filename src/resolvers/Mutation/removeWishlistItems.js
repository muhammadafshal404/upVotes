import { decodeWishlistItemOpaqueId, decodeWishlistOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/removeWishlistItems
 * @method
 * @memberof Wishlist/GraphQL
 * @summary resolver for the removeWishlistItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.wishlistId - The ID of the wishlist in which all of the items exist
 * @param {String[]} args.input.wishlistItemIds - Array of item IDs to update
 * @param {String} args.input.wishlistToken - The wishlistToken if the wishlist is an anonymous wishlist
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} RemoveWishlistItemsPayload
 */
export default async function removeWishlistItems(parentResult, { input }, context) {
  const { wishlistId: opaqueWishlistId, clientMutationId = null, wishlistItemIds: opaqueWishlistItemIds, wishlistToken } = input;

  const wishlistId = decodeWishlistOpaqueId(opaqueWishlistId);
  const wishlistItemIds = opaqueWishlistItemIds.map(decodeWishlistItemOpaqueId);

  const { wishlist } = await context.mutations.removeWishlistItems(context, {
    wishlistId,
    wishlistItemIds,
    wishlistToken
  });

  return {
    wishlist,
    clientMutationId
  };
}
