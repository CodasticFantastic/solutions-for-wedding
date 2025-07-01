export const METAOBJECTS_BY_IDS_QUERY = /* GraphQL */ `
  query MetaobjectsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        handle
        title: field(key: "title") { value }
        design_json: field(key: "design_json") { value }
      }
    }
  }
` as const; 