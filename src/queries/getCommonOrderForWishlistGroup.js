import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import xformWishlistGroupToCommonOrder from "../util/xformWishlistGroupToCommonOrder.js";

const inputSchema = new SimpleSchema({
  wishlist: {
    type: Object,
    optional: true,
    blackbox: true
  },
  wishlistId: {
    type: String,
    optional: true
  },
  fulfillmentGroupId: String
});

/**
 * @name getCommonOrderForWishlistGroup
 * @method
 * @memberof Wishlist/NoMeteorQueries
 * @summary Query the Wishlist collection for a wishlist and fulfillment group
 *    with the provided wishlistId and fulfillmentGroupId, and return
 *    a CommonOrder style object
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - request parameters
 * @param {Object} [input.wishlist] - Wishlist to create CommonOrder from. Use this instead
 *   of `wishlistId` if you have already looked up the wishlist.
 * @param {String} [input.wishlistId] - wishlist ID to create CommonOrder from
 * @param {String} input.fulfillmentGroupId - fulfillment group ID to create CommonOrder from
 * @returns {Promise<Object>|undefined} - A CommonOrder document
 */
export default async function getCommonOrderForWishlistGroup(context, input = {}) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Wishlist } = collections;

  const {
    wishlist: wishlistInput,
    wishlistId,
    fulfillmentGroupId
  } = input;

  const wishlist = wishlistInput || (wishlistId && await Wishlist.findOne({ _id: wishlistId }));
  if (!wishlist) throw new ReactionError("not-found", "Wishlist not found");

  const group = wishlist.shipping.find((grp) => grp._id === fulfillmentGroupId);
  if (!group) throw new ReactionError("not-found", "Group not found");

  return xformWishlistGroupToCommonOrder(wishlist, group, context);
}
