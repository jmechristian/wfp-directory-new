export default function reducer(state, action) {
  switch (action.type) {
    case 'SEARCH':
      return {
        ...state,
        searchValue: action.payload,
        isSearching: true,
      };
    case 'ICONSEARCH':
      return {
        ...state,
        searchValue: action.payload,
        isSearching: true,
      };
    case 'CLEAR':
      return {
        ...state,
        searchValue: '',
        isSearching: false,
      };
    default:
      return state;
  }
}
