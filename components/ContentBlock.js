import React, { useContext } from 'react';
import CategoryBlock from './CategoryBlock';
import LinkBlock from './LinkBlock';
import SearchState from '../data/context';
import { orderBy } from 'lodash';

const ContentBlock = ({ links, searchLinks }) => {
  const { state } = useContext(SearchState);

  return (
    <>
      {state.isSearching && (
        <div className='search__link__grid'>
          {searchLinks.map((el, index) => (
            <div key={index}>
              <div>
                <LinkBlock link={el} key={el.id || index} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!state.isSearching && (
        <>
          {orderBy(links || [], [(c) => c?.order ?? 0], ['asc']).map(
            (category) => (
              <div key={category.id}>
                <CategoryBlock name={category.name} desc={category.description} />
                <div className='link__grid'>
                  {orderBy(
                    (category?.links?.items || []).filter((l) => l?.isLive !== false),
                    [(l) => l?.order ?? 0],
                    ['asc']
                  ).map((link) => (
                    <LinkBlock link={link} key={link.id} />
                  ))}
                </div>
              </div>
            )
          )}
        </>
      )}
    </>
  );
};

export default ContentBlock;
