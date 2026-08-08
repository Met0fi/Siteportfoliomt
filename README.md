# M/:T Portfolio

Static portfolio for M/:T. HTML, CSS and JavaScript only. Built to run directly on GitHub Pages.

## Edit the site

Search `EDIT:` in `index.html` and `styles.css`. Those comments mark the places meant for manual changes.

Put artwork in an `assets` folder. A clean layout looks like this:

```text
assets/
├── background.webp
├── work-01.webp
├── work-02.webp
├── work-03.webp
├── work-04.webp
├── work-05.webp
└── work-06.webp
```

Each work card has an inline custom property:

```html
style="--art: none;"
```

Replace it with your file:

```html
style="--art: url('./assets/work-01.webp');"
```

The site background is marked with `EDIT:` in `styles.css`. Replace `background-image: none;` with:

```css
background-image: url('./assets/background.webp');
```

The four external buttons are marked in `index.html`. Replace their URLs, labels and notes there.

## GitHub Pages

Open the repository and go to `Settings` -> `Pages`.

Under `Build and deployment`, select `Deploy from a branch`, then choose `main` and `/(root)`. Save the setting.

Project URL:

`https://met0fi.github.io/Siteportfoliomt/`
