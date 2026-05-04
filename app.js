function setLoadingSkeleton(outputId, options = {}) {
  const output = document.getElementById(outputId);
  if (!output) {
    return;
  }

  const includeImage = options.includeImage || false;
  output.innerHTML = `
    <div class="skeleton">
      ${includeImage ? '<div class="skeleton-line image"></div>' : ""}
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  `;
}

function stampCardFromOutput(outputId) {
  const output = document.getElementById(outputId);
  const card = output?.closest(".grid-item");
  if (!card) {
    return;
  }

  let stamp = card.querySelector(".updated-at");
  if (!stamp) {
    stamp = document.createElement("p");
    stamp.className = "updated-at";
    card.appendChild(stamp);
  }

  const updatedTime = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  stamp.textContent = `Updated ${updatedTime}`;
}

function applyTheme(themeName) {
  const allowedThemes = ["electric", "sunset", "midnight"];
  const nextTheme = allowedThemes.includes(themeName) ? themeName : "electric";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("apiDashboardTheme", nextTheme);

  const select = document.getElementById("theme-select");
  if (select) {
    select.value = nextTheme;
  }
}

function shuffleAllApis() {
  getCatImage();
  getCatFact();
  getJoke();
  getWeather();
  getMovies();
  getJobInfo();
  getDefinition();
  getBibleVerse();
  getRecipe();
  getMusic();
  getChurchCalendar();
  getMotivationalQuote();
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("apiDashboardTheme") || "electric";
  applyTheme(savedTheme);

  const themeSelect = document.getElementById("theme-select");
  themeSelect?.addEventListener("change", (event) => {
    applyTheme(event.target.value);
  });

  const jobSearchInput = document.getElementById("job-search");
  const savedJobSearch = localStorage.getItem("apiDashboardJobSearch") || "";
  if (jobSearchInput) {
    jobSearchInput.value = savedJobSearch;

    jobSearchInput.addEventListener("input", () => {
      localStorage.setItem("apiDashboardJobSearch", jobSearchInput.value);
    });

    jobSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        getJobInfo();
      }
    });
  }

  const wordSearchInput = document.getElementById("word-search");
  if (wordSearchInput) {
    wordSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        getDefinition();
      }
    });
  }

  const recipeSearchInput = document.getElementById("recipe-search");
  if (recipeSearchInput) {
    recipeSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        getRecipe();
      }
    });
  }

  const musicSearchInput = document.getElementById("music-search");
  if (musicSearchInput) {
    musicSearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        getMusic();
      }
    });
  }
});

// Cat API Function
async function getCatImage() {
  const catImgDiv = document.getElementById("cat-output");
  setLoadingSkeleton("cat-output", { includeImage: true });

  try {
    const response = await fetch("https://api.thecatapi.com/v1/images/search");
    const data = await response.json();

    if (data.length > 0) {
      catImgDiv.innerHTML = `<img src="${data[0].url}" alt="Random Cat" style="max-width: 100%; height: auto;">`;
    } else {
      catImgDiv.innerHTML = "<p>Error fetching cat image</p>";
    }
  } catch (error) {
    catImgDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("cat-output");
  }
}

// Cat Fact API Function
async function getCatFact() {
  const catFactDiv = document.getElementById("cat-fact-output");
  setLoadingSkeleton("cat-fact-output");

  try {
    const endpoints = [
      {
        url: "https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1",
        getText: (data) => (Array.isArray(data) ? data[0]?.text : data?.text),
      },
      {
        url: "https://catfact.ninja/fact",
        getText: (data) => data?.fact,
      },
    ];

    let factText = "";

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        factText = endpoint.getText(data);

        if (factText) {
          break;
        }
      } catch {
        // Try the next endpoint when one fails.
      }
    }

    if (factText) {
      catFactDiv.innerHTML = "";
      const factParagraph = document.createElement("p");
      factParagraph.textContent = factText;
      catFactDiv.appendChild(factParagraph);
    } else {
      catFactDiv.innerHTML = "<p>Error fetching cat fact right now</p>";
    }
  } catch (error) {
    catFactDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("cat-fact-output");
  }
}

// Joke API Function
async function getJoke() {
  const jokeDiv = document.getElementById("joke-output");
  setLoadingSkeleton("joke-output");

  try {
    const response = await fetch("https://icanhazdadjoke.com/", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.joke) {
      jokeDiv.innerHTML = "";
      const jokeParagraph = document.createElement("p");
      jokeParagraph.textContent = data.joke;
      jokeDiv.appendChild(jokeParagraph);
    } else {
      jokeDiv.innerHTML = "<p>Error fetching joke</p>";
    }
  } catch (error) {
    jokeDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("joke-output");
  }
}

// Dictionary API Function (Free Dictionary API)
async function getDefinition() {
  const defDiv = document.getElementById("definition-output");
  const defaultWords = [
    "serendipity",
    "ephemeral",
    "resilience",
    "luminous",
    "tenacity",
  ];
  const word =
    document.getElementById("word-search").value.trim() ||
    defaultWords[Math.floor(Math.random() * defaultWords.length)];

  setLoadingSkeleton("definition-output");

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );

    if (response.status === 404) {
      defDiv.innerHTML = `<p>No definition found for "<strong>${word}</strong>" — try another word!</p>`;
      return;
    }

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const entry = data[0];
    const phonetic =
      entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || "";

    defDiv.innerHTML = "";

    const wordHeader = document.createElement("p");
    wordHeader.innerHTML = `<strong style="font-size:1.2rem;">${entry.word}</strong>${phonetic ? ` <span style="color:#aaa;">${phonetic}</span>` : ""}`;
    defDiv.appendChild(wordHeader);

    entry.meanings.slice(0, 2).forEach((meaning) => {
      const partEl = document.createElement("p");
      partEl.innerHTML = `<em>${meaning.partOfSpeech}</em>`;
      partEl.style.marginTop = "0.5rem";
      defDiv.appendChild(partEl);

      meaning.definitions.slice(0, 2).forEach((def, i) => {
        const defEl = document.createElement("p");
        defEl.style.fontSize = "0.9rem";
        defEl.style.marginLeft = "0.75rem";
        defEl.textContent = `${i + 1}. ${def.definition}`;
        defDiv.appendChild(defEl);

        if (def.example) {
          const exEl = document.createElement("p");
          exEl.style.fontSize = "0.82rem";
          exEl.style.fontStyle = "italic";
          exEl.style.color = "#aaa";
          exEl.style.marginLeft = "0.75rem";
          exEl.textContent = `"${def.example}"`;
          defDiv.appendChild(exEl);
        }
      });
    });
  } catch (error) {
    defDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("definition-output");
  }
}

// Weather API Function
async function getWeather() {
  const weatherDiv = document.getElementById("weather-output");
  setLoadingSkeleton("weather-output");

  try {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Fetch weather data
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
          );
          const weatherData = await weatherResponse.json();

          // Fetch location name (reverse geocoding)
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const geoData = await geoResponse.json();

          if (weatherData.current) {
            const current = weatherData.current;
            const tempF = (current.temperature_2m * 9) / 5 + 32;
            const windMph = (current.wind_speed_10m * 0.621371).toFixed(1);
            const cityName =
              geoData.address?.city ||
              geoData.address?.town ||
              geoData.address?.village ||
              "Unknown Location";

            // Map weather codes to emojis
            const weatherEmojis = {
              0: "☀️ Clear",
              1: "🌤️ Mostly Clear",
              2: "⛅ Partly Cloudy",
              3: "☁️ Overcast",
              45: "🌫️ Foggy",
              48: "🌫️ Foggy",
              51: "🌦️ Light Drizzle",
              53: "🌧️ Drizzle",
              55: "🌧️ Heavy Drizzle",
              61: "🌧️ Light Rain",
              63: "🌧️ Rain",
              65: "⛈️ Heavy Rain",
              71: "❄️ Light Snow",
              73: "❄️ Snow",
              75: "❄️ Heavy Snow",
              80: "🌧️ Light Showers",
              81: "🌧️ Showers",
              82: "⛈️ Heavy Showers",
              95: "⛈️ Thunderstorm",
              96: "⛈️ Thunderstorm with Hail",
              99: "⛈️ Thunderstorm with Hail",
            };

            const weatherDesc =
              weatherEmojis[current.weather_code] || "🌡️ Unknown";

            weatherDiv.innerHTML = `
              <p style="font-size: 3em; margin: 10px 0;">${weatherDesc}</p>
              <p><strong>Temperature:</strong> ${tempF.toFixed(1)}°F</p>
              <p><strong>Wind Speed:</strong> ${windMph} mph</p>
              <p><strong>Location:</strong> ${cityName}</p>
            `;
            stampCardFromOutput("weather-output");
          } else {
            weatherDiv.innerHTML = "<p>Error fetching weather data</p>";
            stampCardFromOutput("weather-output");
          }
        } catch (error) {
          weatherDiv.innerHTML = `<p>Error: ${error.message}</p>`;
          stampCardFromOutput("weather-output");
        }
      },
      (error) => {
        weatherDiv.innerHTML = `<p>Error: Could not get location - ${error.message}</p>`;
        stampCardFromOutput("weather-output");
      },
    );
  } catch (error) {
    weatherDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    stampCardFromOutput("weather-output");
  }
}

// Movies API Function
async function getMovies() {
  const moviesDiv = document.getElementById("movies-output");
  setLoadingSkeleton("movies-output");

  const TMDB_KEY = "a7d90711eec7ca892b1634e50879df0b";

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&with_genres=10751&sort_by=popularity.desc&page=1`,
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      moviesDiv.innerHTML = "";

      data.results.slice(0, 3).forEach((movie) => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const title = movie.title || "Unknown Title";
        const year = movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : "N/A";
        const rating = movie.vote_average
          ? `⭐ ${movie.vote_average.toFixed(1)}`
          : "N/A";
        const poster = movie.poster_path
          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
          : "";

        card.innerHTML = `
          ${poster ? `<img src="${poster}" alt="${title}" style="width:60px; border-radius:6px; flex-shrink:0;">` : ""}
          <div class="movie-info">
            <p><strong>${title}</strong> (${year})</p>
            <p>Rating: ${rating}</p>
          </div>
        `;
        moviesDiv.appendChild(card);
      });
    } else {
      moviesDiv.innerHTML = "<p>No movies found</p>";
    }
  } catch (error) {
    moviesDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("movies-output");
  }
}

// Jobs API Function (RemoteOK)
async function getJobInfo() {
  const jobsDiv = document.getElementById("jobs-output");
  const keyword = document.getElementById("job-search").value.trim();

  setLoadingSkeleton("jobs-output");

  try {
    const tag = keyword
      ? encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, "-"))
      : "dev";
    const response = await fetch(`https://remoteok.com/api?tag=${tag}`, {
      headers: { "User-Agent": "dashboard-app" },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const jobs = data.slice(1, 4);

    if (jobs.length === 0) {
      jobsDiv.innerHTML = "<p>No jobs found — try a different keyword</p>";
      return;
    }

    jobsDiv.innerHTML = "";
    jobs.forEach((job) => {
      const card = document.createElement("div");
      card.className = "job-card";

      const title = job.position || "Unknown Role";
      const company = job.company || "Unknown Company";
      const location = job.location || "Remote";
      const url = job.url || "#";
      const tags = Array.isArray(job.tags)
        ? job.tags.slice(0, 4).join(", ")
        : "";

      card.innerHTML = `
        <p><strong><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></strong></p>
        <p>${company} &mdash; ${location}</p>
        ${tags ? `<p style="font-size:0.8rem; color:#555;">${tags}</p>` : ""}
      `;
      jobsDiv.appendChild(card);
    });
  } catch (error) {
    jobsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("jobs-output");
  }
}

// Bible Verse API Function (bible-api.com)
async function getBibleVerse() {
  const bibleDiv = document.getElementById("events-output");
  setLoadingSkeleton("events-output");

  const versePool = [
    "John 3:16",
    "Psalm 23:1",
    "Proverbs 3:5-6",
    "Romans 8:28",
    "Philippians 4:13",
    "Jeremiah 29:11",
    "Isaiah 41:10",
    "Matthew 11:28",
    "Psalm 46:1",
    "2 Timothy 1:7",
    "Romans 12:2",
    "Joshua 1:9",
    "Psalm 119:105",
    "1 Peter 5:7",
    "Isaiah 40:31",
    "Lamentations 3:22-23",
    "Hebrews 11:1",
    "2 Corinthians 5:7",
    "Galatians 5:22-23",
    "Colossians 3:23",
    "Psalm 34:8",
    "James 1:5",
    "Ephesians 2:8-9",
    "Romans 10:9",
    "John 14:6",
    "Matthew 6:33",
    "Psalm 27:1",
    "Isaiah 26:3",
    "Deuteronomy 31:6",
    "1 Thessalonians 5:16-18",
    "Philippians 4:6-7",
    "Romans 15:13",
    "Psalm 91:1",
  ];

  const reference = versePool[Math.floor(Math.random() * versePool.length)];

  try {
    const response = await fetch(
      `https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`,
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = (data.text || "").replace(/\s+/g, " ").trim();

    if (!text) {
      bibleDiv.innerHTML = "<p>No verse returned — try again</p>";
      return;
    }

    bibleDiv.innerHTML = `
      <p style="font-style:italic;">"${text}"</p>
      <p style="text-align:right; font-weight:bold; margin-top:0.5rem;">— ${data.reference}</p>
    `;
  } catch (error) {
    bibleDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("events-output");
  }
}

// Recipe API Function (TheMealDB)
async function getRecipe() {
  const recipeDiv = document.getElementById("recipe-output");
  const query = document.getElementById("recipe-search").value.trim();

  setLoadingSkeleton("recipe-output", { includeImage: true });

  try {
    const url = query
      ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
      : "https://www.themealdb.com/api/json/v1/1/random.php";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const meal = data.meals?.[0];

    if (!meal) {
      recipeDiv.innerHTML = `<p>No recipe found for "<strong>${query}</strong>" — try another ingredient or dish!</p>`;
      return;
    }

    // Build ingredients list (up to 8 non-empty entries)
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]?.trim();
      const measure = meal[`strMeasure${i}`]?.trim();
      if (ingredient) {
        ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
      }
      if (ingredients.length === 8) break;
    }

    // Truncate instructions to a preview
    const instructions = meal.strInstructions
      ? meal.strInstructions
          .replace(/\r\n/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 180) + "…"
      : "";

    recipeDiv.innerHTML = `
      <div style="display:flex; gap:0.75rem; align-items:flex-start; flex-wrap:wrap;">
        ${meal.strMealThumb ? `<img src="${meal.strMealThumb}/preview" alt="${meal.strMeal}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; flex-shrink:0;">` : ""}
        <div>
          <p><strong style="font-size:1.05rem;">${meal.strMeal}</strong></p>
          <p style="font-size:0.85rem; color:#aaa;">${meal.strCategory} &bull; ${meal.strArea} cuisine</p>
        </div>
      </div>
      <p style="margin-top:0.6rem; font-size:0.85rem;"><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>
      ${instructions ? `<p style="margin-top:0.5rem; font-size:0.82rem; color:#ccc;">${instructions}</p>` : ""}
      ${meal.strYoutube ? `<p style="margin-top:0.5rem; font-size:0.85rem;"><a href="${meal.strYoutube}" target="_blank" rel="noopener noreferrer">▶ Watch on YouTube</a></p>` : ""}
    `;
  } catch (error) {
    recipeDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("recipe-output");
  }
}

// Music API Function (TheAudioDB)
async function getMusic() {
  const musicDiv = document.getElementById("music-output");
  const defaultArtists = [
    "Coldplay",
    "Beyonce",
    "Daft Punk",
    "Adele",
    "The Beatles",
  ];
  const query =
    document.getElementById("music-search").value.trim() ||
    defaultArtists[Math.floor(Math.random() * defaultArtists.length)];

  setLoadingSkeleton("music-output", { includeImage: true });

  try {
    const [artistRes, tracksRes] = await Promise.all([
      fetch(
        `https://www.theaudiodb.com/api/v1/json/123/search.php?s=${encodeURIComponent(query)}`,
      ),
      fetch(
        `https://www.theaudiodb.com/api/v1/json/123/track-top10.php?s=${encodeURIComponent(query)}`,
      ),
    ]);

    if (!artistRes.ok || !tracksRes.ok) {
      throw new Error("Request failed");
    }

    const artistData = await artistRes.json();
    const tracksData = await tracksRes.json();

    const artist = artistData.artists?.[0];
    const tracks = tracksData.track;

    if (!artist) {
      musicDiv.innerHTML = `<p>No artist found for "<strong>${query}</strong>" — try another name!</p>`;
      return;
    }

    const thumb = artist.strArtistThumb ? `${artist.strArtistThumb}/small` : "";
    const genre = [artist.strGenre, artist.strStyle]
      .filter(Boolean)
      .join(" · ");
    const country = artist.strCountry || "";
    const bio = artist.strBiographyEN
      ? artist.strBiographyEN.replace(/\s+/g, " ").trim().slice(0, 160) + "…"
      : "";

    const trackListHTML = tracks
      ? tracks
          .slice(0, 3)
          .map(
            (t, i) =>
              `<li style="font-size:0.85rem; padding:2px 0;">${i + 1}. ${t.strTrack}${
                t.intDuration
                  ? ` <span style="color:#aaa;">(${Math.floor(t.intDuration / 60000)}:${String(
                      Math.floor((t.intDuration % 60000) / 1000),
                    ).padStart(2, "0")})</span>`
                  : ""
              }</li>`,
          )
          .join("")
      : "";

    musicDiv.innerHTML = `
      <div style="display:flex; gap:0.75rem; align-items:flex-start; flex-wrap:wrap;">
        ${thumb ? `<img src="${thumb}" alt="${artist.strArtist}" style="width:72px; height:72px; object-fit:cover; border-radius:50%; flex-shrink:0;">` : ""}
        <div>
          <p><strong style="font-size:1.1rem;">${artist.strArtist}</strong></p>
          ${genre ? `<p style="font-size:0.82rem; color:#aaa;">${genre}${country ? " · " + country : ""}</p>` : ""}
        </div>
      </div>
      ${bio ? `<p style="margin-top:0.6rem; font-size:0.82rem; color:#ccc;">${bio}</p>` : ""}
      ${trackListHTML ? `<p style="margin-top:0.6rem; font-size:0.85rem;"><strong>Top Track:</strong></p><ol style="margin:0.25rem 0 0 1rem; padding:0;">${trackListHTML}</ol>` : ""}
    `;
  } catch (error) {
    musicDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("music-output");
  }
}

// Church Calendar API Function (calapi.inadiutorium.cz)
async function getChurchCalendar() {
  const calDiv = document.getElementById("church-calendar-output");
  setLoadingSkeleton("church-calendar-output");

  const seasonLabels = {
    advent: "Advent",
    christmas: "Christmas",
    ordinary: "Ordinary Time",
    lent: "Lent",
    triduum: "Paschal Triduum",
    easter: "Easter",
  };

  const colourEmoji = {
    green: "🟢",
    violet: "🟣",
    white: "⚪",
    red: "🔴",
    rose: "🟠",
    black: "⚫",
  };

  try {
    const response = await fetch(
      "http://calapi.inadiutorium.cz/api/v0/en/calendars/default/today",
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    const dateStr = new Date(data.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

    const season = seasonLabels[data.season] || data.season || "";
    const weekInfo = data.season_week ? `Week ${data.season_week}` : "";
    const celebrations = data.celebrations || [];
    const saintCelebrations = celebrations.filter((celebration) => {
      const title = (celebration.title || "").toLowerCase();
      return (
        title.includes("saint") ||
        title.includes("st.") ||
        title.includes("martyrs") ||
        title.includes("apostles")
      );
    });

    const celebrationsHTML = celebrations
      .map((c) => {
        const emoji = colourEmoji[c.colour] || "✨";
        const rank = c.rank
          ? `<span style="font-size:0.78rem; color:#aaa;"> (${c.rank})</span>`
          : "";
        return `<li style="padding:3px 0;">${emoji} ${c.title}${rank}</li>`;
      })
      .join("");

    const saintsHTML = saintCelebrations.length
      ? `<p style="margin-top:0.6rem;"><strong>Saints and Memorials:</strong></p><ul style="margin:0.35rem 0 0 1rem; padding:0;">${saintCelebrations
          .map(
            (celebration) =>
              `<li style="padding:3px 0;">${celebration.title}</li>`,
          )
          .join("")}</ul>`
      : '<p style="margin-top:0.6rem; font-size:0.82rem; color:#aaa;">No saint feast is listed separately for today in this calendar.</p>';

    calDiv.innerHTML = `
      <p style="font-size:0.85rem; color:#aaa;">${dateStr}</p>
      <p style="margin-top:0.4rem;"><strong>${season}</strong>${weekInfo ? " &mdash; " + weekInfo : ""}</p>
      ${saintsHTML}
      ${celebrationsHTML ? `<ul style="margin:0.5rem 0 0 1rem; padding:0;">${celebrationsHTML}</ul>` : ""}
    `;
  } catch (error) {
    calDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("church-calendar-output");
  }
}

// Motivational Quote API Function (MotivationalAPI)
async function getMotivationalQuote() {
  const quoteDiv = document.getElementById("motivational-output");
  setLoadingSkeleton("motivational-output");

  try {
    const response = await fetch(
      "https://gomezmig03.github.io/MotivationalAPI/en.json",
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const quotes = await response.json();

    if (!Array.isArray(quotes) || quotes.length === 0) {
      quoteDiv.innerHTML = "<p>No quote returned. Try again.</p>";
      return;
    }

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const category = quote.religion === 1 ? "Catholic" : "Secular";

    quoteDiv.innerHTML = `
      <p style="font-size:1.05rem; font-style:italic; line-height:1.6;">"${quote.phrase}"</p>
      <p style="margin-top:0.6rem; font-weight:bold; text-align:right;">- ${quote.author || "Unknown"}</p>
      <p style="margin-top:0.4rem; font-size:0.8rem; color:#aaa; text-transform:uppercase; letter-spacing:0.08em;">${category}</p>
    `;
  } catch (error) {
    quoteDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("motivational-output");
  }
}
