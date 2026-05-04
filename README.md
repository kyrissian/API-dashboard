# Kathy's JavaScript API Dashboard

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A vanilla JavaScript dashboard that fetches live data from multiple public APIs. Built as a project for Coding Temple.

## Features

- 12 live API cards — each loads real data on the fly
- **Shuffle All** — refreshes every compatible card at once with one click
- **Theme Switcher** — choose between Electric (default), Sunset, or Midnight themes
- Skeleton loaders — shimmer placeholders while data is fetching
- Timestamps — each card shows when it was last updated
- Job search persistence — your last job keyword is saved between visits
- Search inputs with Enter-key support for dictionary, jobs, recipes, and music
- Staggered card animations and custom accent colors across all cards

## How to Run

No installs or dependencies needed — it runs entirely in the browser.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. The dashboard will load and fetch data from all APIs automatically.

> The Weather card requires browser geolocation permission. If denied, it will display an error message.

## API Cards

| Card                        | API Used                                                                  | API Key Required |
| --------------------------- | ------------------------------------------------------------------------- | ---------------- |
| Cat Image                   | [TheCatAPI](https://api.thecatapi.com)                                    | No               |
| Cat Fact                    | [catfact.ninja](https://catfact.ninja)                                    | No               |
| Random Joke                 | [icanhazdadjoke](https://icanhazdadjoke.com)                              | No               |
| Word Definition             | [Free Dictionary API](https://dictionaryapi.dev)                          | No               |
| Weather                     | [Open-Meteo](https://open-meteo.com) + [Nominatim](https://nominatim.org) | No               |
| Top Family Movies           | [TMDB](https://www.themoviedb.org/documentation/api)                      | Yes              |
| Job Search                  | [RemoteOK](https://remoteok.com/api)                                      | No               |
| Bible Verse                 | [bible-api.com](https://bible-api.com)                                    | No               |
| Find a Recipe               | [TheMealDB](https://www.themealdb.com/api.php)                            | No               |
| Artist Lookup               | [TheAudioDB](https://www.theaudiodb.com/free_music_api)                   | No               |
| Today's Liturgical Calendar | [Church Calendar API](http://calapi.inadiutorium.cz/api-doc)              | No               |
| Motivational Quote          | [MotivationalAPI](https://github.com/GomezMig03/MotivationalAPI)          | No               |

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
- The dictionary card looks up a typed word or picks a random word when the input is blank.
- The recipe card can search by dish name or ingredient, and if left blank it returns a random meal.
- The music card searches artists and shows a short bio plus top tracks.
- The church calendar card shows the liturgical season, daily celebrations, and saint or memorial entries when they are present.
- The motivational quote card pulls a random quote and labels it as Catholic or secular.
- All themes (Electric, Sunset, Midnight) are saved to `localStorage` and restored on next visit.
