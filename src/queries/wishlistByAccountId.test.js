import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import wishlistByAccountId from "./wishlistByAccountId.js";

const shopId = "shopId";

beforeAll(() => {
  mockContext.collections.Wishlist = {
    findOne: jest.fn().mockName("Wishlist.findOne")
  };
});

test("for logged in account, expect to return a Promise that resolves to a wishlist", async () => {
  const wishlist = { _id: "wishlist" };
  const { accountId } = mockContext;
  mockContext.collections.Wishlist.findOne.mockReturnValueOnce(Promise.resolve(wishlist));

  const result = await wishlistByAccountId(mockContext, { accountId, shopId });
  expect(result).toEqual(wishlist);
  expect(mockContext.collections.Wishlist.findOne).toHaveBeenCalledWith({ accountId, shopId });
});

test("for other account, allows if admin", async () => {
  const wishlist = { _id: "wishlist" };
  const accountId = "123";
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Wishlist.findOne.mockReturnValueOnce(Promise.resolve(wishlist));

  const result = await wishlistByAccountId(mockContext, { accountId, shopId });
  expect(result).toEqual(wishlist);
  expect(mockContext.collections.Wishlist.findOne).toHaveBeenCalledWith({ accountId, shopId });
});

test("for other account, throws access denied if non-admin", async () => {
  const wishlist = { _id: "wishlist" };
  const accountId = "123";
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockContext.collections.Wishlist.findOne.mockReturnValueOnce(Promise.resolve(wishlist));

  expect(wishlistByAccountId(mockContext, { accountId, shopId })).rejects.toMatchSnapshot();
});
