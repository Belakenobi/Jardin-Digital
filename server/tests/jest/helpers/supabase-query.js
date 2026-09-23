import { jest } from "@jest/globals";

const CHAIN_METHODS = [
  "delete",
  "eq",
  "in",
  "insert",
  "limit",
  "maybeSingle",
  "order",
  "select",
  "single",
  "update",
];

export function createQuery(result) {
  const promise = Promise.resolve(result);
  const query = {
    then: (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected),
  };

  for (const method of CHAIN_METHODS) {
    query[method] = jest.fn(() => query);
  }

  return query;
}

export function createSupabaseSequence(queries, extra = {}) {
  let index = 0;
  const from = jest.fn(() => {
    if (index >= queries.length) {
      throw new Error("Unexpected Supabase query");
    }

    return queries[index++];
  });

  return {
    client: { from, ...extra },
    from,
    consumedQueries: () => index,
  };
}
