import React, { useEffect } from 'react';

import './index.css';

function Header() {
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = (event) => {
    if(window.scrollY >= 120) {
      document.getElementById('header').classList.remove('header');
      document.getElementById('header').classList.add('header-scrolled');

      document.getElementById('header-search-white').classList.add('header-icon-hideup');
      document.getElementById('header-search-black').classList.remove('header-icon-hideup');
    } else {
      document.getElementById('header').classList.add('header');
      document.getElementById('header').classList.remove('header-scrolled');

      document.getElementById('header-search-white').classList.remove('header-icon-hideup');
      document.getElementById('header-search-black').classList.add('header-icon-hideup');
    }
  };

  return (
    <header id = "header" className = "header noselect">
      <img src = {require('../../logo.svg')} alt = "Logo" />
      <img src = {require('../../icons/search-white.svg')} id = "header-search-white" className = "header-search-icon" alt = "Search" />
      <img src = {require('../../icons/search-black.svg')} id = "header-search-black" className = "header-search-icon header-icon-hideup" alt = "Search" />
    </header>
  );
}

export default Header;
