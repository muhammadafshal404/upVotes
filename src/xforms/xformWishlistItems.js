/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object[]} items Array of WishlistItem
 * @returns {Object[]} Same array with GraphQL-only props added
 */
export default async function xformWishlistItems(context, items) {
  const xformedItems = items.map((item) => ({
    ...item,
    productConfiguration: {
      productId: item.productId,
      productVariantId: item.variantId
    }
  }));

  for (const mutateItems of context.getFunctionsOfType("xformWishlistItems")) {
    await mutateItems(context, xformedItems); // eslint-disable-line no-await-in-loop
  }

  return xformedItems;
}
