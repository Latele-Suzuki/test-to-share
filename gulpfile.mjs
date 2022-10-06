// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// パッケージ読み込み
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
import gulp from 'gulp'
const { src, dest, watch, series, parallel, lastRun } = gulp // gulp 本体
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
const sass = gulpSass(dartSass) // さすさす
import sassGlob from 'gulp-sass-glob-use-forward' // Sassのimportを一括で
import postcss from 'gulp-postcss' // PostCSS使うためのやつ
import autoprefixer from 'autoprefixer'  // プレフィックスを自動でやってくれるやつ
import cssnano from 'cssnano' // CSS圧縮
import mqpacker from 'mqpacker' // メディアクエリをキレイに
import plumber from 'gulp-plumber' // エラーで止めない
import notify from 'gulp-notify' // エラー通知
import {deleteAsync} from 'del' // 不要ファイル削除
import pug from 'gulp-pug' // ぱぐ HTML書くのが楽になるやつ
import browserSync from 'browser-sync' // ブラウザシンク
import ssi from 'connect-ssi' // SSI使えるようにする
import terser from 'gulp-terser' // JS圧縮
import htmlmin from 'gulp-htmlmin' // HTML圧縮
import prettier from 'gulp-prettier' // 整形
import using from 'gulp-using' // 何が更新されたか分かるやつ
import connectPHP from 'gulp-connect-php' // PHP使えるように
import rename from "gulp-rename" // リネーム
import gulpif from 'gulp-if' // 分岐
import imageMin, {gifsicle, mozjpeg, optipng, svgo} from "gulp-imagemin" // 画像圧縮
import pngquant from "imagemin-pngquant" // PNG画像圧縮
// import babel from 'gulp-babel' // Babel JS
import gulpData from 'gulp-data' // 各ファイルにデータを渡す
import cache from 'gulp-cache' // キャッシュ
import fs from 'fs'


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// 設定
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const config = {
  // PHPを使うかどうか true or false
  // true にした場合、src/_partial/_variables.pug の設定も変更する
	usePHP: false
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// パス
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const paths = {
  src: 'src', // 開発用
  dist: '_site', // 書き出し用
  style: {
    src: 'src/assets/sass',
    dist: '_site/assets/css'
  },
  js: {
    src: 'src/assets/js',
    dist: '_site/assets/js'
  },
  inc: {
    src: 'src/assets/inc',
    dist: '_site/assets/inc',
    ext: '.html'
  },
  img: {
    src: 'src/assets/img',
    dist: '_site/assets/img'
  },
  pdf: {
    src: 'src/assets/pdf',
    dist: '_site/assets/pdf'
  },
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Pug
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const pug2html = () => {
  return src([paths.src + '/**/*.pug', '!' + paths.src + '/**/_*.pug', '!' + paths.inc.src + '/**/*.pug'])
  // 重くなってきたらlastRun付きの↓に変える
  // return src([paths.src + '/**/*.pug', '!' + paths.src + '/**/_*.pug', '!' + paths.inc.src + '/**/*.pug'], { since: lastRun(pug2html) })
  .pipe(
    gulpData((file) => {
      return {
        getFileSize: function(src) {
          try {
            const stat = fs.statSync(paths.src + src);
            const sizeUnit = ['B', 'KB', 'MB', 'GB', 'TB'];
            let tmpSize = stat.size;
            let filesize = 0;
            let sizeNo = 0;
            function sizeChange(num) {
              const magnification = (sizeNo > 1) ? 100 : 1;
              return (Math.ceil((num * magnification) / 1024)) / magnification
            }
            while(tmpSize >= 1000) {
              sizeNo++;
              tmpSize = sizeChange(tmpSize);
            }
            filesize = tmpSize;
            return filesize + sizeUnit[sizeNo];
          } catch(err) {
            if(err.code === 'ENOENT') return 'not found';
          }
        }
      }
    })
  )
  .pipe(
    plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
  )
  .pipe(
    pug({
      basedir: paths.src + '/',
      pretty: true
    })
  )
  .pipe(
    prettier({
      printWidth: 350,
    })
  )
  .pipe(using())
  .pipe(
    gulpif(config.usePHP,
      rename({
        extname: '.php'
      })
    )
  )
  .pipe(dest(paths.dist))
}

// Pugインクルードファイル用
const pug2inc = () => {
  return src([paths.inc.src + '/**/*.pug'], {
    since: lastRun(pug2inc)
  })
  .pipe(
    gulpData((file) => {
      return {
        getPdfSize: function(src) {
          const stat = fs.statSync('src' + src);
          const sizeUnit = ['B', 'KB', 'MB', 'GB'];
          let tmpSize = stat.size;
          let filesize = 0;
          let sizeNo = 0;
          function sizeChange(num) {
            const magnification = (sizeNo > 1) ? 100 : 1;
            return (Math.ceil((num * magnification) / 1024)) / magnification
          }
          if (tmpSize < 1000) {
            filesize = tmpSize;
          } else {
            sizeNo++;
            tmpSize = sizeChange(tmpSize);
          }
          if (tmpSize < 1000) {
            filesize = tmpSize;
          } else {
            sizeNo++;
            tmpSize = sizeChange(tmpSize);
          }
          if (tmpSize < 1000) {
            filesize = tmpSize;
          } else {
            sizeNo++;
            filesize = sizeChange(tmpSize);
          }
          return filesize + sizeUnit[sizeNo];
        }
      }
    })
  )
  .pipe(
    plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
  )
  .pipe(
    pug({
      basedir: paths.src + '/',
      pretty: true
    })
  )
  .pipe(
    prettier({
      printWidth: 240,
    })
  )
  .pipe(
    rename({
      extname: paths.inc.ext
    })
  )
  .pipe(dest(paths.inc.dist))
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Sass
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const sass2css = () => {
  return src(paths.style.src + '/**/*.scss', { sourcemaps: true })
  .pipe(
    plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
  )
  .pipe(sassGlob())
  .pipe(sass({
    outputStyle: 'expanded'
  }))
  .pipe(postcss([
    autoprefixer(),
    mqpacker()
  ]))
  .pipe(dest(paths.style.dist, { sourcemaps: true }))
  .pipe(browserSync.stream())
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// JS Transpile (Babel)
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

// const transpilejs = () => {
//   return src(paths.js.src + '/*.js')
//   .pipe(
//     babel({
//       presets: [
//         [
//           '@babel/preset-env',
//           {
//             'targets': {
//               'ie': '11'
//             },
//           }
//         ]
//       ]
//     })
//   )
//   .pipe(dest(paths.js.dist))
// }


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// ローカルサーバー
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const localserver = done => {
  if(config.usePHP){
    connectPHP.server({
      base: paths.dist,
      livereload: true,
      port: 8000
    }, function(){
      browserSync.init({
        proxy: '127.0.0.1:8000',
        open: 'external',
        notify: false,
        https: true,
      })
    })
  } else {
    browserSync.init({
      server: {
        baseDir: paths.dist,
        middleware: [
          ssi({
            baseDir: paths.dist,
            ext: '.html'
          })
        ]
      },
      // startPath: 'index.html',
      port: 8080,
      open: 'external',
      notify: false,
      https: true,
    });
  }
  done();
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// オートリロード
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const liveReload = done => {
  browserSync.reload()
  done()
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// 圧縮
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

// HTML minify
const minifyHTML = () => {
  return src(paths.dist + '/**/*.{html,htm,shtml,php,inc}')
  .pipe(htmlmin({
    collapseWhitespace : true,
    removeComments: true
  }))
  .pipe(dest(paths.dist))
}

// CSS minify
const minifyCSS = () => {
  return src(paths.style.dist + '/*.css')
  .pipe(postcss([
    cssnano()
  ]))
  .pipe(dest(paths.style.dist))
}

// JS minify
const minifyJS = () => {
  return src(paths.js.src + '/*.js')
  .pipe(terser())
  .pipe(dest(paths.js.dist))
}

// 画像圧縮
const minifyImage = () => {
  return src([paths.img.src + '/**/*'])
  .pipe(cache(
    imageMin([
      pngquant({
        quality: [0.8, 0.9],
        speed: 1,
      }),
      mozjpeg({ quality: 80 }),
      svgo(),
      optipng(),
      gifsicle({ optimizationLevel: 3 }),
    ])
  ))
  .pipe(dest(paths.img.dist));
}



// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// ファイルコピー
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const copy = () => {
  return src([
    paths.src + '/**/*',
    '!' + paths.src + '/_partial',
    '!' + paths.src + '/_includes',
    '!' + paths.src + '/assets/**/*',
    '!' + paths.src + '/**/*.pug',
  ], { base: paths.src, since: lastRun(copy) })
  .pipe(dest(paths.dist))
  .pipe(browserSync.stream())
}
const copyHTML = () => {
  return src([paths.src + '/**/*.{html,htm,shtml,xml,php,inc}'], { since: lastRun(copyHTML) })
  .pipe(dest(paths.dist))
}
const copyImage = () => {
  return src([paths.img.src + '/**/*'], { since: lastRun(copyImage) })
  .pipe(dest([paths.img.dist]))
  .pipe(browserSync.stream())
}
const copyPDF = () => {
  return src([paths.pdf.src + '/**/*'])
  .pipe(dest(paths.pdf.dist))
  .pipe(browserSync.stream())
}
const copyJS = () => {
  return src([paths.js.src + '/**/*'], { since: lastRun(copyJS) })
  .pipe(dest(paths.js.dist))
  .pipe(browserSync.stream())
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// del
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

// dist（_site）のファイル全部削除
const cleanAll = () => {
  return deleteAsync(paths.dist + "/*")
}



// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// ファイル監視
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

const watchFiles = () => {
  watch([paths.src + '/**/*.pug'], series(pug2html, liveReload))
  watch([paths.inc.src + '/**/*.pug'], series(pug2inc, liveReload))
  watch([paths.src + '/**/*.{html,htm,shtml,xml,php,inc}'], series(copyHTML, liveReload))
  watch([paths.style.src + "/**/*.scss"], sass2css)
  watch([paths.js.src + '/**/*.js'], copyJS)
  watch([paths.img.src + '/**/*'], copyImage)
  watch([paths.pdf.src + '/**/*'], copyPDF)
  watch([
    paths.src + '/**/*',
    '!' + paths.src + '/_partial',
    '!' + paths.src + '/assets/**/*',
    '!' + paths.src + '/**/*.pug',
  ], copy)
}


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// default
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

export default series(
  parallel(localserver, watchFiles)
)


// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// ビルド
// -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

// HTMLだけビルド npm run html
export const html = gulp.series(
  parallel(pug2html, pug2inc),
  copyHTML
)

// CSSとJSだけビルド npm run cssjs
export const cssjs = gulp.series(
  parallel(sass2css, copyJS),
  parallel(minifyCSS, minifyJS)
)

// 画像圧縮 npm run image
export const image = gulp.series(
  minifyImage
)

// がっつりビルド npm run build
export const build = gulp.series(
  cleanAll,
  parallel(pug2html, pug2inc, sass2css),
  parallel(copy, copyPDF, copyHTML, copyJS),
  parallel(minifyCSS, minifyJS, minifyImage)
)
