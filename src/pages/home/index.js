import React, { useEffect, useState, useRef } from 'react';
import YoutubeBackground from 'react-youtube-background';
import { Redirect } from 'react-router-dom';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { ResponsiveBar } from '@nivo/bar';

import axios from 'axios';
import moment from 'moment';
import Header from '../../components/header';

import './index.css';

const BASE_IMG_URL = 'https://image.tmdb.org/t/p/original/';
const API_KEY = '6f228a124b52956ac305a349079b7f2b';
const LANGUAGE = 'pt-BR';
const REGION = 'BR';

function Home() {
  const [nav, setNav] = useState('');
  const [moviesStreaming, setMoviesStreaming] = useState({
    movies: [],
    loading: true,
    current: 0
  });
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [filterYear, setFilterYear] = useState({
    value: 0,
    values: []
  });
  const [filterOrder, setFilterOrder] = useState({
    value: 0,
    values: ['Mais Votado', 'Menos Votado']
  });
  const [filterVisiblity, setFilterVisiblity] = useState({
    value: 0,
    values: ['Cards', 'Gráfico']
  });
  const [moviesFiltered, setMoviesFiltered] = useState({
    movies: [],
    loading: true
  });

  useInterval(() => nextSlide(true), 8000);

  useEffect(() => {
    axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((res) => {
      let movies = res.data.results.slice(0, 3);

      movies.forEach((movie, index) => {
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resMovie) => {
          movies[index] = resMovie.data;
          movies[index].cast = [];
          movies[index].video = null;

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

    let listYears = [];
    for(let i = 0; i < 20; i++)
      listYears.push(moment().subtract(1 * i, 'years'));

    setFilterYear({ ...filterYear, values: listYears });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios.get(`https://api.themoviedb.org/3/movie/top_rated?${filterYear.value === 0 ? '' : 'primary_release_year=' + filterYear.value + '&'}api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((res) => {
      let movies = res.data.results.slice(0, 6).sort((a, b) => (b.vote_count - a.vote_count));
      console.log(movies);

      movies.forEach((movie, index) => {
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resMovie) => {
          movies[index] = resMovie.data;
          movies[index].video = null;

          axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos?type='Trailer'&api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resVideo) => {
            movies[index].video = resVideo.data.results.length > 0 ? resVideo.data.results[0] : null;
            setMoviesFiltered({
              ...moviesFiltered,
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
  }, [filterYear]);

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
  // eslint-disable-next-line
  const moviesFilteredSorted = filterOrder.value !== 0 ? moviesFiltered.movies.reduceRight((a, c) => (a.push(c), a), []) : moviesFiltered.movies;

  if(nav) return (<Redirect to = {nav} />);
  else {
    return (
      !moviesStreaming.loading && !moviesFiltered.loading ? (
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
                      <p className = "home-slide-header-control-secondary"> { currentMovie.runtime }min </p>
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

          <div className = "home-second-block" style = {{ background: `url(${require('../../images/background-highlight.svg')}) no-repeat` }}>
            <div className = "home-slide-next-slide noselect">
              <img onClick = { () => nextSlide(false) } className = "home-slide-next-slide-image" src = {`${BASE_IMG_URL}${nextMovie.poster_path}`} alt = "Próximo Filme" />
              <span onClick = { () => nextSlide(false) } className = "home-slide-next-slide-title"> PRÓXIMO </span>
              <span onClick = { () => nextSlide(false) } className = "home-slide-next-slide-name"> { nextMovie.title } </span>
              <img onClick = { () => nextSlide(false) } className = "home-slide-next-slide-icon" src = {require('../../icons/next-slide.svg')} alt = "Próximo Filme" />
            </div>
            
            <div className = "home-second-block-responsive">
              <div className = "home-second-block-title"> Destaques </div>

              <div className = "home-highlight-control">
                <div className = "home-highlight-year">
                  <div className = "home-highlight-title"> ANO </div>

                  <div className = "home-highlight-dropdown noselect">
                    <span> { filterYear.value === 0 ? 'De Todos' : filterYear.value } </span>
                    <img src = {require('../../icons/down.svg')} alt = "dropdown" />

                    <div>
                      <p onClick = { () => setFilterYear({ ...filterYear, value: 0 }) }> Todos </p>
                      { filterYear.values.map((year) => (
                        <p key = { year.format('YYYY') } onClick = { () => setFilterYear({ ...filterYear, value: year.format('YYYY') }) }> { year.format('YYYY') } </p>
                      )) }
                    </div>
                  </div>
                </div>

                <div className = "home-highlight-order">
                  <div className = "home-highlight-title"> ORDENAR POR </div>

                  <div className = "home-highlight-dropdown noselect">
                    <span> { filterOrder.values[filterOrder.value] } </span>
                    <img src = {require('../../icons/down.svg')} alt = "dropdown" />

                    <div className = "noScroll">
                      { filterOrder.values.map((order, index) => (
                        <p key = { order } onClick = { () => setFilterOrder({ ...filterOrder, value: index }) }> { order } </p>
                      )) }
                    </div>
                  </div>
                </div>

                <div className = "home-highlight-visiblity">
                  <div className = "home-highlight-title"> VISUALIZAR POR </div>

                  <div className = "home-highlight-dropdown noselect">
                    <span> { filterVisiblity.values[filterVisiblity.value] } </span>
                    <img src = {require('../../icons/down.svg')} alt = "dropdown" />

                    <div className = "noScroll">
                      { filterVisiblity.values.map((visibility, index) => (
                        <p key = { visibility } onClick = { () => setFilterVisiblity({ ...filterVisiblity, value: index }) }> { visibility } </p>
                      )) }
                    </div>
                  </div>
                </div>
              </div>
            
              { filterVisiblity.value === 0 ? (
                <div className = "home-movies-highlighted">
                  { moviesFilteredSorted.map((movie) => (
                    <div key = { movie.id } className = "home-movies-highlighted-container">
                      <div className = "home-movies-highlighted-img">
                        <div className = "home-movies-highlighted-img-filter no-select" onClick = { () => setNav(`/movie/${movie.id}`) }>
                          <div className = "home-movies-highlighted-img-filter-see-more">
                            <img src = {require('../../icons/see-more.svg')} alt = "Ver Mais" />
                            <p> Ver Mais </p>
                          </div>
                        </div>

                        <img src = {`${BASE_IMG_URL}${movie.poster_path}`} alt = { movie.title } />
                      </div>

                      <div className = "home-movies-highlighted-header">
                        <div style = {{ width: 40, marginRight: 5, height: '100%', marginTop: 'auto' }}>
                          <CircularProgressbarWithChildren value = { movie.vote_average * 10 }>
                            <span className = "home-movies-highlighted-header-rate">
                              { movie.vote_average * 10 }
                              <span>%</span>
                            </span>
                          </CircularProgressbarWithChildren>
                        </div>

                        <div>
                          <p className = "home-movies-highlighted-title"> { movie.title } </p>
                          <p className = "home-movies-highlighted-details"> { movie.runtime }min | { movie.genres && movie.genres.length > 0 ? movie.genres[0].name : '' } </p>
                        </div>
                      </div>
                    </div>
                  )) }
                </div>
              ) : (
                <div style = {{ height: 1000, width: 1000 }}>
                <ResponsiveBar
                  data = {moviesFilteredSorted.map(e => { return { title: e.title, vote: 10 * e.vote_average } })}
                  keys = {[ 'vote' ]}
                  indexBy = "title"
                  margin = {{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding = {0.3}
                  maxValue = {100}
                  layout="horizontal"
                  colors={{ scheme: 'red_yellow_blue' }}
                  defs={[
                      {
                          id: 'dots',
                          type: 'patternDots',
                          background: 'inherit',
                          color: '#38bcb2',
                          size: 4,
                          padding: 1,
                          stagger: true
                      },
                      {
                          id: 'lines',
                          type: 'patternLines',
                          background: 'inherit',
                          color: '#eed312',
                          rotation: -45,
                          lineWidth: 6,
                          spacing: 10
                      }
                  ]}
                  fill={[
                      {
                          match: {
                              id: 'fries'
                          },
                          id: 'dots'
                      },
                      {
                          match: {
                              id: 'sandwich'
                          },
                          id: 'lines'
                      }
                  ]}
                  borderColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'country',
                      legendPosition: 'middle',
                      legendOffset: 32
                  }}
                  axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'food',
                      legendPosition: 'middle',
                      legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                  legends={[]}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                /></div>
              ) }
            </div>
          </div>
        </>
      ) : (
        <div />
      )
    );
  }
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
