var fetch = require('node-fetch')
var co = require('co')
var cheerio = require('cheerio')
var jsonfile = require('jsonfile')
var { mapSeries } = require('async')

const gitbookUrl = process.env.GITBOOK_URL || 'http://docs.feathersjs.com'

const getSummary = co(function *() {
  var res = yield fetch(gitbookUrl)
  var text = yield res.text()

  let $ = cheerio.load(text)

  let links = $('ul.summary > li.chapter')
  
  return links.map(function() {
    let chapter = $(this)
    let title = chapter.find('> a')
    let text = title.text().replace(/\n\W+/gmi, ' ').trim()
    let href = title.attr('href')

    // find articles
    let articles = chapter.find('> ul.articles > li.chapter').map(function () {
      let chapter = $(this)
      let title = chapter.find('> a')
      let text = title.text().replace(/\n\W+/gmi, ' ').trim()
      let href = title.attr('href')

      // return 2 level chapter
      return {
        text,
        href
      }
    }).get()

    // return 1 level chapter
    return {
      text,
      href,
      articles
    }
  }).get()  
})

co(function *() {
  let summary = normalizeUrl(yield getSummary)

  // summary = summary.splice(2, 4) // for debug

  mapSeries(summary, getPageHeaders, (err, itemsWithHeaders) => {
    if (err) return console.error(err)

    mapSeries(itemsWithHeaders, getArticlesHeaders, (err, items) => {
      if (err) return console.error(err)

      // save to file
      jsonfile.writeFile('data.json', itemsWithHeaders, {spaces: 2}, function (err) {
        if (err) return console.error(err)
        console.log('complete ./data.json')
      })
    })    
  })
})

function getArticlesHeaders (item, callback) {
  mapSeries(item.articles, getPageHeaders, (err, articles) => {
    item.articles = articles
    callback(null, item)
  })
}

function getPageHeaders (item, callback) {
  fetch(item.href)
    .then(res => res.text())
    .then(getHeaders)
    .then(headers => {
      item.headers = normalizeHashUrl(item.href, headers)
      callback(null, item)
    })

}

function getHeaders (html) {
  let $ = cheerio.load(html)
  let section = $('#book-search-results > .search-noresults > section')
  let h2 = section.find('h2').map(function() {
    let header = $(this)
    
    let text = header.text().replace(/\n\W+/gmi, ' ').trim()
    let hash = header.attr('id')

    return {
      text,
      hash
    }
  }).get()
  
  return h2

}

function normalizeHashUrl (href, headers) {
  return headers.map(header => {
    header.href = href + '#' + header.hash
    return header
  })
  
}

function normalizeUrl (items) {
  return items.map(item => {
    item.href = getDocsUrl(item.href)
    item.articles.map(item => {
      item.href = getDocsUrl(item.href)
      return item
    })
    return item
  })
}
function getDocsUrl (path) {
  if (path === './') path = ''
  return gitbookUrl + '/' + path
}