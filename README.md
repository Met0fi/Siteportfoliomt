# M/:T Portfolio

Static glitchcore / visual design portfolio built for GitHub Pages.

## Files

- `index.html` — content and portfolio structure.
- `styles.css` — palette, background, layout, responsive behavior and visual effects.
- `script.js` — lightweight interaction and reveal behavior.
- `.nojekyll` — keeps deployment as plain static files.

## Editable areas

Search for `EDIT:` in `index.html` and `styles.css`. These are the intentionally marked places for replacing project images, text, software information, social links, email, palette and background.

## Add artwork

1. Create an `assets` folder in the repository.
2. Upload optimized `.webp`, `.jpg` or `.png` artwork.
3. In a project card, replace:

```css
--project-image: none;
```

with:

```css
--project-image: url('./assets/my-work.webp');
```

## Add the background

In `styles.css`, find the `EDIT:` marker above `body::before` and replace:

```css
background-image: none;
```

with:

```css
background-image: url('./assets/background.webp');
```

## Publish with GitHub Pages

Open the repository on GitHub, then go to `Settings` -> `Pages`. Under `Build and deployment`, choose `Deploy from a branch`. Select `main` and `/(root)`, then save.

For this project repository, the default Pages address will follow the project-site format:

`https://met0fi.github.io/Siteportfoliomt/`
