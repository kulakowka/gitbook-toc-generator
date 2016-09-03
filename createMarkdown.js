var jsonfile = require('jsonfile')
var fs = require('fs-extra')

jsonfile.readFile('data.json', function (err, data) {
  if (err) return console.error(err)
  let md = []

  data.forEach(item => {
    md.push(`- **[${item.text}](${item.href})**`)
    item.headers.forEach(header => {
      md.push(`  - [${header.text}](${header.href})`)
    })

    item.articles.forEach(article => {
      md.push(`  - **[${article.text}](${article.href})**`)
      article.headers.forEach(header => {
        md.push(`    - [${header.text}](${header.href})`)
      })
    })
  })
  let content = md.join('\n')

  fs.outputFile('contents.md', content, function (err) {
    if (err) return console.error(err)
    console.log('complete ./contents.md')
  })
})
