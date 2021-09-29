import snoowrap from 'snoowrap';
import { Kafka, Producer } from 'kafkajs';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import format from 'pg-format';

dotenv.config();

class RedditProducer {

  client: Pool;
  requester: snoowrap;
  producer: Producer;
  posts: Post[];

  constructor() {
    this.client = new Pool({
      user: 'admin',
      host: 'pod/podra-postgresql-0',
      database: 'podra-ingestion',
      password: process.env.POSTGRES_PASSWORD,
      port: 5432
    });
    this.requester = new snoowrap({
      userAgent: process.env.REDDIT_PRODUCER_AGENT_STRING,
      clientId: process.env.REDDIT_PRODUCER_API_KEY,
      clientSecret: process.env.REDDIT_PRODUCER_API_SECRET,
      username: process.env.REDDIT_PRODUCER_USERNAME,
      password: process.env.REDDIT_PRODUCER_PASSWORD,
      // scope: ['subscribe', 'mysubreddits', 'read', 'identity', 'history'],
    });
    this.producer = new Kafka({
      clientId: 'podra-reddit-updater',
      brokers: ['service/podra-kafka:9092']
    }).producer();
    this.posts = [];
  }

  private _getOld_<T>(queryString: string): T[] {
    let oldOnes: T[];
    this.client.query(queryString, (err, res) => {
      console.log(`Response: ${res}`);
      console.log(`Error: ${err}`);

      if (!err) {
        oldOnes = res as unknown as T[];
      }
    });
    return oldOnes;
  }

  getOldSubreddits(): Subreddit[] {
    return this._getOld_(`
      SELECT id, name
      FROM subreddit
      ORDER BY name
    `);
  }

  getOldSubredditPosts(subreddit: Subreddit): Post[] {
    return this._getOld_(`
      SELECT id
      FROM posts
      WHERE subreddit = ${subreddit.id}
    `);
  }

  updateSubreddits(): void {
    const olds = new Set(this.getOldSubreddits());
    const news = new Set(this.requester.getSubscriptions().fetchAll().map(
      sub => ({ id: sub.id, name: sub.display_name_prefixed } as Subreddit)
    ));

    const toDel = new Set([...olds].filter(old => !news.has(old)))
    const toAdd = new Set([...news].filter(new_ => !olds.has(new_)));

    const delIds = Array.from(toDel).map(sub => sub.id);
    const delString = format('DELETE FROM subreddits WHERE id IN %L', delIds);
    this.client.query(delString, (err, res) => {
      console.log(`Response: ${res}`);
      console.log(`Error: ${err}`);
    });

    const addString = format(
      'INSERT INTO subreddits (id, name) VALUES %L', Array.from(toAdd)
    );
    this.client.query(addString, (err, res) => {
      console.log(`Response: ${res}`);
      console.log(`Error: ${err}`);
    });
  }

  async updateSubredditPosts(subreddit: Subreddit): Promise<void> {
    const oldPosts = new Set(this.getOldSubredditPosts(subreddit));
    const newPosts = new Set(
      (await this.requester.getSubreddit(subreddit.id).getNew())
        .map(post => ({ 
          id: post.id, title: post.title, 
          date: new Date(post.created), subreddit
        } as Post))
    );

    const toAdd = new Set([...newPosts].filter(post => !oldPosts.has(post)));
    

    const addString = format(
      'INSERT INTO posts (post_id, title, date, subreddit) VALUES %L', 
      Array.from(toAdd)
        .map(post => [post.id, post.title, post.date, post.subreddit])
    );
    this.client.query(addString, (err, res) => {
      console.log(`Response: ${res}`);
      console.log(`Error: ${err}`);
    });
  }
}