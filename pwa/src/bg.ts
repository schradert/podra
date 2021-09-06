/*global chrome*/
import firebase from 'firebase';
import { launch } from 'puppeteer';

const config = {
  apiKey: "AIzaSyCbWtWXGfev-dpVMgEyevvimX-Xmv76pls",
  authDomain: "browser-shelf.firebaseapp.com",
  databaseURL: "https://browser-shelf.firebaseio.com",
  projectId: "browser-shelf",
  storageBucket: "browser-shelf.appspot.com",
  messagingSenderId: "944054137525",
  appId: "1:944054137525:web:fac34c93833ab6535304fc",
  measurementId: "G-5HRC3VEVWY"
};
firebase.initializeApp(config);
const db = firebase.firestore();

chrome.runtime.onInstalled.addListener(() => {
  chrome.bookmarks.getTree(async results => {
    // Extract user's bookmarks into a list of URLs already in the database
    // and those to be saved with full URL text
    const bookmarks = results.map(bookmark => bookmark.url);
    const oldItemIds: string[] = [];
    const searchableUrls: string[] = [];
    bookmarks.forEach(async url => {
      const query = await db.collection('items').where('url', '==', url).get();
      if (!query.empty) oldItemIds.push(query.docs[0].id);
      else searchableUrls.push(url as string);
    });

    // Structure data of new chrome bookmark items for adding to firestore
    const browser = await launch();
    const page = await browser.newPage();
    const pages = searchableUrls.map(async url => {
      await page.goto(url);
      const fullText = await page.$eval('*', el => el.innerHTML);
      const title = await page.$eval('title', el => el.innerHTML);
      return { url, title, fullText };
    });

    // Add new items to firestore and retrieve item ids
    const itemDocs = db.collection('items');
    const newItemIds = await Promise.all(
      pages.map(async pageInfo => (await itemDocs.add(pageInfo)).id)
    );

    // Create user document in firestore
    const itemPaths = [...newItemIds, ...oldItemIds].map(id => `items/${id}`);
    db.collection('users').add({
      name: 'USERNAME',
      items: itemPaths
    });
  });
    /*chrome.declarativeContent.onPageChanged.removeRules(
        undefined,
        () => chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({ 
                        pageUrl: {hostEquals: 'developer.chrome.com'} 
                    })
                ],
                actions: [
                    new chrome.declarativeContent.ShowPageAction()
                ]
            }
        ])
    );*/
    
});


chrome.browserAction.setBadgeText({ text: '123' });
chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0090' });
/*chrome.browserAction.onClicked.addListener(tab => {
    if (tab.incognito) return;
    if (tab.url) {
        console.log(tab.url);
        return;
    }
});*/

const contextMenuItem = {
    id: "saveWebPage",
    title: chrome.i18n.getMessage("extName"),
    contexts: ["all"]
};
chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener(data => {
    if (data.menuItemId === "saveWebPage") {
        return;
    }
});