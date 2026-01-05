/* Custom GraphQL queries (not generated). */

export const listCategoriesWithLinks = /* GraphQL */ `
  query ListCategoriesWithLinks($limit: Int, $nextToken: String) {
    listCategories(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        order
        isLive
        links(limit: 1000) {
          items {
            id
            categoryId
            title
            description
            url
            order
            isNew
            isUpdated
            lastUpdated
            isLive
          }
          nextToken
        }
      }
      nextToken
    }
  }
`;


