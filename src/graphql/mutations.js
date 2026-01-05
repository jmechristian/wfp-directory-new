/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAuthConfig = /* GraphQL */ `
  mutation CreateAuthConfig(
    $input: CreateAuthConfigInput!
    $condition: ModelAuthConfigConditionInput
  ) {
    createAuthConfig(input: $input, condition: $condition) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const updateAuthConfig = /* GraphQL */ `
  mutation UpdateAuthConfig(
    $input: UpdateAuthConfigInput!
    $condition: ModelAuthConfigConditionInput
  ) {
    updateAuthConfig(input: $input, condition: $condition) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const deleteAuthConfig = /* GraphQL */ `
  mutation DeleteAuthConfig(
    $input: DeleteAuthConfigInput!
    $condition: ModelAuthConfigConditionInput
  ) {
    deleteAuthConfig(input: $input, condition: $condition) {
      id
      passwordHash
      type
      updatedAt
      createdAt
      __typename
    }
  }
`;
export const createSettings = /* GraphQL */ `
  mutation CreateSettings(
    $input: CreateSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    createSettings(input: $input, condition: $condition) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateSettings = /* GraphQL */ `
  mutation UpdateSettings(
    $input: UpdateSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    updateSettings(input: $input, condition: $condition) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteSettings = /* GraphQL */ `
  mutation DeleteSettings(
    $input: DeleteSettingsInput!
    $condition: ModelSettingsConditionInput
  ) {
    deleteSettings(input: $input, condition: $condition) {
      id
      passwordRequired
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createCategory = /* GraphQL */ `
  mutation CreateCategory(
    $input: CreateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    createCategory(input: $input, condition: $condition) {
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
export const updateCategory = /* GraphQL */ `
  mutation UpdateCategory(
    $input: UpdateCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    updateCategory(input: $input, condition: $condition) {
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
export const deleteCategory = /* GraphQL */ `
  mutation DeleteCategory(
    $input: DeleteCategoryInput!
    $condition: ModelCategoryConditionInput
  ) {
    deleteCategory(input: $input, condition: $condition) {
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
export const createLink = /* GraphQL */ `
  mutation CreateLink(
    $input: CreateLinkInput!
    $condition: ModelLinkConditionInput
  ) {
    createLink(input: $input, condition: $condition) {
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
export const updateLink = /* GraphQL */ `
  mutation UpdateLink(
    $input: UpdateLinkInput!
    $condition: ModelLinkConditionInput
  ) {
    updateLink(input: $input, condition: $condition) {
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
export const deleteLink = /* GraphQL */ `
  mutation DeleteLink(
    $input: DeleteLinkInput!
    $condition: ModelLinkConditionInput
  ) {
    deleteLink(input: $input, condition: $condition) {
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
