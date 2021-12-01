import createWishlist from "./createWishlist.js";

const shopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
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

test("correctly passes through to mutations.createWishlist", async () => {
  const fakeResult = {
    wishlist: {
      _id: "123"
    },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: [],
    token: "TOKEN"
  };

  const mockMutation = jest.fn().mockName("mutations.createWishlist");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      createWishlist: mockMutation
    }
  };

  const result = await createWishlist(null, {
    input: {
      items,
      shopId: opaqueShopId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    items: [{
      productConfiguration: {
        productId,
        productVariantId
      },
      quantity: 1
    }],
    shopId
  });
});
