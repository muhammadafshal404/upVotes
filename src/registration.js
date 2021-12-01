import SimpleSchema from "simpl-schema";

const transformSchema = new SimpleSchema({
  name: String,
  fn: Function,
  priority: Number
});

// Objects with `name`, `priority` and `fn` properties
export const wishlistTransforms = [];

/**
 * @summary Will be called for every plugin
 * @param {Object} options The options object that the plugin passed to registerPackage
 * @returns {undefined}
 */
export function registerPluginHandlerForWishlist({ name, wishlist }) {
  if (wishlist) {
    const { transforms } = wishlist;

    if (!Array.isArray(transforms)) throw new Error(`In ${name} plugin registerPlugin object, wishlist.transforms must be an array`);
    transformSchema.validate(transforms);

    wishlistTransforms.push(...transforms);
    wishlistTransforms.sort((prev, next) => prev.priority - next.priority);
  }
}
