import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import addWishlistItems from "./addWishlistItems.js";

jest.mock("../util/addWishlistItems", () => jest.fn().mockImplementation(() => Promise.resolve({
  incorrectPriceFailures: [],
  minOrderQuantityFailures: [],
  updatedItemList: []
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
    findOne: jest.fn().mockName("Wishlist.findOne")
  };
});

test("add an item to an existing anonymous wishlist", async () => {
  mockContext.collections.Wishlist.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "wishlistId",
    items: []
  }));

  const result = await addWishlistItems(mockContext, {
    wishlistId: "wishlistId",
    items,
    wishlistToken: "TOKEN"
  });

  expect(result).toEqual({
    wishlist: {
      _id: "wishlistId",
      items: [],
      updatedAt: jasmine.any(Date)
    },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: []
  });
});
