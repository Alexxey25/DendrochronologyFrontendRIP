import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const apiOrigin = (process.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '')
const minioOrigin = (process.env.VITE_MINIO_PUBLIC_ORIGIN ?? '').replace(/\/$/, '')

const runtimePath = path.join(dist, 'runtime-config.json')
const indexPath = path.join(dist, 'index.html')

if (!fs.existsSync(dist)) {
  process.exit(0)
}

fs.writeFileSync(
  runtimePath,
  JSON.stringify({ apiOrigin, minioOrigin }),
  'utf8'
)

const trimSlash = ").replace(" + String.fromCharCode(47, 92, 47, 36, 47) + ',"")'
const loader =
  '<script>(function(){var fromStorage="";var minioFromStorage="";try{fromStorage=String(localStorage.getItem("rip.apiOrigin")||"").replace(/\\/$/,"")}catch(e0){}try{minioFromStorage=String(localStorage.getItem("rip.minioBase")||"").replace(/\\/$/,"")}catch(e01){}window.__RUNTIME_API_ORIGIN__=fromStorage;window.__RUNTIME_MINIO_BASE__=minioFromStorage;if(!window.__RUNTIME_API_ORIGIN__){try{var b="/DendrochronologyFrontendRIP";try{var sc=document.getElementsByTagName("script");for(var i=0;i<sc.length;i++){var u=sc[i].getAttribute("src");if(u&&u.indexOf("/assets/index")!==-1){var p=u.indexOf("/assets/");if(p>0)b=u.slice(0,p).replace(location.origin,"")||b;break}}}catch(e){}var x=new XMLHttpRequest();x.open("GET",b+"/runtime-config.json",false);x.send(null);if(x.status>=200&&x.status<300&&x.responseText){var j=JSON.parse(x.responseText);if(j&&typeof j.apiOrigin==="string")window.__RUNTIME_API_ORIGIN__=String(j.apiOrigin' +
  trimSlash +
  ';if(j&&typeof j.minioOrigin==="string")window.__RUNTIME_MINIO_BASE__=String(j.minioOrigin' +
  trimSlash +
  ';}}catch(e2){}}})();</script>'

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8')
  if (!html.includes('rip.apiOrigin')) {
    html = html.replace(/<script type="module"/, `${loader}<script type="module"`)
    fs.writeFileSync(indexPath, html, 'utf8')
  }
}

const re = /const ([a-zA-Z0-9_$]+)="[^"]*"\.replace\(\/\\\/\$\/,""\)\?\?""/
const assetsDir = path.join(dist, 'assets')
if (!fs.existsSync(assetsDir)) {
  process.exit(0)
}

for (const name of fs.readdirSync(assetsDir)) {
  if (!name.startsWith('index-') || !name.endsWith('.js')) continue
  const fp = path.join(assetsDir, name)
  let js = fs.readFileSync(fp, 'utf8')
  if (!re.test(js)) continue
  const tail =
    ').replace(/\\/\\/$/,"")??""'
  js = js.replace(
    re,
    (_, id) =>
      `const ${id}=(typeof window!=="undefined"&&window.__RUNTIME_API_ORIGIN__?String(window.__RUNTIME_API_ORIGIN__):"")${tail}`,
  )
  fs.writeFileSync(fp, js, 'utf8')
}
