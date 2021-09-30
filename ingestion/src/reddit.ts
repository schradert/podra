import snoowrap, { SnoowrapOptions } from 'snoowrap';
import { Kafka, Producer, logLevel, Message, CompressionTypes } from 'kafkajs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import format from 'pg-format';
import { Reddit } from './types';
import { isErr } from './utils';

// TODO: add the following scopes to AuthConfiguration where necessary
// scope: ['subscribe', 'mysubreddits', 'read', 'identity', 'history']

dotenv.config();

/**
 *
 */
export default class RedditProducer {
    client: Pool;
    requester: snoowrap;
    producer: Producer;
    posts: Reddit.Post[];
    debug: boolean;

    static env2ConfigNameMapping: SnoowrapOptions = {
        userAgent: 'REDDIT_PRODUCER_AGENT_STRING',
        clientId: 'REDDIT_PRODUCER_API_KEY',
        clientSecret: 'REDDIT_PRODUCER_API_SECRET',
        username: 'REDDIT_PRODUCER_USERNAME',
        password: 'REDDIT_PRODUCER_PASSWORD',
    };
    static defaultConfigOptions: Reddit.ConfigOptions = {
        redditConfig: {},
        debug: false,
    };

    constructor({ redditConfig, debug } = RedditProducer.defaultConfigOptions) {
        this.debug = !!debug;
        this.client = new Pool({
            user: 'admin',
            host: 'pod/podra-postgresql-0',
            database: 'podra-ingestion',
            password: process.env.POSTGRES_PASSWORD,
            port: 5432,
        });
        this.requester = new snoowrap({
            ...this.getRedditConfig(),
            ...redditConfig,
        });
        this.producer = new Kafka({
            logLevel: this.debug ? logLevel.DEBUG : logLevel.INFO,
            clientId: 'podra-reddit-ingestor',
            brokers: ['service/podra-kafka:9092'],
        }).producer();
        this.posts = [];
    }

    private getRedditConfig(): SnoowrapOptions {
        const config = { ...RedditProducer.env2ConfigNameMapping };

        Object.entries(config).forEach(
            ([confKey, envKey]) => {
                const envVar = process.env[envKey];
                if (envVar === undefined) {
                    throw new Error(
                        `${envKey} is not defined in running process.`
                    );
                }
                
                // the value is generated from config above, so will NOT fail!
                config[confKey as keyof typeof config] = envVar;
            }
        );

        return config;
    }

    private getOld<T>(queryString: string): T[] {
        let oldOnes: T[] = [];
        this.client.query(queryString, (err, res) => {
            console.log(`Response: ${res}`);
            console.log(`Error: ${err}`);

            if (!err) {
                oldOnes = res as unknown as T[];
            }
        });
        return oldOnes;
    }

    private generatePostMessages(): Message[] {
        return this.posts.map(post => ({
            value: JSON.stringify(post),
        }));
    }

    async sendData(): Promise<void> {
        try {
            const metadata = await this.producer.send({
                topic: 'ingestion-reddit-posts',
                compression: CompressionTypes.GZIP,
                messages: this.generatePostMessages(),
            });
            metadata.forEach(console.log);
        } catch (err) {
            if (isErr(err)) {
                console.error(`[ingestor/reddit/sendData] ${err.message}`, err);
                return Promise.reject('Send failed!');
            }
        }
    }

    async run(): Promise<void> {
        this.updateSubreddits();
        const subreddits = this.getOldSubreddits();
        subreddits.forEach(subreddit => {
            this.updateSubredditPosts(subreddit);
        });

        try {
            await this.producer.connect();
            await this.sendData();
        } catch (err) {
            if (isErr(err)) {
                console.error(`[ingestion/reddit/run] ${err.message}`, err);
                return Promise.reject('Run failed!');
            }
        } finally {
            await this.producer.disconnect();
        }
    }

    getOldSubreddits(): Reddit.Subreddit[] {
        return this.getOld(`
            SELECT id, name
            FROM subreddit
            ORDER BY name
        `);
    }

    getOldSubredditPosts(subreddit: Reddit.Subreddit): Reddit.Post[] {
        return this.getOld(`
            SELECT id
            FROM posts
            WHERE subreddit = ${subreddit.id}
        `);
    }

    async updateSubreddits(): Promise<void> {
        const olds = new Set(this.getOldSubreddits().map(old => JSON.stringify(old)));
        const news = new Set(
            await this.requester
                .getSubscriptions()
                .fetchAll()
                .map(
                    sub =>
                        JSON.stringify(({
                            id: sub.id,
                            name: sub.display_name_prefixed,
                        } as Reddit.Subreddit))
                )
        );

        const toDel = new Set([...olds].filter(old => !news.has(old)));
        const toAdd = new Set([...news].filter(new_ => !olds.has(new_)));

        const delIds = Array.from(toDel).map(sub => {
            const subObj = JSON.parse(sub);
            if (!("id" in subObj)) throw new Error(`SerDe failed with ${sub}`);
            return subObj.id as string;
        });
        const delString = format(
            'DELETE FROM subreddits WHERE id IN %L',
            delIds
        );
        this.client.query(delString, (err, res) => {
            console.log(`Response: ${res}`);
            console.log(`Error: ${err}`);
        });

        const addString = format(
            'INSERT INTO subreddits (id, name) VALUES %L',
            Array.from(toAdd).map(sub => JSON.parse(sub))
        );
        this.client.query(addString, (err, res) => {
            console.log(`Response: ${res}`);
            console.log(`Error: ${err}`);
        });
    }

    async updateSubredditPosts(subreddit: Reddit.Subreddit): Promise<void> {
        const oldPosts = new Set(this.getOldSubredditPosts(subreddit));
        const newPosts = new Set(
            (await this.requester.getSubreddit(subreddit.id).getNew()).map(
                post =>
                    ({
                        id: post.id,
                        title: post.title,
                        date: new Date(post.created),
                        subreddit,
                    } as Reddit.Post)
            )
        );

        const toAdd = new Set(
            [...newPosts].filter(post => !oldPosts.has(post))
        );

        const addString = format(
            'INSERT INTO posts (post_id, title, date, subreddit) VALUES %L',
            Array.from(toAdd).map(post => [
                post.id,
                post.title,
                post.date,
                post.subreddit,
            ])
        );
        this.client.query(addString, (err, res) => {
            console.log(`Response: ${res}`);
            console.log(`Error: ${err}`);
        });
    }
}
