import React, { useEffect } from 'react';

import './index.css';

function Header(props) {
  const { searchBar, toggleSearchBar, searchMovies, closeSearchBar } = props;

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    if(window.scrollY >= 120) {
      document.getElementById('header').classList.remove('header');
      document.getElementById('header').classList.add('header-scrolled');

      if(document.getElementById('header-search-white') && document.getElementById('header-search-black')) {
        document.getElementById('header-search-white').classList.add('header-icon-hideup');
        document.getElementById('header-search-black').classList.remove('header-icon-hideup');
      }
    } else {
      document.getElementById('header').classList.add('header');
      document.getElementById('header').classList.remove('header-scrolled');

      if(document.getElementById('header-search-white') && document.getElementById('header-search-black')) {
        document.getElementById('header-search-white').classList.remove('header-icon-hideup');
        document.getElementById('header-search-black').classList.add('header-icon-hideup');
      }
    }
  };

  const openSearchBar = () => {
    toggleSearchBar();
    
    if(document.getElementById("header-searchbar-input")) {
      document.getElementById("header-searchbar-input").focus();
    }
  }

  return (
    <header id = "header" className = "header noselect">
      <div className = "header-container">
        <img src = {require('../../logo.svg')} alt = "Logo" />

        <div style = {{ position: 'relative', height: 30, margin: 'auto 0' }}>
          <input value = { searchBar.text } onChange = { searchMovies } id = "header-searchbar-input" style = {{ background: `url(${require('../../icons/search-black.svg')}) no-repeat scroll, #FFF` }} className = { searchBar.visible ? 'header-searchbar-on' : 'header-searchbar-off' } placeholder = "Pesquise Filmes" />
          <img onClick = { closeSearchBar } src = {require('../../icons/close.svg')} className = { searchBar.visible ? 'header-searchbar-close-on' : 'header-searchbar-close-off' } alt = "Fechar Pesquisa" />
        </div>

        { !searchBar.visible ? (
          <>
            <img onClick = { openSearchBar } src = {require('../../icons/search-white.svg')} id = "header-search-white" className = "header-search-icon" alt = "Search" />
            <img onClick = { openSearchBar } src = {require('../../icons/search-black.svg')} id = "header-search-black" className = "header-search-icon header-icon-hideup" alt = "Search" />
          </>
        ) : null }
      </div>
    </header>
  );
}

export default Header;
