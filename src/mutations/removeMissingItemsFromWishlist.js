/**
 * @method removeMissingItemsFromWishlist
 * @summary Checks a wishlist to see if any of the items in it correspond with
 *   product variants that are now gone (hidden or deleted). Updates the
 *   wishlist to move them to `missingItems` array and remove them from
 *   `items`. Mutates `wishlist` but doesn't save to database.
 * @param {Object} context - App context
 * @param {Object} wishlist The Wishlist object to check
 * @returns {Promise<undefined>} Nothing. Mutates `wishlist` object
 */
export default async function removeMissingItemsFromWishlist(context, wishlist) {
  const catalogItemIds = wishlist.items.map((item) => item.productId);
  const catalogItems = await context.collections.Catalog.find({
    "product.productId": { $in: catalogItemIds },
    "product.isDeleted": { $ne: true },
    "product.isVisible": true
  }).toArray();

  // If any items were missing from the catalog, deleted, or hidden, move them into
  // a missingItems array. A product variant that has been hidden or deleted since
  // being added to a wishlist is no longer valid as a wishlist item.
  const items = [];
  const missingItems = [];
  for (const item of wishlist.items) {
    const catalogItem = catalogItems.find((cItem) => cItem.product.productId === item.productId);
    if (!catalogItem) {
      missingItems.push(item);
      continue;
    }
    const { variant: catalogVariant } = context.queries.findVariantInCatalogProduct(catalogItem.product, item.variantId);
    if (!catalogVariant) {
      missingItems.push(item);
      continue;
    }
    items.push(item);
  }

  if (missingItems.length === 0) return;

  wishlist.items = items;
  // wishlist.missingItems = missingItems;
  // wishlist.updatedAt = new Date();

  // // Usually `mutations.transformAndValidateWishlist` removes missing items from groups
  // // whenever we save a wishlist, but sometimes this mutation will need to be called
  // // when initially reading a wishlist, before attempting to transform it to a CommonOrder.
  // // So we'll also update the groups here.
  // wishlist.shipping.forEach((group) => {
  //   group.itemIds = (group.itemIds || []).filter((itemId) => !!items.find((item) => item._id === itemId));
  // });
}
