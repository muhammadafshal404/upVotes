/**
 * @method ensureAbsoluteUrls
 * @summary ensure cart imageInfo URLs are absolute
 * @param {Object} imageInfo - input ImageInfo
 * @param {Object} context - The per request context
 * @returns {Object} infoImage object
 */
function ensureAbsoluteUrls(imageInfo, context) {
  const absoluteImagePaths = {};

  Object.keys(imageInfo).forEach((name) => {
    absoluteImagePaths[name] = context.getAbsoluteUrl(imageInfo[name]);
  });

  return absoluteImagePaths;
}

/**
 *
 * @method imageURLs
 * @summary Get primary image urls for wishlist item
 * @param {Object} item -  A wishlist item
 * @param {Object} context - The per request context
 * @returns {Object} ImageSizes object
 */
export default async function imageURLs(item, context) {
  const { Products } = context.collections;
  const { productId, variantId } = item;
  if (!Products) return {};

  const variant = await Products.findOne({ "_id": variantId });

  if (!variant) return {};
  const primaryImage = variant.media ? variant.media[0].URLs : {};

  if (!primaryImage) return {};
  // return  primaryImage;
  //   return ensureAbsoluteUrls({
  //     large: `${primaryImage.url({ store: "large" })}`,
  //     medium: `${primaryImage.url({ store: "medium" })}`,
  //     original: `${primaryImage.url({ store: "image" })}`,
  //     small: `${primaryImage.url({ store: "small" })}`,
  //     thumbnail: `${primaryImage.url({ store: "thumbnail" })}`
  //   }, context);
}
