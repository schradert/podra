CREATE TABLE subreddits (
  id    CHAR(6) PRIMARY KEY,
  name  VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE posts (
  post_id   CHAR(6) PRIMARY KEY,
  title     VARCHAR(50) NOT NULL,
  date      DATE,
  subreddit CHAR(6),
  
  CONSTRAINT fk_subreddit FOREIGN KEY(subreddit) REFERENCES subreddits(id)
);