import addWishlistItems from "./addWishlistItems.js";

const internalWishlistId = "555";
const opaqueWishlistId = "cmVhY3Rpb24vd2lzaGxpc3Q6NTU1";
const productId = "444";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo0NDQ=";
const productVariantId = "555";
const opaqueProductVariantId = "cmVhY3Rpb24vcHJvZHVjdDo1NTU=";

const items = [{
  productConfiguration: {
    productId: opaqueProductId,
    productVariantId: opaqueProductVariantId
  },
  quantity: 1
}];

test("correctly passes through to mutations.addWishlistItems", async () => {
  const fakeResult = {
    wishlist: { _id: "123" },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: []
  };

  const mockMutation = jest.fn().mockName("mutations.addWishlistItems");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      addWishlistItems: mockMutation
    }
  };

  const result = await addWishlistItems(null, {
    input: {
      wishlistId: opaqueWishlistId,
      clientMutationId: "clientMutationId",
      items
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    wishlistId: internalWishlistId,
    items: [{
      productConfiguration: {
        productId,
        productVariantId
      },
      quantity: 1
    }]
  });
});
