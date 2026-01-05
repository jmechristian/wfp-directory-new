import React from 'react';

const LinkBlock = ({ link }) => {
  const date = link.lastUpdated
    ? new Date(link.lastUpdated).toLocaleDateString()
    : '';
  return (
    <div className='link__container'>
      <div className='link__name'>
        <a href={`${link.url}`} target='_blank' rel='noopener noreferrer'>
          {link.title}
        </a>
        <div className='badge__container'>
          {link.isNew && <span className='badge badge--new'>New</span>}
        </div>
        <div className='updated__container'>
          {link.isUpdated && (
            <span className='badge badge--updated'>
              {' '}
              Updated {date}
            </span>
          )}
        </div>
      </div>
      <div className='link__description'>
        <p>{link.description}</p>
      </div>
    </div>
  );
};

export default LinkBlock;
