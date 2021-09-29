import { SnoowrapOptions } from 'snoowrap';

declare namespace Reddit {
    export type Subreddit = {
        id: string;
        name: string;
    };

    export type Post = {
        id: string;
        title: string;
        date: Date;
        subreddit: Subreddit;
    };

    export type PostComment = {
        id: string;
        subcomments: PostComment[];
    };

    export type ConfigOptions = {
        redditConfig?: Partial<SnoowrapOptions>;
        debug?: boolean;
    };
}
