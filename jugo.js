import pmongo from 'promised-mongo';
import Twit from 'twit';
import _ from 'lodash';

import scrape from './lib/scrape';
import timeout from './lib/timeout';
import promisify from './lib/promisify';

// promisify twit methods
Twit.prototype.$get = promisify(Twit.prototype.get);



export default class Jugo {


  constructor(config) {

    this.db = pmongo(config.database);

    let collections = ['tweets', 'users', 'friends', 'meta'];

    for (let c of collections) {
      this[c] = this.db.collection(c);
    }

    this.locks = new Set();
    this.verbose = config.verbose;
    this.T = new Twit(config.twitter);
    this.accounts = config.accounts;

  }

  log(str) {
    if (this.verbose) {
      console.log(`[Jugo -- ${new Date()}] ${str}`);
    }
  }


  async collect() {

    let stream = this.T.stream('statuses/filter', {
      follow: await this.getUniverse()
    });

    this.log('Tapping Stream...');

    // register stream handlers
    stream.on('warning', ::console.log);
    stream.on('error', ::console.log);
    stream.on('tweet', ::this.processTweet);

  }


  async getUniverse() {

    this.log('Populating Universe');

    let authorities = await this.getAuthorities(this.accounts);

    // for a given id, look for friends in the mongo collection first,
    // and then request from twitter if not found
    let getFriends = async(user_id) => {

      let cached = await this.friends.findOne({ user_id });

      if (!cached) {
        await this.rateLimit('friends', 'ids');
        let { ids } = await this.T.$get('friends/ids', { user_id });
        await this.friends.insert({ user_id, ids })
        return ids.concat(user_id);
      }

      return cached.ids.concat(user_id);
    }

    // wait for all requests to resolve,
    // and flatten all ids into a single array
    return _(await* authorities.map(getFriends))
      .flatten()
      .shuffle()
      .take(5000)
      .value();
  }



  async getAuthorities(accounts) {

    let authorities = await this.users.find({'screen_name' : {$in : accounts}});

    let have = new Set((for (u of authorities) u.screen_name));
    let need = accounts.filter(a => !have.has(a));

    if (need.length) {
      // check for remaining requests, waiting if necessary
      await this.rateLimit('users', 'lookup');
      let results = await this.T.$get('users/lookup', {screen_name : need});
      await this.users.insert(results);
      authorities = (authorities || []).concat(results);
    }

    return _.pluck(authorities, 'id_str');

  }


  async processTweet(tweet) {

    let { urls } = tweet.entities;

    if ( !urls ) {
      return;
    }

    // for each url in the tweet, add an entry
    // to the jugo database for a post mention
    for (let url of urls) {

      let link = url.expanded_url || url.url;

      this.log(`Collecting Link: ${link}`);

      let post = {
        link,
        date : new Date(tweet.created_at),
        screen_name : tweet.user.screen_name,
        followers : tweet.user.followers_count,
        retweets : tweet.retweet_count,
        favorites : tweet.favorite_count,
        text : tweet.text
      };

      // add the story to the database
      this.tweets.insert(post);

      // get scraped metadata about the story
      let metadata = await this.meta.findOne({ link });

      if (!metadata && !this.locks.has(link)) {


        // add lock for scraping this link to not duplicate
        this.locks.add(link);

        this.log(`Collecting MetaData for: ${link}`);
        this.log(`Lock Count: ${this.locks.size}`);

        let metadata = await scrape(link);

        if (metadata) {
          await this.meta.insert(metadata);
        }

        // remove lock after adding metadata
        this.locks.delete(link);

      }

    }

  }


  async rateLimit(type='users', method='lookup') {

    // get rate limit status for the app
    let status = (await this.T.$get('application/rate_limit_status'))
      .resources[type][`/${type}/${method}`];

    // no requests left, wait until limit resets
    if (status.remaining) {
      return true;
    }

    let duration = (new Date().getTime()) + 10 - status.reset;

    this.log(`waiting for ${duration/1000} seconds...`);
    return timeout(() => {}, duration);

  }


}
