import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import createWishlist from "./createWishlist.js";

jest.mock("../util/addWishlistItems", () => jest.fn().mockImplementation(() => Promise.resolve({
  incorrectPriceFailures: [],
  minOrderQuantityFailures: [],
  updatedItemList: [
    {
      _id: "WishlistItemID",
      addedAt: new Date(),
      createdAt: new Date(),
      productId: "productId",
      quantity: 1,
      shopId: "shopId",
      title: "TITLE",
      updatedAt: new Date(),
      variantId: "variantId",
      price: {
        amount: 9.99,
        currencyCode: "USD"
      },
      priceWhenAdded: {
        amount: 9.99,
        currencyCode: "USD"
      },
      subtotal: {
        amount: 9.99,
        currencyCode: "USD"
      }
    }
  ]
})));

const items = [{
  productConfiguration: {
    productId: "444",
    productVariantId: "555"
  },
  quantity: 1
}];

beforeAll(() => {
  if (!mockContext.mutations.saveWishlist) {
    mockContext.mutations.saveWishlist = jest.fn().mockName("context.mutations.saveWishlist").mockImplementation(async (_, wishlist) => wishlist);
  }

  mockContext.collections.Wishlist = {
    insertOne: jest.fn().mockName("Wishlist.insertOne")
  };
});

test("throws access denied when creating a wishlist if no user is logged in", async () => {
  const originalAccountId = mockContext.accountId;
  mockContext.accountId = null;

  await expect(createWishlist({
    ...mockContext,
    userId: null
  }, {
    items,
    shopId: "123"
  })).rejects.toThrowError("Unauthorized users cannot create wishlists");

  mockContext.accountId = originalAccountId;
});
