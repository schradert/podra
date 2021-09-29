declare type Subreddit = {
    id: string;
    name: string;
};

declare type Post = {
    id: string;
    title: string;
    date: Date;
    subreddit: Subreddit;
};

declare type PostComment = {
    id: string;
    subcomments: PostComment[];
};
