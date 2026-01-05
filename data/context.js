import { createContext } from 'react';

const SearchState = createContext({
  searchValue: '',
  isSearching: false,
});

export default SearchState;
