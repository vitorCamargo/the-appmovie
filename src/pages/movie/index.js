import React, { useEffect, useState } from 'react';
import YoutubeBackground from 'react-youtube-background';
import { Redirect } from 'react-router-dom';
import BounceLoader from 'react-spinners/BounceLoader';

import axios from 'axios';
import Header from '../../components/header';
import Footer from '../../components/footer';

import './index.css';

import { BASE_IMG_URL, API_KEY, LANGUAGE, REGION } from '../../consts';

const Movie = props => {
  const { id } = props.match.params;
  
  const [nav, setNav] = useState('');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [movie, setMovie] = useState({
    movie: {},
    loading: true
  });

  useEffect(() => {
    axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resMovie) => {
      let res = resMovie.data;
      res.cast = [];
      res.video = null;

      console.log(res);

      axios.get(`https://api.themoviedb.org/3/movie/${id}/videos?type='Trailer'&api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resVideo) => {
        res.video = resVideo.data.results.length > 0 ? resVideo.data.results[0] : null;
        setMovie({
          ...movie,
          movie: res,
          loading: false
        });
      });

      axios.get(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}&language=${LANGUAGE}&region=${REGION}`).then((resCast) => {
        res.cast = resCast.data.cast;
        setMovie({
          ...movie,
          movie: res,
          loading: false
        });
      });
    }).catch((err) => {
      console.log(err);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentMovie = movie.movie;

  if(nav) return (<Redirect to = {nav} />);
  else {
    return (
      !movie.loading ? (
        <>
          <Header hasSearchBar = {false} />

          <YoutubeBackground className = "teste" videoId = { isPlayingTrailer ? currentMovie.video.key : '' } onReady = { (e) => e.target.unMute() }>
            <div className = "home-first-block" style = { !isPlayingTrailer ? { background: `linear-gradient(90.07deg, rgba(0, 0, 0, 0.82) 22.31%, rgba(0, 0, 0, 0.11) 89.46%), url(${BASE_IMG_URL + currentMovie.backdrop_path})` } : { background: `linear-gradient(90.07deg, rgba(0, 0, 0, 0.82) 22.31%, rgba(0, 0, 0, 0.11) 89.46%)` }}>
              <div className = "home-first-block-responsive">
                <div className = "home-slide-header">
                  <div className = "home-slide-header-control">
                    <div>
                      <p className = "home-slide-header-control-primary"> Com </p>
                      { currentMovie.cast.slice(0, 2).map(actor => (
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
          
          <div className = "home-second-block" style = {{ background: `url(${require('../../images/background-highlight.svg')}) no-repeat` }}>
            <div className = "home-slide-next-slide special-slide noselect">
              <img className = "home-slide-next-slide-image" src = {`${BASE_IMG_URL}${currentMovie.poster_path}`} alt = "Poster do Filme" />
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

export default Movie;
