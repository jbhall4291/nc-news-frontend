import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getArticleById, voteOnArticle } from "../utils/api";
import Comments from "./Comments";
import "../styling/SingleArticle.css";
import { convertTimeAndDate } from "../utils/functions";
import { ThumbsUp } from "phosphor-react";

import React from "react";

const SingleArticle = () => {
  const { article_id } = useParams();

  const [articleData, setArticleData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [votes, setVotes] = useState(0);
  const [isVotingError, setIsVotingError] = useState(false);

  useEffect(() => {
    setErr(false);
    setIsLoading(true);
    getArticleById(article_id)
      .then((article) => {
        setArticleData(article);
        setVotes(article.votes);
        setIsLoading(false);
      })
      .catch((err) => {
        setErr(err.response.data.msg);
        setIsLoading(false);
      });
  }, [article_id]);

  const pluraliseComments = (comment_count) => {
    if (comment_count === 0) return `No comments`;
    else if (comment_count === 1) return `${comment_count} comment`;
    else {
      return `${comment_count} comments`;
    }
  };

  const updateVotes = (vote) => {
    if (localStorage.getItem(article_id)) {
      localStorage.removeItem(article_id, "userHasVoted");
      setIsVotingError(false);

      setVotes(votes - 1);

      voteOnArticle(article_id, { inc_votes: vote }).catch(() => {
        setIsVotingError(true);
        setVotes((currentVotes) => currentVotes + vote);
        localStorage.setItem(article_id, "userHasVoted");
      });
    } else {
      localStorage.setItem(article_id, "userHasVoted");
      setIsVotingError(false);

      setVotes((currentVotes) => currentVotes + vote);
      voteOnArticle(article_id, { inc_votes: vote }).catch(() => {
        setIsVotingError(true);
        setVotes((currentVotes) => currentVotes - vote);
        localStorage.removeItem(article_id, "userHasVoted");
      });
    }
  };

  if (err) return <p>Article Not Found!</p>;

  return (
    <div>
      {isLoading ? (
        <p>loading article, please wait...</p>
      ) : (
        <section className="SingleArticle__section">
          <main className="SingleArticle__main">
            <img
              className="SingleArticle__img"
              src={articleData.article_img_url}
              alt={articleData.title}
            ></img>
            <h3 className="SingleArticle__h3">{articleData.title}</h3>
            <h4 className="SingleArticle__h4">
              <em>by {articleData.author}</em>
            </h4>

            <h5 className="SingleArticle__h5">{articleData.body}</h5>

            <div class="SingleArticle__div--details_area">
              <div class="time_area">
                {" "}
                <p>
                  <i class="fa-solid fa-clock"></i>{" "}
                  <span className="margin-on-mobile">
                    {convertTimeAndDate(articleData.created_at)}
                  </span>
                </p>
              </div>
              <div class="votes_area">
                <p>
                  <i class="fa-solid fa-thumbs-up"></i>{" "}
                  {isVotingError ? (
                    <span className="error">Error Voting!</span>
                  ) : (
                    <span>{votes} votes</span>
                  )}
                  
                </p>
              </div>
              <div class="comments_area">
                <p>
                  <i class="fa-solid fa-comment"></i>{" "}
                  {pluraliseComments(articleData.comment_count)}
                </p>
              </div>
            </div>
          </main>
          <div>
            {localStorage.getItem(article_id) ? (
              <button
                className="SingleArticle__button--upvote-voted-up"
                onClick={() => updateVotes(-1)}
              >
                <p className="SingleArticle__p--upvote-text">
                  Article Voted Up
                </p>
                <ThumbsUp size={32} />
              </button>
            ) : (
              <button
                className="SingleArticle__button--upvote-no-vote"
                onClick={() => updateVotes(1)}
              >
                <p className="SingleArticle__p--upvote-text">
                  Vote Up Article{" "}
                </p>
                <ThumbsUp size={32} />
              </button>
            )}

            {/* {isVotingError ? (
              <h4 className="SingleArticle__h4--error">
                Error Voting: Check Internet Connection
              </h4>
            ) : (
              <h4 className="SingleArticle__h4">Votes gets updated: {votes}</h4>
            )} */}
          </div>

          <Comments article_id={article_id} />
        </section>
      )}
    </div>
  );
};

export default SingleArticle;
