import { firestore } from "./firebase";
import { launch } from "puppeteer";

const db = firestore;

chrome.runtime.onInstalled.addListener(() => {
  chrome.bookmarks.getTree(async (results) => {
    // Extract user's bookmarks into a list of URLs already in the database
    // and those to be saved with full URL text
    const bookmarks = results.map((bookmark) => bookmark.url);
    const oldItemIds: string[] = [];
    const searchableUrls: string[] = [];
    bookmarks.forEach(async (url) => {
      const query = await db.collection("items").where("url", "==", url).get();
      if (!query.empty) oldItemIds.push(query.docs[0].id);
      else searchableUrls.push(url as string);
    });

    // Structure data of new chrome bookmark items for adding to firestore
    const browser = await launch();
    const page = await browser.newPage();
    const pages = searchableUrls.map(async (url) => {
      await page.goto(url);
      const fullText = await page.$eval("*", (el) => el.innerHTML);
      const title = await page.$eval("title", (el) => el.innerHTML);
      return { url, title, fullText };
    });

    // Add new items to firestore and retrieve item ids
    const itemDocs = db.collection("items");
    const newItemIds = await Promise.all(
      pages.map(async (pageInfo) => (await itemDocs.add(pageInfo)).id)
    );

    // Create user document in firestore
    const itemPaths = [...newItemIds, ...oldItemIds].map((id) => `items/${id}`);
    db.collection("users").add({
      name: "USERNAME",
      items: itemPaths,
    });
  });
});

chrome.browserAction.setBadgeText({ text: "123" });
chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0090" });

const contextMenuItem = {
  id: "saveWebPage",
  title: chrome.i18n.getMessage("extName"),
  contexts: ["all"],
};
chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener((data) => {
  if (data.menuItemId === "saveWebPage") {
    return;
  }
});
