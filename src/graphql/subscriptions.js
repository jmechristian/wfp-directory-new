/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateAuthConfig = /* GraphQL */ `
  subscription OnCreateAuthConfig(
    $filter: ModelSubscriptionAuthConfigFilterInput
  ) {
    onCreateAuthConfig(filter: $filter) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const onUpdateAuthConfig = /* GraphQL */ `
  subscription OnUpdateAuthConfig(
    $filter: ModelSubscriptionAuthConfigFilterInput
  ) {
    onUpdateAuthConfig(filter: $filter) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const onDeleteAuthConfig = /* GraphQL */ `
  subscription OnDeleteAuthConfig(
    $filter: ModelSubscriptionAuthConfigFilterInput
  ) {
    onDeleteAuthConfig(filter: $filter) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const onCreateSettings = /* GraphQL */ `
  subscription OnCreateSettings($filter: ModelSubscriptionSettingsFilterInput) {
    onCreateSettings(filter: $filter) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateSettings = /* GraphQL */ `
  subscription OnUpdateSettings($filter: ModelSubscriptionSettingsFilterInput) {
    onUpdateSettings(filter: $filter) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteSettings = /* GraphQL */ `
  subscription OnDeleteSettings($filter: ModelSubscriptionSettingsFilterInput) {
    onDeleteSettings(filter: $filter) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateCategory = /* GraphQL */ `
  subscription OnCreateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onCreateCategory(filter: $filter) {
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
export const onUpdateCategory = /* GraphQL */ `
  subscription OnUpdateCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onUpdateCategory(filter: $filter) {
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
export const onDeleteCategory = /* GraphQL */ `
  subscription OnDeleteCategory($filter: ModelSubscriptionCategoryFilterInput) {
    onDeleteCategory(filter: $filter) {
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
export const onCreateLink = /* GraphQL */ `
  subscription OnCreateLink($filter: ModelSubscriptionLinkFilterInput) {
    onCreateLink(filter: $filter) {
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
export const onUpdateLink = /* GraphQL */ `
  subscription OnUpdateLink($filter: ModelSubscriptionLinkFilterInput) {
    onUpdateLink(filter: $filter) {
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
export const onDeleteLink = /* GraphQL */ `
  subscription OnDeleteLink($filter: ModelSubscriptionLinkFilterInput) {
    onDeleteLink(filter: $filter) {
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
