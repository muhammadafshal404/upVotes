import wishlistByAccountId from "./wishlistByAccountId.js";

const shopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const accountId = "444";
const opaqueAccountId = "cmVhY3Rpb24vYWNjb3VudDo0NDQ=";

test("calls queries.wishlistByAccountId and returns the result", async () => {
  const mockResponse = "MOCK_RESPONSE";
  const mockQuery = jest.fn().mockName("queries.wishlistByAccountId").mockReturnValueOnce(Promise.resolve(mockResponse));

  const context = {
    queries: { wishlistByAccountId: mockQuery },
    userId: "123"
  };

  const result = await wishlistByAccountId(null, {
    accountId: opaqueAccountId,
    shopId: opaqueShopId
  }, context);

  expect(result).toEqual(mockResponse);
  expect(mockQuery).toHaveBeenCalledWith(context, {
    accountId,
    shopId
  });
});
