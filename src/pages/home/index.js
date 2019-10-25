import React, { useEffect, useState, useRef } from 'react';
import YoutubeBackground from 'react-youtube-background';

import axios from 'axios';
import Header from '../../components/header';

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
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  useInterval(() => nextSlide(true), 8000);

  useEffect(() => {
    axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((res) => {
      let movies = res.data.results.slice(0, 3);

      movies.forEach((movie, index) => {
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resMovie) => {
          movies[index] = resMovie.data;
          movies[index].cast = [];

          axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos?type='Trailer'&api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resVideo) => {
            movies[index].video = resVideo.data.results.length > 0 ? resVideo.data.results[0] : null;
            setMoviesStreaming({
              ...moviesStreaming,
              movies: movies,
              loading: false
            });
          });

          axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resCast) => {
            movies[index].cast = resCast.data.cast.slice(0, 2);
            setMoviesStreaming({
              ...moviesStreaming,
              movies: movies,
              loading: false
            });
          });
        });
      });
    }).catch((err) => {
      console.log(err);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextSlide = (isAutomatic) => {
    const currentSlide = moviesStreaming.current;

    if((isAutomatic && !isPlayingTrailer)|| !isAutomatic) {
      if(currentSlide < moviesStreaming.movies.length - 1) {
        setMoviesStreaming({ ...moviesStreaming, current: currentSlide + 1 });
      } else {
        setMoviesStreaming({ ...moviesStreaming, current: 0 });
      }
    }
  };

  const nextSlideIndex = () => {
    const currentSlide = moviesStreaming.current;

    if(currentSlide < moviesStreaming.movies.length - 1) {
      return currentSlide + 1;
    } else {
      return 0;
    }
  };

  const currentMovie = moviesStreaming.movies[moviesStreaming.current];
  const nextMovie = moviesStreaming.movies[nextSlideIndex()];
  console.log(currentMovie, isPlayingTrailer);
  return (
    !moviesStreaming.loading ? (
      <>
        <Header />

        <YoutubeBackground className = "teste" videoId = { isPlayingTrailer ? currentMovie.video.key : '' } onReady = { (e) => e.target.unMute() } onEnd = { () => nextSlide(false) }>
          <div className = "home-first-block" style = { !isPlayingTrailer ? { background: `linear-gradient(90.07deg, rgba(0, 0, 0, 0.82) 22.31%, rgba(0, 0, 0, 0.11) 89.46%), url(${BASE_IMG_URL + currentMovie.backdrop_path})` } : { background: `linear-gradient(90.07deg, rgba(0, 0, 0, 0.82) 22.31%, rgba(0, 0, 0, 0.11) 89.46%)` }}>
            <div className = "home-first-block-responsive">
              <div className = "home-slide-header">
                <div className = "home-slide-header-control">
                  <div>
                    <p className = "home-slide-header-control-primary"> Com </p>
                    { currentMovie.cast.map(actor => (
                      <p key = { actor.id } className = "home-slide-header-control-secondary"> { actor.name } </p>
                    )) }
                  </div>

                  <div style = {{ marginTop: 'auto', marginLeft: 40 }}>
                    <p className = "home-slide-header-control-secondary"> { currentMovie.runtime } min </p>
                    <p className = "home-slide-header-control-secondary" style = {{ fontStyle: 'italic' }}>
                      { currentMovie.genres.map((genre, index) => (
                        <span key = { genre.id }> { genre.name }{ currentMovie.genres.length - 1 !== index ? ', ' : '.' } </span>
                      )) }
                    </p>
                  </div>
                </div>

                <div className = "home-slide-header-title"> { currentMovie.title } </div>
              </div>
              
              <div className = "home-slide-player noselect">
                { !isPlayingTrailer && currentMovie.video ? (
                  <img onClick = { () => setIsPlayingTrailer(!isPlayingTrailer) } src = {require('../../icons/play-white.svg')} alt = "Ver Trailer" />
                ) : (<div />) }
              </div>
            </div>
          </div>
        </YoutubeBackground>

        <div style = {{ height: 1000, position: 'relative' }}>
          <div className = "home-slide-next-slide noselect">
            <img onClick = { () => nextSlide(false) } className = "home-slide-next-slide-image" src = {`${BASE_IMG_URL}${nextMovie.poster_path}`} alt = "Próximo Filme" />
            <span onClick = { () => nextSlide(false) } className = "home-slide-next-slide-title"> PRÓXIMO </span>
            <span onClick = { () => nextSlide(false) } className = "home-slide-next-slide-name"> { nextMovie.title } </span>
            <img onClick = { () => nextSlide(false) } className = "home-slide-next-slide-icon" src = {require('../../icons/next-slide.svg')} alt = "Próximo Filme" />
          </div>

          kkkkkkkkkkkkkkk
        </div>
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
