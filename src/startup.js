import Logger from "@reactioncommerce/logger";
import updateWishlistItemsForVariantChanges from "./util/updateWishlistItemsForVariantChanges.js";
import { MAX_WISHLIST_COUNT as SAVE_MANY_WISHLISTS_LIMIT } from "./mutations/saveManyWishlists.js";

const logCtx = { name: "wishlist", file: "startup" };

/**
 * @param {Object[]} catalogProductVariants The `product.variants` array from a catalog item
 * @returns {Object[]} All variants and their options flattened in one array
 */
function getFlatVariantsAndOptions(catalogProductVariants) {
  const variants = [];

  catalogProductVariants.forEach((variant) => {
    variants.push(variant);
    if (variant.options) {
      variant.options.forEach((option) => {
        variants.push(option);
      });
    }
  });

  return variants;
}

/**
 * @param {Object} Wishlist Wishlist collection
 * @param {Object} context App context
 * @param {String} variant The catalog product variant or option
 * @returns {Promise<null>} Promise that resolves with null
 */
async function updateAllWishlistsForVariant({ Wishlist, context, variant }) {
  const { mutations, queries } = context;
  const { variantId } = variant;

  Logger.debug({ ...logCtx, variantId, fn: "updateAllWishlistsForVariant" }, "Running updateAllWishlistsForVariant");

  let updatedWishlists = [];

  /**
   * @summary Bulk save an array of updated wishlists
   * @return {undefined}
   */
  async function saveWishlists() {
    if (updatedWishlists.length === 0) return;
    await mutations.saveManyWishlists(context, updatedWishlists);
    updatedWishlists = [];
  }

  /**
   * @summary Get updated prices for a single wishlist, and check whether there are any changes.
   *   If so, push into `bulkWrites` array.
   * @param {Object} wishlist The wishlist
   * @return {undefined}
   */
  async function updateOneWishlist(wishlist) {
    const prices = await queries.getVariantPrice(context, variant, wishlist.currencyCode);
    if (!prices) return;

    const { didUpdate, updatedItems } = updateWishlistItemsForVariantChanges(wishlist.items, variant, prices);
    if (!didUpdate) return;

    updatedWishlists.push({ ...wishlist, items: updatedItems });
  }

  // Do find + update because we need the `wishlist.currencyCode` to figure out pricing
  // and we need current quantity to recalculate `subtotal` for each item.
  // It should be fine to load all results into an array because even for large shops,
  // there will likely not be a huge number of the same product in wishlists at the same time.
  const wishlistsCursor = Wishlist.find({ "items.variantId": variantId });

  /* eslint-disable no-await-in-loop */
  let wishlist = await wishlistsCursor.next();
  while (wishlist) {
    await updateOneWishlist(wishlist);

    if (updatedWishlists.length === SAVE_MANY_WISHLISTS_LIMIT) {
      await saveWishlists();
    }

    wishlist = await wishlistsCursor.next();
  }
  /* eslint-enable no-await-in-loop */

  // Flush remaining wishlist updates
  await saveWishlists();

  return null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function wishlistStartup(context) {
  const { appEvents, collections } = context;
  const { Wishlist } = collections;

  // Propagate any price changes to all corresponding wishlist items
  appEvents.on("afterPublishProductToCatalog", async ({ catalogProduct }) => {
    const { _id: catalogProductId, variants } = catalogProduct;

    Logger.debug({ ...logCtx, catalogProductId, fn: "startup" }, "Running afterPublishProductToCatalog");

    const variantsAndOptions = getFlatVariantsAndOptions(variants);

    // Update all wishlist items that are linked with the updated variants.
    await Promise.all(variantsAndOptions.map((variant) => updateAllWishlistsForVariant({ Wishlist, context, variant })));
  });
}
