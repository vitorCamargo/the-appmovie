import React, { useEffect, useState, useRef } from 'react';
import YoutubeBackground from 'react-youtube-background';
import { Redirect } from 'react-router-dom';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { ResponsiveBar } from '@nivo/bar';
import BounceLoader from 'react-spinners/BounceLoader';

import axios from 'axios';
import moment from 'moment';
import Header from '../../components/header';
import Footer from '../../components/footer';

import './index.css';

import { BASE_IMG_URL, API_KEY, LANGUAGE, REGION } from '../../consts';

const Home = () => {
  const searchArea = React.createRef();

  const [nav, setNav] = useState('');
  const [moviesSearched, setMoviesSearched] = useState([]);
  const [searchBar, setSearchBar] = useState({
    text: '',
    visible: false
  });
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
      let movies = res.data.results.filter(f => f.poster_path && f.backdrop_path).sort((a, b) => (b.vote_count - a.vote_count));

      movies.forEach((movie, index) => {
        axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resMovie) => {
          movies[index] = resMovie.data;
          setMoviesFiltered({
            ...moviesFiltered,
            movies: movies,
            loading: false
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

  const closeSearchBar = () => {
    setSearchBar({ visible: false, text: '' });
    setMoviesSearched([]);
  };

  const searchMovies = (e) => {
    if(!(window.scrollY >= searchArea.current.offsetTop && window.scrollY <= searchArea.current.offsetTop + searchArea.current.getBoundingClientRect().height)) {
      window.scrollTo(0, searchArea.current.offsetTop - 50);
    }

    setSearchBar({ ...searchBar, text: e.target.value });

    if(e.target.value) {
      axios.get(`https://api.themoviedb.org/3/search/movie?query=${e.target.value}&api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((res) => {
        let movies = res.data.results.filter(f => f.poster_path && f.backdrop_path).slice(0, 8);

        movies.forEach((movie, index) => {
          axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resMovie) => {
            movies[index] = resMovie.data;
            movies[index].video = null;
            setMoviesSearched(movies);
          });
        });
      }).catch((err) => {
        console.log(err);
      });
    } else {
      setMoviesSearched([]);
    }
  };

  // eslint-disable-next-line
  const moviesFilteredSorted = filterOrder.value !== 0 ? moviesFiltered.movies.reduceRight((a, c) => (a.push(c), a), []).slice(0, 6).sort((a, b) => (b.vote_count - a.vote_count)) : moviesFiltered.movies.slice(0, 6).sort((a, b) => (a.vote_count - b.vote_count));
  const currentMovie = moviesStreaming.movies[moviesStreaming.current];
  const nextMovie = moviesStreaming.movies[nextSlideIndex()];

  if(nav) return (<Redirect to = {nav} />);
  else {
    return (
      !moviesStreaming.loading && !moviesFiltered.loading ? (
        <>
          <Header hasSearchBar searchMovies = { searchMovies } searchBar = { searchBar } closeSearchBar = { closeSearchBar } toggleSearchBar = { () => setSearchBar({ ...searchBar, visible: true }) } />

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

                  <div style = {{ fontSize: `${Math.floor(currentMovie.title.length >= 30 ? currentMovie.title.length/8 : 5)}vw` }} className = "home-slide-header-title"> { currentMovie.title } </div>
                </div>
                
                <div className = "home-slide-player noselect">
                  { !isPlayingTrailer && currentMovie.video ? (
                    <img onClick = { () => setIsPlayingTrailer(!isPlayingTrailer) } src = {require('../../icons/play-white.svg')} alt = "Ver Trailer" />
                  ) : (<div />) }
                </div>
              </div>
            </div>
          </YoutubeBackground>

          <div ref = { searchArea } className = "home-second-block" style = {{ background: `url(${require('../../images/background-highlight.svg')}) no-repeat` }}>
            <div className = "home-slide-next-slide noselect">
              <img onClick = { () => nextSlide(false) } className = "home-slide-next-slide-image" src = {`${BASE_IMG_URL}${nextMovie.poster_path}`} alt = "Próximo Filme" />
              <span onClick = { () => nextSlide(false) } className = "home-slide-next-slide-title"> PRÓXIMO </span>
              <span onClick = { () => nextSlide(false) } className = "home-slide-next-slide-name"> { nextMovie.title } </span>
              <img onClick = { () => nextSlide(false) } className = "home-slide-next-slide-icon" src = {require('../../icons/next-slide.svg')} alt = "Próximo Filme" />
            </div>
            
            <div className = "home-second-block-responsive">
              <div className = "home-second-block-title"> { searchBar.visible && moviesSearched.length > 0 ? 'Resultado' : 'Destaques' } </div>

              { searchBar.visible && moviesSearched.length > 0 ? (
                <div className = "home-movies-highlighted">
                  { moviesSearched.map((movie) => (
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

                        <div style = {{ width: 'calc(100% - 45px)' }}>
                          <p className = "home-movies-highlighted-title"> { movie.title } </p>
                          <p className = "home-movies-highlighted-details"> { movie.runtime }min | { movie.genres && movie.genres.length > 0 ? movie.genres[0].name : '' } </p>
                        </div>
                      </div>
                    </div>
                  )) }
                </div>
              ) : (
                <>
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

                            <div style = {{ width: 'calc(100% - 45px)' }}>
                              <p className = "home-movies-highlighted-title"> { movie.title } </p>
                              <p className = "home-movies-highlighted-details"> { movie.runtime }min | { movie.genres && movie.genres.length > 0 ? movie.genres[0].name : '' } </p>
                            </div>
                          </div>
                        </div>
                      )) }
                    </div>
                  ) : (
                    <div className = "home-movies-highlighted-graph">
                      <ResponsiveBar
                        data = { moviesFilteredSorted } colors = {['#FF003C']}
                        labelTextColor = "#FFF" keys = {['vote_count']}
                        indexBy = "title" margin = {{ top: 50, bottom: 80, left: 6, right: 4 }}
                        padding = {0.3} axisLeft = {null}
                        layout = "horizontal"
                        axisBottom = {{
                          tickSize: 5, tickPadding: 5, tickRotation: -41,
                          legend: 'Votos', legendPosition: 'middle', legendOffset: 50
                        }}
                        labelSkipWidth = {12} labelSkipHeight = {12}
                        legends = {[]} animate = {true} motionStiffness = {90} motionDamping = {15}
                        tooltip = { d => (
                          <div className = "home-movies-highlighted-graph-tooltip">
                            <img src = {`${BASE_IMG_URL}${d.data.poster_path}`} alt = { d.data.title } />

                            <div>
                              <p className = "home-movies-highlighted-title"> { d.data.title } ({ d.data.release_date.slice(0, 4) }) </p>
                              <p className = "home-movies-highlighted-details"> { d.data.runtime }min | { d.data.genres && d.data.genres.length > 0 ? d.data.genres[0].name : '' } </p>
                              <p className = "home-movies-highlighted-details"> { d.data.vote_count } votos, ({ d.data.vote_average * 10 }%) </p>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  )}
                </>                
              )}
            </div>
          </div>

          <Footer />
        </>
      ) : (
        <div className = "loading">
          <BounceLoader sizeUnit = "px" size = {150} color = "#FF003C" loading = {true} />
        </div>
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
