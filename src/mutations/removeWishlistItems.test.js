import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeWishlistItems from "./removeWishlistItems.js";

const dbWishlist = {
  _id: "wishlistId",
  items: []
};

const wishlistItemIds = ["wishlistItemId1", "wishlistItemId2"];

beforeAll(() => {
  if (!mockContext.mutations.saveWishlist) {
    mockContext.mutations.saveWishlist = jest.fn().mockName("context.mutations.saveWishlist").mockImplementation(async (_, wishlist) => wishlist);
  }

  mockContext.collections.Wishlist = {
    findOne: jest.fn().mockName("Wishlist.findOne")
  };
});

test("removes multiple items from account wishlist", async () => {
  mockContext.collections.Wishlist.findOne.mockReturnValueOnce(Promise.resolve(dbWishlist));

  const result = await removeWishlistItems(mockContext, { wishlistId: "wishlistId", wishlistItemIds });

  expect(mockContext.collections.Wishlist.findOne).toHaveBeenCalledWith({
    _id: "wishlistId",
    accountId: "FAKE_ACCOUNT_ID"
  });

  expect(result).toEqual({
    wishlist: {
      ...dbWishlist,
      items: dbWishlist.items.filter((item) => !wishlistItemIds.includes(item._id)),
      updatedAt: jasmine.any(Date)
    }
  });
});

test("throws when no account and no wishlistToken passed", async () => {
  const cachedAccountId = mockContext.accountId;
  mockContext.accountId = null;

  await expect(removeWishlistItems(mockContext, {
    wishlistId: "wishlistId",
    wishlistItemIds
  })).rejects.toThrowErrorMatchingSnapshot();

  mockContext.accountId = cachedAccountId;
});
