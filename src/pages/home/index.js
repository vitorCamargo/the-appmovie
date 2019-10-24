import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';

import './index.css';

const BASE_IMG_URL = 'https://image.tmdb.org/t/p/original/';
const API_KEY = '6f228a124b52956ac305a349079b7f2b';
const LANGUAGE = 'pt-BR';
const REGION = 'BR';

function Home() {
  const [moviesStreaming, setMoviesStreaming] = useState({
    movies: [],
    loading: true,
    current: 0
  });

  useInterval(() => nextSlide(), 8000);

  useEffect(() => {
    // axios.get('https://api.themoviedb.org/3/discover/movie?sort_by=primary_release_date.desc&primary_release_date.lte=2019-10-23&api_key=6f228a124b52956ac305a349079b7f2b&language=pt-BR').then((res) => {
    // axios.get('https://api.themoviedb.org/3/movie/420809?api_key=6f228a124b52956ac305a349079b7f2b&language=pt-BR').then((res) => {
    // axios.get('https://api.themoviedb.org/3/movie/475557/videos?api_key=6f228a124b52956ac305a349079b7f2b&append_to_response=videos').then((res) => {
    //   console.log(res.data);
    // }).catch((err) => {
    //   console.log(err);
    // });

    axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((res) => {
      setMoviesStreaming({
        ...moviesStreaming,
        movies: res.data.results.slice(0, 3),
        loading: false
      });
    }).catch((err) => {
      console.log(err);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const prevSlide = () => {
  //   const currentSlide = moviesStreaming.current;

  //   if(currentSlide > 0) {
  //     setMoviesStreaming({ ...moviesStreaming, current: currentSlide - 1 });
  //   } else {
  //     setMoviesStreaming({ ...moviesStreaming, current: moviesStreaming.movies.length - 1 });
  //   }
  // };

  const nextSlide = () => {
    const currentSlide = moviesStreaming.current;

    if(currentSlide < moviesStreaming.movies.length - 1) {
      setMoviesStreaming({ ...moviesStreaming, current: currentSlide + 1 });
    } else {
      setMoviesStreaming({ ...moviesStreaming, current: 0 });
    }
  };

  const currentMovie = moviesStreaming.movies[moviesStreaming.current];
  console.log(currentMovie);
  return (
    !moviesStreaming.loading ? (
      <>
        <header class = "header">
          mmmmm
        </header>

        <div style = {{ height: '100vh', background: `url(${BASE_IMG_URL + currentMovie.backdrop_path})` }}>
          { currentMovie.title }
        </div>

        <div>kkkkkkkkkkkkkkk</div>
      </>
    ) : (
      <div />
    )
  );
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default Home;
