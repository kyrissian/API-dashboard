# ~Kathy's JavaScript API Dashboard~

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A vanilla JavaScript dashboard that fetches live data from multiple public APIs. Built as a project for Coding Temple.

## Features

- 8 live API cards — each loads real data on the fly
- **Shuffle All** — refreshes every card at once with one click
- **Theme Switcher** — choose between Electric (default), Sunset, or Midnight themes
- Skeleton loaders — shimmer placeholders while data is fetching
- Timestamps — each card shows when it was last updated
- Job search persistence — your last job keyword is saved between visits
- Staggered card animations on load

## How to Run

No installs or dependencies needed — it runs entirely in the browser.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. The dashboard will load and fetch data from all APIs automatically.

> The Weather card requires browser geolocation permission. If denied, it will display an error message.

## API Cards

| Card              | API Used                                                                  | API Key Required |
| ----------------- | ------------------------------------------------------------------------- | ---------------- |
| Dog Image         | [Dog CEO](https://dog.ceo/api)                                            | No               |
| Cat Image         | [TheCatAPI](https://api.thecatapi.com)                                    | No               |
| Cat Fact          | [catfact.ninja](https://catfact.ninja)                                    | No               |
| Random Joke       | [icanhazdadjoke](https://icanhazdadjoke.com)                              | No               |
| Weather           | [Open-Meteo](https://open-meteo.com) + [Nominatim](https://nominatim.org) | No               |
| Top Family Movies | [TMDB](https://www.themoviedb.org/documentation/api)                      | Yes              |
| Job Search        | [RemoteOK](https://remoteok.com/api)                                      | No               |
| Bible Verse       | [bible-api.com](https://bible-api.com)                                    | No               |

> **Note:** The TMDB API key is required to load the movies card. The key is embedded in `app.js`.

## File Structure

```
├── index.html    # Dashboard layout and card structure
├── styles.css    # All styles, themes, and animations
├── app.js        # All API logic and helper functions
└── README.md
```

## Notes

- The weather card uses your browser's geolocation to find your current city, then fetches forecast data from Open-Meteo. Temperature is displayed in °F.
- The job search card queries RemoteOK by keyword tag. Your last search is saved to `localStorage`.
- The Bible verse card randomly selects from a pool of 33 KJV verses.
- All themes (Electric, Sunset, Midnight) are saved to `localStorage` and restored on next visit.
