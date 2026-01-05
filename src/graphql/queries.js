/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAuthConfig = /* GraphQL */ `
  query GetAuthConfig($id: ID!) {
    getAuthConfig(id: $id) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const listAuthConfigs = /* GraphQL */ `
  query ListAuthConfigs(
    $filter: ModelAuthConfigFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAuthConfigs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        passwordHash
        type
        updatedAt
        createdAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSettings = /* GraphQL */ `
  query GetSettings($id: ID!) {
    getSettings(id: $id) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSettings = /* GraphQL */ `
  query ListSettings(
    $filter: ModelSettingsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSettings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        passwordRequired
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCategory = /* GraphQL */ `
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      name
      description
      order
      links {
        nextToken
        __typename
      }
      isLive
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCategories = /* GraphQL */ `
  query ListCategories(
    $filter: ModelCategoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCategories(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        order
        isLive
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLink = /* GraphQL */ `
  query GetLink($id: ID!) {
    getLink(id: $id) {
      id
      categoryId
      category {
        id
        name
        description
        order
        isLive
        createdAt
        updatedAt
        __typename
      }
      title
      description
      url
      order
      isNew
      isUpdated
      lastUpdated
      isLive
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listLinks = /* GraphQL */ `
  query ListLinks(
    $filter: ModelLinkFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLinks(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
