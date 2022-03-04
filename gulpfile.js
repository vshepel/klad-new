import gulp from "gulp"
import del from "del"
import yargs from "yargs"
import {hideBin} from "yargs/helpers"
import webpack from "webpack"
import gulpif from "gulp-if"
import newer from "gulp-newer"
import debug from "gulp-debug"
import rename from "gulp-rename"
import postcss from "gulp-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cheerio from "gulp-cheerio"
import browsersync from "browser-sync"
import replace from "gulp-replace"
import imagemin from "gulp-imagemin"
import webpackStream from "webpack-stream"
import svg from "gulp-svg-sprite"
import include from "gulp-file-include"
import TerserPlugin from "terser-webpack-plugin"

const {src, dest, series, watch} = gulp
const paths = {
    views: {
        src: [
            "./src/views/**/*.html",
            "!./src/views/parts/**/*"
        ],
        dist: "./dist/",
        watch: "./src/views/**/*.html"
    },
    styles: {
        src: "./src/styles/main.css",
        dist: "./dist/styles/",
        watch: "./src/styles/**/*.css"
    },
    scripts: {
        src: "./src/js/index.js",
        dist: "./dist/js/",
        watch: "./src/js/**/*.js"
    },
    images: {
        src: [
            "./src/img/**/*.{png,jpg,jpeg,webp,gif,svg}",
            "!./src/img/favicon/**/*"
        ],
        dist: "./dist/img/",
        watch: "./src/img/**/*.{png,jpg,jpeg,webp,gif,svg}"
    },
    sprites: {
        src: "./src/img/svg/*.svg",
        dist: "./dist/img/",
        watch: "./src/img/svg/*.svg"
    },
    favicon: {
        src: "./src/img/favicon/*",
        dist: "./dist/img/favicon/"
    },
    fonts: {
        src: "./src/fonts/**/*.{ttf,woff,woff2,eot,svg}",
        dist: "./dist/fonts/"
    },
    files: {
        src: "./src/files/*",
        dist: "./dist/files/"
    }
};
const argv = yargs(hideBin(process.argv)).argv,
    production = !!argv.production;

function serve(done) {
    browsersync.create();
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        ghostMode: false,
        notify: false,
        // online: true,
        // tunnel: 'yousutename', // https://yousutename.loca.lt
    });

    watch(paths.views.watch, {usePolling: true}, series(styles, views));
    watch(paths.styles.watch, {usePolling: true}, styles);
    watch(paths.scripts.watch, {usePolling: true}, scripts);
    watch(paths.images.watch, {usePolling: true}, images);
    watch(paths.sprites.watch, {usePolling: true}, sprites);
    done()
}

async function clean(done) {
    await del.sync("dist/**/*")
    done()
}

function views() {
    return src(paths.views.src)
        .pipe(include({
            prefix: "@@",
            basepath: "@file"
        }))
        .pipe(gulpif(production, replace(".css", ".min.css")))
        .pipe(gulpif(production, replace(".js", ".min.js")))
        .pipe(dest(paths.views.dist))
        .pipe(browsersync.stream());
}

function styles() {
    return src(paths.styles.src)
        .pipe(postcss([ tailwindcss('./tailwind.config.cjs'), autoprefixer() ]))
        .pipe(gulpif(production, rename({
            suffix: ".min"
        })))
        .pipe(replace("img/", "../img/"))
        .pipe(dest(paths.styles.dist))
        .pipe(debug({
            "title": "CSS files"
        }))
        .pipe(browsersync.stream());
}

function scripts() {
    return src(paths.scripts.src)
        .pipe(webpackStream({
            mode: production ? "production" : "development",
            performance: {hints: false},
            plugins: [
                new webpack.ProvidePlugin({$: "jquery", jQuery: "jquery", "window.jQuery": "jquery"}),
            ],
            entry: {
                main: "./src/js/index.js",
            },
            output: {
                filename: "[name].js",
                chunkFilename: "[name].js",
                publicPath: "/"
            },
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules)/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ["@babel/preset-env"],
                                plugins: ["babel-plugin-root-import"]
                            }
                        }
                    }
                ]
            },
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        vendor: {
                            test: /node_modules/,
                            chunks: "initial",
                            name: "vendor",
                            enforce: true
                        }
                    }
                },
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {format: {comments: false}},
                        extractComments: false
                    })
                ]
            },
        }), webpack)
        .pipe(gulpif(production, rename({
            suffix: ".min"
        })))
        .pipe(dest(paths.scripts.dist))
        .pipe(debug({
            "title": "JS files"
        }))
        .pipe(browsersync.stream());
}

function images() {
    return src(paths.images.src)
        .pipe(newer(paths.images.dist))
        .pipe(gulpif(production, imagemin()))
        .pipe(dest(paths.images.dist))
        .pipe(debug({
            "title": "Images"
        }))
        .pipe(browsersync.stream());
}

function sprites() {
    return src(paths.sprites.src)
        .pipe(cheerio({
            run: function ($) {
                $("[fill]").removeAttr("fill");
                $("[stroke]").removeAttr("stroke");
                $("[style]").removeAttr("style");
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(svg({
            shape: {
                dimension: {
                    maxWidth: 500,
                    maxHeight: 500
                },
                spacing: {
                    padding: 0
                }
            },
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(dest(paths.sprites.dist))
        .pipe(debug({
            "title": "Sprites"
        }))
        .on("end", browsersync.reload);
}

function favicon() {
    return src(paths.favicon.src)
        .pipe(dest(paths.favicon.dist))
        .pipe(debug({
            "title": "Favicon"
        }))
        .on("end", browsersync.reload);
}

function fonts() {
    return src(paths.fonts.src)
        .pipe(dest(paths.fonts.dist))
        .pipe(debug({
            "title": "Fonts"
        }))
        .on("end", browsersync.reload);
}

function files() {
    return src(paths.files.src)
        .pipe(dest(paths.files.dist))
        .pipe(debug({
            "title": "Files"
        }))
        .on("end", browsersync.reload);
}

export {clean, views, styles, scripts, images, sprites, favicon, fonts, files}

export const development = series(clean, views, styles, scripts, images, sprites, favicon, fonts, files, serve);

export const prod = series(clean, views, styles, scripts, images, sprites, favicon, fonts, files);

export default development;
