"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var snoowrap_1 = __importDefault(require("snoowrap"));
var kafkajs_1 = require("kafkajs");
var dotenv_1 = __importDefault(require("dotenv"));
var pg_1 = require("pg");
var pg_format_1 = __importDefault(require("pg-format"));
dotenv_1["default"].config();
var RedditProducer = /** @class */ (function () {
    function RedditProducer() {
        this.client = new pg_1.Pool({
            user: 'admin',
            host: 'pod/shlif-postgresql-0',
            database: 'shlif-ingestion',
            password: process.env.POSTGRES_PASSWORD,
            port: 5432
        });
        this.requester = new snoowrap_1["default"]({
            userAgent: process.env.REDDIT_PRODUCER_AGENT_STRING,
            clientId: process.env.REDDIT_PRODUCER_API_KEY,
            clientSecret: process.env.REDDIT_PRODUCER_API_SECRET,
            username: process.env.REDDIT_PRODUCER_USERNAME,
            password: process.env.REDDIT_PRODUCER_PASSWORD
        });
        this.producer = new kafkajs_1.Kafka({
            clientId: 'shlif-reddit-updater',
            brokers: ['service/shlif-kafka:9092']
        }).producer();
        this.posts = [];
    }
    RedditProducer.prototype._getOld_ = function (queryString) {
        var oldOnes;
        this.client.query(queryString, function (err, res) {
            console.log("Response: " + res);
            console.log("Error: " + err);
            if (!err) {
                oldOnes = res;
            }
        });
        return oldOnes;
    };
    RedditProducer.prototype.getOldSubreddits = function () {
        return this._getOld_("\n      SELECT id, name\n      FROM subreddit\n      ORDER BY name\n    ");
    };
    RedditProducer.prototype.getOldSubredditPosts = function (subreddit) {
        return this._getOld_("\n      SELECT id\n      FROM posts\n      WHERE subreddit = " + subreddit.id + "\n    ");
    };
    RedditProducer.prototype.updateSubreddits = function () {
        var olds = new Set(this.getOldSubreddits());
        var news = new Set(this.requester.getSubscriptions().fetchAll().map(function (sub) { return ({ id: sub.id, name: sub.display_name_prefixed }); }));
        var toDel = new Set(__spreadArray([], __read(olds)).filter(function (old) { return !news.has(old); }));
        var toAdd = new Set(__spreadArray([], __read(news)).filter(function (new_) { return !olds.has(new_); }));
        var delIds = Array.from(toDel).map(function (sub) { return sub.id; });
        var delString = pg_format_1["default"]('DELETE FROM subreddits WHERE id IN %L', delIds);
        this.client.query(delString, function (err, res) {
            console.log("Response: " + res);
            console.log("Error: " + err);
        });
        var addString = pg_format_1["default"]('INSERT INTO subreddits (id, name) VALUES %L', Array.from(toAdd));
        this.client.query(addString, function (err, res) {
            console.log("Response: " + res);
            console.log("Error: " + err);
        });
    };
    RedditProducer.prototype.updateSubredditPosts = function (subreddit) {
        return __awaiter(this, void 0, void 0, function () {
            var oldPosts, newPosts, _a, toAdd, addString;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        oldPosts = new Set(this.getOldSubredditPosts(subreddit));
                        _a = Set.bind;
                        return [4 /*yield*/, this.requester.getSubreddit(subreddit.id).getNew()];
                    case 1:
                        newPosts = new (_a.apply(Set, [void 0, (_b.sent())
                                .map(function (post) { return ({
                                id: post.id, title: post.title,
                                date: new Date(post.created),
                                subreddit: subreddit
                            }); })]))();
                        toAdd = new Set(__spreadArray([], __read(newPosts)).filter(function (post) { return !oldPosts.has(post); }));
                        addString = pg_format_1["default"]('INSERT INTO posts (post_id, title, date, subreddit) VALUES %L', Array.from(toAdd)
                            .map(function (post) { return [post.id, post.title, post.date, post.subreddit]; }));
                        this.client.query(addString, function (err, res) {
                            console.log("Response: " + res);
                            console.log("Error: " + err);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedditProducer;
}());
