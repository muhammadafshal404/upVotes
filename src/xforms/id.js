import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Account: "reaction/account",
  Wishlist: "reaction/wishlist",
  WishlistItem: "reaction/wishlistItem",
  Product: "reaction/product",
  Shop: "reaction/shop"
};

export const encodeWishlistItemOpaqueId = encodeOpaqueId(namespaces.WishlistItem);
export const encodeWishlistOpaqueId = encodeOpaqueId(namespaces.Wishlist);

export const decodeAccountOpaqueId = decodeOpaqueIdForNamespace(namespaces.Account);
export const decodeWishlistItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.WishlistItem);
export const decodeWishlistOpaqueId = decodeOpaqueIdForNamespace(namespaces.Wishlist);
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.Product);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);

/**
 * @param {Object[]} items Array of WishlistItemInput
 * @returns {Object[]} Same array with all IDs transformed to internal
 */
export function decodeWishlistItemsOpaqueIds(items) {
  return items.map((item) => ({
    ...item,
    productConfiguration: {
      productId: decodeProductOpaqueId(item.productConfiguration.productId),
      productVariantId: decodeProductOpaqueId(item.productConfiguration.productVariantId)
    }
  }));
}
