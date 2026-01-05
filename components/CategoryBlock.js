import React from 'react';

const CategoryBlock = ({ name, desc }) => {
  return (
    <div className='category__wrapper'>
      <div className='category__name'>{name}</div>
      {desc && <div className='category__desc'>{desc}</div>}
    </div>
  );
};

export default CategoryBlock;
