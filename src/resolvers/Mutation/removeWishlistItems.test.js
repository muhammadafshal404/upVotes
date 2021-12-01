import removeWishlistItems from "./removeWishlistItems.js";

const internalWishlistId = "555";
const opaqueWishlistId = "cmVhY3Rpb24vd2lzaGxpc3Q6NTU1";
const wishlistToken = "TOKEN";
const wishlistItemIds = ["666"];
const opaqueWishlistItemIds = ["cmVhY3Rpb24vd2lzaGxpc3RJdGVtOjY2Ng=="];

test("correctly passes through to mutations.removeWishlistItems", async () => {
  const fakeResult = {
    wishlist: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.removeWishlistItems");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      removeWishlistItems: mockMutation
    }
  };

  const result = await removeWishlistItems(null, {
    input: {
      wishlistId: opaqueWishlistId,
      wishlistItemIds: opaqueWishlistItemIds,
      clientMutationId: "clientMutationId",
      wishlistToken
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    wishlistId: internalWishlistId,
    wishlistItemIds,
    wishlistToken
  });
});
