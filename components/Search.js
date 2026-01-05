import React, { useEffect, useState, useContext } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import SearchState from '../data/context';

const Search = () => {
  const [searchValue, setSearchValue] = useState('');
  const { dispatch } = useContext(SearchState);
  const { state } = useContext(SearchState);

  // Auto-search once user has typed at least 3 characters (trimmed).
  useEffect(() => {
    const q = (searchValue || '').trim();

    if (q.length < 3) {
      dispatch({ type: 'CLEAR' });
      return;
    }

    const t = setTimeout(() => {
      dispatch({ type: 'SEARCH', payload: q });
    }, 150);

    return () => clearTimeout(t);
  }, [searchValue, dispatch]);

  const submitHandler = async (event) => {
    event.preventDefault();
    const q = (searchValue || '').trim();
    if (q.length < 3) return;
    await dispatch({ type: 'SEARCH', payload: q });
  };

  const iconSubmitHandler = async () => {
    const q = (searchValue || '').trim();
    if (q.length < 3) return;
    await dispatch({ type: 'SEARCH', payload: q });
  };

  const clearSearchHandler = async () => {
    await dispatch({ type: 'CLEAR' });
    setSearchValue('');
  };

  return (
    <>
      <div className='search__bar'>
        <form onSubmit={submitHandler}>
          <input
            type='text'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder='Search Directory'
          />
        </form>
        <div className='search__clear__button'>
          <div className='search__clear__button__text icon'>
            {state.isSearching ? (
              <div onClick={clearSearchHandler}>
                <XIcon />
              </div>
            ) : (
              <div onClick={iconSubmitHandler}>
                <SearchIcon />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
