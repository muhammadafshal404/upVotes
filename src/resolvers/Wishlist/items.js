import _ from "lodash";
import xformArrayToConnection from "@reactioncommerce/api-utils/graphql/xformArrayToConnection.js";
import xformWishlistItems from "../../xforms/xformWishlistItems.js";

/**
 * @summary Sorts the provided wishlist items according to the connectionArgs.
 * @param {Object[]} wishlistItems Array of wishlist items
 * @param {ConnectionArgs} connectionArgs - An object of all arguments that were sent by the client
 * @returns {Object[]} Sorted list of wishlist items
 */
function sortWishlistItems(wishlistItems, connectionArgs) {
  const { sortOrder, sortBy } = connectionArgs;

  let sortedItems;
  switch (sortBy) {
    case "addedAt":
      sortedItems = _.orderBy(wishlistItems, ["addedAt", "_id"], [sortOrder, sortOrder]);
      break;

    // sort alpha by _id
    default:
      sortedItems = _.orderBy(wishlistItems, ["_id"], [sortOrder]);
      break;
  }

  return sortedItems;
}

/**
 * @name Wishlist/items
 * @method
 * @memberof Wishlist/GraphQL
 * @summary converts the `items` prop on the provided wishlist to a connection
 * @param {Object} wishlist - result of the parent resolver, which is a Wishlist object in GraphQL schema format
 * @param {ConnectionArgs} connectionArgs - An object of all arguments that were sent by the client
 * @param {Object} context - The per-request context object
 * @returns {Promise<Object>} A connection object
 */
export default async function items(wishlist, connectionArgs, context) {
  let { items: wishlistItems } = wishlist;
  if (!Array.isArray(wishlistItems) || wishlistItems.length === 0) return xformArrayToConnection(connectionArgs, []);

  // Apply requested sorting
  wishlistItems = sortWishlistItems(wishlistItems, connectionArgs);

  return xformArrayToConnection(connectionArgs, xformWishlistItems(context, wishlistItems));
}
