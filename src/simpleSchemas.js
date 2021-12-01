import SimpleSchema from "simpl-schema";

/**
 * @name Metafield
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} key optional
 * @property {String} namespace optional
 * @property {String} scope optional
 * @property {String} value optional
 * @property {String} valueType optional
 * @property {String} description optional
 */
const Metafield = new SimpleSchema({
  key: {
    type: String,
    max: 30,
    optional: true
  },
  namespace: {
    type: String,
    max: 20,
    optional: true
  },
  scope: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  valueType: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  }
});

/**
 * @name Workflow
 * @summary Control view flow by attaching layout to a collection.
 * Shop defaultWorkflow is defined in Shop.
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} status, default value: `new`
 * @property {String[]} workflow optional
 */
const Workflow = new SimpleSchema({
  "status": {
    type: String,
    defaultValue: "new"
  },
  "workflow": {
    type: Array,
    optional: true
  },
  "workflow.$": String
});

const Money = new SimpleSchema({
  currencyCode: String,
  amount: {
    type: Number,
    min: 0
  }
});

/**
 * @name WishlistItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} value optional
 */
const WishlistItemAttribute = new SimpleSchema({
  label: String,
  value: {
    type: String,
    optional: true
  }
});

/**
 * @name WishlistItem
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} addedAt required
 * @property {WishlistItemAttribute[]} attributes Attributes of this item
 * @property {String} createdAt required
 * @property {Metafield[]} metafields
 * @property {String} optionTitle optionTitle from the selected variant
 * @property {Money} price The current price of this item
 * @property {Money} priceWhenAdded The price+currency at the moment this item was added to this wishlist
 * @property {String} productId required
 * @property {String} productSlug Product slug
 * @property {String} productType Product type
 * @property {String} productVendor Product vendor
 * @property {String} shopId Wishlist Item shopId
 * @property {String} title Wishlist Item title
 * @property {String} updatedAt required
 * @property {String} variantId required
 * @property {String} variantTitle Title from the selected variant
 */
export const WishlistItem = new SimpleSchema({
  "_id": String,
  "addedAt": Date,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": WishlistItemAttribute,
  "compareAtPrice": {
    type: Money,
    optional: true
  },
  "createdAt": Date,
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": Metafield,
  "optionTitle": {
    type: String,
    optional: true
  },
  "price": Money,
  "priceWhenAdded": Money,
  "productId": String,
  "productSlug": {
    type: String,
    optional: true
  },
  "productType": {
    label: "Product Type",
    type: String,
    optional: true
  },
  "productTagIds": {
    label: "Product Tags",
    type: Array,
    optional: true
  },
  "productTagIds.$": String,
  "productVendor": {
    label: "Product Vendor",
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    label: "Wishlist Item shopId"
  },
  "subtotal": Money,
  "title": {
    type: String,
    label: "WishlistItem Title"
  },
  "updatedAt": Date,
  "variantId": {
    type: String,
    optional: true
  },
  "variantTitle": {
    type: String,
    optional: true
  }
});

/**
 * @name Wishlist
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} shopId required, Wishlist ShopId
 * @property {String} accountId Account ID for account wishlists, or null for anonymous
 * @property {String} anonymousAccessToken Token for accessing anonymous wishlists, null for account wishlists
 * @property {String} email optional
 * @property {WishlistItem[]} items Array of WishlistItem optional
 * @property {Number} discount optional
 * @property {Workflow} workflow optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 * @property {String} sessionId Optional and deprecated
 */
export const Wishlist = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    label: "Wishlist ShopId"
  },
  "accountId": {
    type: String,
    optional: true
  },
  "currencyCode": String,
  "sessionId": {
    type: String,
    optional: true
  },
  "email": {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email
  },
  "items": {
    type: Array,
    optional: true
  },
  "items.$": {
    type: WishlistItem
  },
  "missingItems": {
    type: Array,
    optional: true
  },
  "missingItems.$": {
    type: WishlistItem
  },
  "discount": {
    type: Number,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date,
    optional: true
  }
});
