import RedditProducer from './reddit';

(() => {
    const reddit = new RedditProducer({ debug: true });
    reddit
        .run()
        .then(_ => console.log('Reddit ingestion success!'))
        .catch(err => {
            console.error(`Process failed because: ${err}. Exiting...`);
            process.exit(1);
        });
})();
