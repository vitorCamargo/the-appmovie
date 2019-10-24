import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import moment from 'moment';

import Home from './pages/home';
import Movie from './pages/movie';

import 'moment/locale/pt-br';

moment.locale('pt-BR');

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path = "/" exact component = { Home } />
        <Route path = "/movie/:id" exact component = { Movie } />

        <Route path = "/*" component = { Home } />
      </Switch>
    </BrowserRouter>
  );
}

export default App;