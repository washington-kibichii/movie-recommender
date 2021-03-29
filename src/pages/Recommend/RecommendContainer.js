import React, { useEffect, useState } from "react";
import { movieApi } from "../../api";

import RecommendPresenter from "./RecommendPresenter";

//utils
import { countGenres2 } from "../../util/CountGenres2";
import { countKeywords } from "../../util/CountKeywords";

//redux
import { connect } from "react-redux";

const RecommendContainer = (props) => {
  const liked = props.liked;

  const [keywords, setKeywords] = useState({
    topKeyword: {},
    basedonKeywords: [],
    basedonKeywordsError: null,
  });

  const [movies, setMovies] = useState({
    loading: true,
    likedMovie: {},
    basedonLiked: [],
    basedonLikedError: null,
    currentGenre: "",
    basedonGenres: [],
    basedonGenresError: null,
    genres: [],
    genresError: null,
  });

  useEffect(() => {
    const getData = async () => {
      //1. get random liked movie on every load
      let random = Math.floor(Math.random() * liked.length);

      let likedMovie = liked[random];

      //1. get recommeded movies based on liked movie
      const [recommended, recommendedError] = await movieApi.recommend(
        likedMovie.id
      );

      //2. get favorite genre
      let topGenres = countGenres2(liked);
      let randomGenre = Math.floor(Math.random() * 3);
      topGenres = topGenres[randomGenre].key;

      //2. get this genre name
      const [genres, genresError] = await movieApi.genre();

      let currentGenre = genres.genres.find(
        (item) => item.id === parseInt(topGenres)
      );

      currentGenre = currentGenre.name;

      //2. get recommended movies based on liked genres
      const [discoveredGenres, discoveredGenresError] = await movieApi.discover(
        topGenres,
        null,
        null
      );

      //2. take out movies you rated already
      const filteredGenres = discoveredGenres.filter(
        (d) =>
          !props.liked.find((id) => id.id === d.id) &&
          !props.disliked.find((id) => id.id === d.id)
      );

      //3. your favorite keyword

      if (props.keywords.length > 0) {
        let topKeyword = countKeywords(props.keywords);
        let randomKeyword = Math.floor(Math.random() * topKeyword.length);
        topKeyword = topKeyword[randomKeyword];

        //3. get recommended movies based on liked keyword
        const [
          discoveredKeyword,
          discoveredKeywordError,
        ] = await movieApi.discoverKeyword(topKeyword.id, null);

        //3. take out movies you rated already
        const filteredKeyword = discoveredKeyword.filter(
          (d) =>
            !props.liked.find((id) => id.id === d.id) &&
            !props.disliked.find((id) => id.id === d.id)
        );

        setKeywords({
          topKeyword,
          basedonKeyword: filteredKeyword,
          basedonKeywordError: discoveredKeywordError,
        });
      }

      setMovies({
        loading: false,
        likedMovie,
        basedonLiked: recommended,
        basedonLikedError: recommendedError,
        currentGenre,
        basedonGenres: filteredGenres,
        basedonGenresError: discoveredGenresError,
        genres: genres.genres,
        genresError,
      });
    };

    getData();
  }, [liked, props.disliked, props.keywords, props.liked]);

  return <RecommendPresenter {...movies} {...keywords} />;
};

const mapStateToProps = (state) => {
  return {
    liked: state.rate.liked,
    disliked: state.rate.disliked,
    keywords: state.keywords.myKeywords,
  };
};

export default connect(mapStateToProps, null)(RecommendContainer);
