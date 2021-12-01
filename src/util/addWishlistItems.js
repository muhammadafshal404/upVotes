import Random from "@reactioncommerce/random";
import SimpleSchema from "simpl-schema";
import accounting from "accounting-js";
import ReactionError from "@reactioncommerce/reaction-error";

const inputItemSchema = new SimpleSchema({
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Object,
    blackbox: true
  },
  "productConfiguration": Object,
  "productConfiguration.productId": String,
  "productConfiguration.productVariantId": String,
  "price": Object,
  "price.currencyCode": String,
  "price.amount": {
    type: Number,
    optional: true
  }
});

/**
 * @summary Given a list of current wishlist items and a list of items a shopper wants
 *   to add, validate available quantities and return the full merged list.
 * @param {Object} context - App context
 * @param {Object[]} currentItems - Array of current items in WishlistItem schema
 * @param {Object[]} inputItems - Array of items to add in WishlistItemInput schema
 * @param {Object} [options] - Options
 * @param {Boolean} [options.skipPriceCheck] - For backwards compatibility, set to `true` to skip checking price.
 *   Skipping this is not recommended for new code.
 * @returns {Object} Object with `incorrectPriceFailures` and `minOrderQuantityFailures` and `updatedItemList` props
 */
export default async function addWishlistItems(context, currentItems, inputItems, options = {}) {
  const { queries } = context;

  inputItemSchema.validate(inputItems);

  const incorrectPriceFailures = [];
  const updatedItemList = currentItems.slice(0);

  const currentDateTime = new Date();

  const promises = inputItems.map(async (inputItem) => {
    const { metafields, productConfiguration, price } = inputItem;
    const { productId, productVariantId } = productConfiguration;

    // Get the published product from the DB, in order to get variant title and check price.
    // This could be done outside of the loop to reduce db hits, but 99% of the time inputItems
    // will have only one item, so we can skip that optimization for now in favor of cleaner code.
    const {
      catalogProduct,
      parentVariant,
      variant: chosenVariant
    } = await queries.findProductAndVariant(context, productId, productVariantId);

    const variantPriceInfo = await queries.getVariantPrice(context, chosenVariant, price.currencyCode);
    if (!variantPriceInfo) {
      throw new ReactionError("invalid-param", `This product variant does not have a price for ${price.currencyCode}`);
    }

    if (options.skipPriceCheck !== true && variantPriceInfo.price !== price.amount) {
      incorrectPriceFailures.push({
        currentPrice: {
          amount: variantPriceInfo.price,
          currencyCode: price.currencyCode
        },
        productConfiguration,
        providedPrice: price
      });
      return;
    }

    // Note that we do not check inventory quantity here. We will assume that the client
    // knows what it is doing and may want to add items that are not available. Quantity
    // checks at the time of placing the order will ensure that unavailable items are
    // not ordered unless back-ordering is enabled.

    // Until we do a more complete attributes revamp, we'll do our best to fudge attributes here.
    const attributes = [];
    if (parentVariant) {
      attributes.push({
        label: parentVariant.attributeLabel,
        value: parentVariant.optionTitle
      });
    }
    attributes.push({
      label: chosenVariant.attributeLabel,
      value: chosenVariant.optionTitle
    });

    const wishlistItem = {
      _id: Random.id(),
      attributes,
      compareAtPrice: null,
      isTaxable: chosenVariant.isTaxable || false,
      metafields,
      optionTitle: chosenVariant.optionTitle,
      // This one will be kept updated by event handler watching for
      // catalog changes whereas `priceWhenAdded` will not.
      price: {
        amount: variantPriceInfo.price,
        currencyCode: price.currencyCode
      },
      priceWhenAdded: {
        amount: variantPriceInfo.price,
        currencyCode: price.currencyCode
      },
      productId,
      productSlug: catalogProduct.slug,
      productVendor: catalogProduct.vendor,
      productType: catalogProduct.type,
      productTagIds: catalogProduct.tagIds,
      shopId: catalogProduct.shopId,
      // Subtotal will be kept updated by event handler watching for catalog changes.
      subtotal: {
        amount: +accounting.toFixed(variantPriceInfo.price, 3),
        currencyCode: price.currencyCode
      },
      taxCode: chosenVariant.taxCode,
      title: catalogProduct.title,
      updatedAt: currentDateTime,
      variantId: productVariantId,
      variantTitle: chosenVariant.title
    };

    if (variantPriceInfo.compareAtPrice || variantPriceInfo.compareAtPrice === 0) {
      wishlistItem.compareAtPrice = {
        amount: variantPriceInfo.compareAtPrice,
        currencyCode: price.currencyCode
      };
    }

    const currentMatchingItemIndex = currentItems.findIndex((item) =>
      item.productId === productId && item.variantId === productVariantId);
    if (currentMatchingItemIndex === -1) {
      wishlistItem.addedAt = currentDateTime;
      wishlistItem.createdAt = currentDateTime;
      updatedItemList.push(wishlistItem);
    }
  });

  await Promise.all(promises);

  // Always keep most recently added items at the beginning of the list
  updatedItemList.sort((itemA, itemB) => itemA.addedAt.getTime() - itemB.addedAt.getTime());

  return { incorrectPriceFailures, updatedItemList };
}
