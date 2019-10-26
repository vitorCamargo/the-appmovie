import React from 'react';
import { Link } from 'react-router-dom';

import './index.css';

const Footer = () => {
  return (
    <div style = {{ background: '#FFF', padding: 30, textAlign: 'center' }}>
      <div className = "footer-redes-sociais">
        <div style = {{ width: '50%', textAlign: 'left', marginTop: 20 }}>
          <span style = {{ color: '#2D2E2E', fontSize: 11, fontWeight: 800 }}> © 2019. </span>
          <span style = {{ color: '#2D2E2E', fontSize: 11 }}> Vitor Bueno de Camargo </span>
        </div>

        <div style = {{ width: '50%', textAlign: 'right', marginTop: 20 }}>
          <Link to = "/">
            <img src = {require('../../logo.svg')} style = {{ height: 30 }} alt = "Logo" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;