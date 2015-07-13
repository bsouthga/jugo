import cheerio from 'cheerio';
import _ from 'lodash';
import request from 'request';

import promisify from './promisify';


const prequest = promisify(request.defaults({
  timeout : 10000 // wait max of 8 seconds before hanging up
}));

const reOGProp = /^\w+[:\w]+\w+$/;
const reHTMLContent = /text\/html/;


export default async function scrape(url) {

  // cookie jar for NYT type redirect issues
  // https://github.com/request/request/issues/311
  let jar = request.jar();

  let response = await prequest({
    method : 'GET',
    followAllRedirects: true,
    jar: jar,
    url : url,
    headers : {
      'User-Agent' : "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410."
    }
  });

  return getMeta(response, url);

}


function getMeta(response, link) {

  let results = {'other' : {}};

  if (response.statusCode === 200 && reHTMLContent.test(response.headers['content-type'])) {

    let $ = cheerio.load(response.body);

    $('meta').each(function() {

      let node = $(this);
      let og = null;
      let prop = node.attr('property');
      let name = node.attr('name');
      let content = node.attr('content');

      if (prop && reOGProp.test(prop)) {
        og = prop.split(':');
      }
      else if (name && reOGProp.test(name)) {
        og = name.split(':');
      }
      else if (name || prop) {
        results.other[name || prop] = content;
      }

      if (og) {
        results = addProp(og, content, results) || results;
      }

    });

  }

  return packageMetaData(results, link);

}


function addProp(path, value, tree) {

  if (path.length === 1 && tree) {

    tree[path[0]] = value;

    return tree;

  } else if (tree) {

    let key = path.shift();

    if (tree[key] && !(tree[key] instanceof Object)) {
      return tree;
    }

    if (!tree[key]) {
      tree[key] = {};
    }

    tree[key] = addProp(path, value, tree[key]);
  }

  return tree;
}


function getMetaDataProperty(p) {

  let m = this;

  return  ( m.og && m.og[p] )           ||
          ( m.twitter && m.twitter[p] ) ||
          ( m.article && m.article[p] ) ||
          ( m.fb && m.fb[p] )           ||
            m.other[p]                  || "";
}


function packageMetaData(m, link) {

  m.get = getMetaDataProperty;

  let image = m.get('image');

  return {
    link,
    title : m.get('title') ,
    image : image instanceof Object ? image.src : image ,
    author : m.get('author') ,
    description : m.get('description') ,
    date : m.get('date')
  };

}
