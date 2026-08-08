# M/:T Portfolio

Static HTML, CSS and JavaScript portfolio built for GitHub Pages.

## Images

Put artwork in an `assets` folder:

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

In `index.html`, image slots are marked with comments beginning with `IMAGE`.

Replace:

```html
style="--art: none;"
```

with:

```html
style="--art: url('./assets/work-01.webp');"
```

The site background has one `IMAGE BACKGROUND` comment in `styles.css`. Replace:

```css
background-image: none;
```

with:

```css
background-image: url('./assets/background.webp');
```

## Links

The four link rows are Telegram, Instagram, GitHub and Boosty. Their `href` locations are marked with comments beginning with `LINK` in `index.html`.

## GitHub Pages

Open the repository and go to `Settings` -> `Pages`.

Under `Build and deployment`, select `Deploy from a branch`, then choose `main` and `/(root)`. Save the setting.

Project URL:

`https://met0fi.github.io/Siteportfoliomt/`
