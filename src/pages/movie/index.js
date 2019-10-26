import React, { useEffect, useState } from 'react';
import YoutubeBackground from 'react-youtube-background';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { Redirect } from 'react-router-dom';
import BounceLoader from 'react-spinners/BounceLoader';

import axios from 'axios';
import moment from 'moment';
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

                  <div style = {{ fontSize: `${Math.floor(currentMovie.title.length >= 30 ? currentMovie.title.length/8 : 5)}vw` }} className = "home-slide-header-title"> { currentMovie.title } </div>
                  <div className = "home-slide-header-control">
                    { currentMovie.tagline ? (
                      <div style = {{ fontStyle: 'italic' }}>
                        <p className = "home-slide-header-control-secondary"> { currentMovie.tagline } </p>
                      </div>
                    ) : (
                      <div style = {{ marginTop: 'auto', marginLeft: 40, fontStyle: 'italic' }}>
                        <p className = "home-slide-header-control-secondary"> { moment(currentMovie.release_date, "YYYY-MM-DD").format("DD [de] MMMM, YYYY") } </p>
                      </div>
                    ) }
                  </div>
                </div>
                
                <div className = "home-slide-player noselect">
                  { !isPlayingTrailer && currentMovie.video ? (
                    <img onClick = { () => setIsPlayingTrailer(!isPlayingTrailer) } src = {require('../../icons/play-white.svg')} alt = "Ver Trailer" />
                  ) : (<div />) }
                </div>
              </div>
            </div>
          </YoutubeBackground>

          <div className = "home-second-block">
            <div className = "home-slide-next-slide special-slide noselect">
              <img className = "home-slide-next-slide-image" src = {`${BASE_IMG_URL}${currentMovie.poster_path}`} alt = "Poster do Filme" />
            </div>

            <div className = "home-second-block-responsive special-movie">
              <div className = "home-second-block-title"> Mais Informações </div>

              <div style = {{ display: 'flex', margin: '10px 0 30px'}}>
                <div style = {{ width: 75, height: '100%', marginRight: 15  }}>
                  <CircularProgressbarWithChildren value = { currentMovie.vote_average * 10 }>
                    <span className = "home-movies-highlighted-header-rate" style = {{ fontSize: 21 }}>
                      { currentMovie.vote_average * 10 }
                      <span style = {{ fontSize: 13 }}>%</span>
                    </span>
                  </CircularProgressbarWithChildren>
                </div>

                <span style = {{ fontWeight: 700, width: 75, height: '100%', display: 'block', margin: 'auto 0' }}> Avaliação dos Usuários </span>
              </div>
              
              <div style = {{ marginTop: 20 }}>
                <p className = "movie-details-subtitle"> Sinopse: </p>
                <p className = "movie-details-text"> { currentMovie.overview } </p>
              </div>

              <div class = "movie-financial">
                <div style = {{ marginRight: 20 }}>
                  <p className = "movie-details-subtitle"> Orçamento: </p>
                  <p className = "movie-details-text">
                    <span className = "money-symbol">$</span>
                    <span className = "money"> { currentMovie.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }</span>.00
                  </p>
                </div>

                <div style = {{ marginRight: 20 }}>
                  <p className = "movie-details-subtitle"> Receita: </p>
                  <p className = "movie-details-text">
                    <span className = "money-symbol">$</span>
                    <span className = "money"> { currentMovie.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') }</span>.00
                  </p>
                </div>
              </div>

              <div class = "movie-time">
                <div style = {{ marginRight: 20 }}>
                  <p className = "movie-details-subtitle"> Duração: </p>
                  <p className = "movie-details-text"> <span className = "time">{ Math.floor(currentMovie.runtime/60) }</span>h <span className = "time">{ currentMovie.runtime - (Math.floor(currentMovie.runtime/60) * 60) }</span>min </p>
                </div>

                { currentMovie.release_date ? (
                  <div>
                    <p className = "movie-details-subtitle"> Lançamento: </p>
                    <p className = "movie-details-text release"> { moment(currentMovie.release_date, "YYYY-MM-DD").format("DD [de] MMMM, YYYY") } </p>
                  </div>
                ) : null }
              </div>
            </div>
          </div>

          <div className = "home-second-block" style = {{ padding: '50px 0 0' }}>
            <div className = "home-second-block-responsive special-movie">
              <div className = "home-second-block-title"> Atores </div>

              <div className = "movie-cast">
                { currentMovie.cast.slice(0, 6).map(actor => (
                  <div key = { actor.cast_id }>
                    <img src = {`${BASE_IMG_URL}${actor.profile_path}`} alt = { actor.name } />
                    
                    <div>
                      <span className = "movie-cast-character"> { actor.character } </span> <br />
                      <span className = "movie-cast-name"> { actor.name } </span>
                    </div>
                  </div>
                )) }
              </div>
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
