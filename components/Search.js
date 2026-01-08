import React, { useEffect, useState, useContext } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import SearchState from '../data/context';
import { orderBy } from 'lodash';

const Search = ({ categories = [] }) => {
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

  const jumpCategories = orderBy(
    (categories || []).filter((c) => Boolean(c) && c?.isLive !== false),
    [(c) => c?.order ?? 0],
    ['asc']
  );

  const jumpToCategory = async (e) => {
    const anchorId = e.target.value;
    if (!anchorId) return;

    // Ensure we're in "browse" mode (not showing search results) so the target exists.
    if (state.isSearching) {
      await dispatch({ type: 'CLEAR' });
      setSearchValue('');
    }

    // Defer until after render.
    setTimeout(() => {
      if (anchorId === 'page-top') {
        const topEl = document.getElementById('page-top');
        if (topEl) topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      const el = document.getElementById(anchorId);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  return (
    <>
      <div className='header__controls'>
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

        <div className='jump__bar'>
          <select
            className='jump__select'
            defaultValue=''
            onChange={jumpToCategory}
            disabled={!jumpCategories.length}
            aria-label='Jump to category'
          >
            <option value='' disabled>
              Jump to category…
            </option>
            <option value='page-top'>Back to top</option>
            {jumpCategories.map((c) => (
              <option key={c.id} value={`cat-${c.id}`}>
                {c?.name || 'Untitled'}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default Search;
