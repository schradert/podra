/*global chrome*/
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';
import qs from 'querystring';
import firebase from './firebase';
import snoowrap from 'snoowrap';


const getServiceCredentials = async (service: string) => {
    const db: firebase.firestore.Firestore = firebase.firestore();
    const { id: serviceId, api_key, api_secret } = await
        db.collection('services').where('name', '==', service).get()
            .then(snapshot => Object.assign(snapshot.docs[0].data(), snapshot.docs[0].id))
            .catch(error => {
                console.error(`Error on ${service} service retrieval: `, error);
                return {} as firebase.firestore.DocumentData;
            });
    return { serviceId, api_key, api_secret };
};

const saveToken = (token: string, path: string) => {
    chrome.storage.local.get('userId', (items: {[key:string]:string}) => {
        const db: firebase.firestore.Firestore = firebase.firestore();
        db.doc(`users/${items.userId}`)
            .set({ [path]: token })
            .catch(error => console.error('Error on service token save: ', error))
    });
};

const getToken = (path: string) => {
    let token: string | undefined;
    chrome.storage.local.get('userId', async (items: {[key:string]:string}) => {
        const db: firebase.firestore.Firestore = firebase.firestore();
        const doc = await db.doc(`users/${items.userId}`).get();
        token = doc.get(path);
    });
    return token;
}

const redditIntegration = async () => {
    const { serviceId, api_key, api_secret } = await getServiceCredentials('reddit');
    const authUrl = snoowrap.getAuthUrl({
        clientId: api_key,
        scope: ['subscribe', 'mysubreddits', 'read', 'identity', 'history'],
        permanent: true,
        state: Math.random().toString(36).substring(20),
        redirectUri: 'https://gnjegppndlhpgokhplnejddjhgejnplb.chromiumapp.org'
    });
    chrome.identity.launchWebAuthFlow({ url: authUrl }, (responseUrl: string | undefined) => {
        const code = new URL(responseUrl as string).searchParams.get('code');
        saveToken(code as string, 'integrations.reddit.key');
        snoowrap.fromAuthCode({
            code: code as string,
            userAgent: 'Browser Shelf',
            clientId: api_key,
            redirectUri: 'https://gnjegppndlhpgokhplnejddjhgejnplb.chromiumapp.org',
        }).then(async (r: snoowrap) => {
            const savedContent = await
            r.getMe().getSavedContent()
                .then(content => content.fetchAll())
                .then(content => {
                    content.map(console.log);
                    return content;
                });
            const upvotedContent = await
            r.getMe().getUpvotedContent()
                .then(content => content.fetchAll())
                .then(content => {
                    content.map(console.log);
                    return content;
                });
        })
    });
};

const twitterIntegration = async () => {
    const { serviceId, api_key, api_secret } = await getServiceCredentials('twitter');

    const requestTokenURL = 'https://api.twitter.com/oauth/request_token';
    const authorizeURL = new URL('https://api.twitter.com/oauth/authorize');
    const accessTokenURL = 'https://api.twitter.com/oauth/access_token';

    const recentLikesURL = 'https://api.twitter.com/1.1/favorites/list.json';
    const listBookmarksURL = 'https://api.twitter.com/2/timeline/bookmark.json';

    const oauth = new OAuth({
        consumer: { key: api_key, secret: api_secret },
        signature_method: 'HMAC-SHA1',
        hash_function: (base, key) => crypto.createHmac('sha1', key).update(base).digest('base64')
    });

    const requestToken:
    () => Promise<qs.ParsedUrlQuery> = 
    async () => {
        const header = oauth.toHeader(
            oauth.authorize({ url: requestTokenURL, method: 'POST' }));
        const res = await axios.post(
            requestTokenURL,
            { oauth_callback: 'oob' },
            { headers: {Authorization: header.Authorization} }
        );
        if (!res.data) throw new Error('Failed to get OAuth request token!');
        return qs.parse(res.data);
    };

    const accessToken:
    (token: qs.ParsedUrlQuery, verifier: string) => Promise<qs.ParsedUrlQuery> = 
    async ({ oauth_token }, oauth_verifier) => {
        const header = oauth.toHeader(
            oauth.authorize({ url: accessTokenURL, method: 'POST' }));
        const res = await axios.post(accessTokenURL, null, { 
            headers: { Authorization: header.Authorization },
            params: { oauth_verifier, oauth_token }
        });
        if (!res.data) throw new Error('Failed to retrieve OAuth request token!');
        return qs.parse(res.data);
    };

    const getRecentLikes:
    (token: qs.ParsedUrlQuery) => any = 
    async ({ oauth_token, oauth_token_secret }) => {
        const token = { 
            key: oauth_token as string, 
            secret: oauth_token_secret as string 
        };
        const header = oauth.toHeader(
            oauth.authorize({ url: recentLikesURL, method: 'GET' }, token));
        const res = await axios.get(recentLikesURL, {
            headers: {Authorization: header.Authorization},
            params: {
                include_entities: true,
                count: 200
            }
        });
        if (!res.data) throw new Error('Unsuccessful request.');
        return JSON.parse(res.data);
    };

    const getBookmarks:
    (token: qs.ParsedUrlQuery) => any = 
    async ({ oauth_token, oauth_token_secret }) => {
        const token = { 
            key: oauth_token as string, 
            secret: oauth_token_secret as string 
        };
        const header = oauth.toHeader(
            oauth.authorize({ url: listBookmarksURL, method: 'GET' }, token));
        const res = await axios.get(listBookmarksURL, {
            headers: {
                Authorization: header.Authorization,
                credentials: 'same-origin'
            },
            params: {
                count: 200,
                include_profile_interstitial_type: 1,
                include_reply_count: 1,
                include_blocking: 1,
                include_blocked_by: 1,
                tweet_mode: 'extended',
                include_can_dm: 1,
                include_followed_by: 1,
                include_want_retweets: 1,
                include_can_media_tag: 1,
                cards_platform: 'Web-12'
            }
        });
        if (!res.data) throw new Error('Unsuccessful request.');
        return JSON.parse(res.data);
    };

    return (async () => {
        const oAuthRequestToken = await requestToken();
        authorizeURL.searchParams.append(
            'oauth_token', oAuthRequestToken.oauth_token as string);
        let pin: string | undefined;
        const oAuthAccessToken = await accessToken(oAuthRequestToken, (pin as string).trim());

        const favorites = await getRecentLikes(oAuthAccessToken);
        const bookmarks = await getBookmarks(oAuthAccessToken);

        const db = firebase.firestore();
        const userId = '';
        
        db.doc(`users/${userId}`).update({
            'integrations.twitter': {
                token: oAuthAccessToken,
                service: db.doc(`services/${serviceId}`)
            }
        })
        try {
            
            console.log(bookmarks);
            return {
                favorites,
                bookmarks
            };

        } catch (error) {
            console.log(error);
            return { error };
        }
    })();
};

export {
    twitterIntegration,
    redditIntegration
};