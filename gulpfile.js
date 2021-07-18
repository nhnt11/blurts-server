const { src, watch, series, dest } = require("gulp");
const sass = require("gulp-sass");
const del = require("del");

// directory for building SCSS, and bundles
const buildDir = "./public/scss/libs/protocol/";
const finalDir = "./public/css/";

function cleanCompiledCssDirectory() {
    return del([
        "./public/css/*",
        "!./public/css/legacy/**",
    ]);
}

function resetCssDirectories() {    
    return del([
        buildDir,
        "./public/css/*",
        "!./public/css/legacy/**",
    ]);
}

function styles() {
    return src("./public/scss/app.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(dest(finalDir));
}

function assetsCopyLegacy() { 
    return src(["./public/scss/partials/legacy/**/*"]).pipe(dest("./public/css/legacy/"));
}

function watchCss() {
    return watch("./public/scss/**/*.scss", { ignoreInitial: false }, series(cleanCompiledCssDirectory, styles));
}

function assetsCopy() { 
    return src(["./node_modules/@mozilla-protocol/core/protocol/**/*"]).pipe(dest(buildDir));
}

exports.watchCss = watchCss;
exports.assetsCopyLegacy = assetsCopyLegacy;

exports.build = series(resetCssDirectories, assetsCopy, assetsCopyLegacy, styles);

exports.default = series(
    cleanCompiledCssDirectory, assetsCopy, styles, function() {
        // You can use a single task
        watch("./public/scss/**/*.scss", { ignoreInitial: false }, series(cleanCompiledCssDirectory, styles));
    }
);
