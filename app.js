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
  getDogImage();
  getCatImage();
  getCatFact();
  getJoke();
  getWeather();
  getMovies();
  getJobInfo();
  getBibleVerse();
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
});

// Dog API Function
async function getDogImage() {
  const dogImgDiv = document.getElementById("dog-output");
  setLoadingSkeleton("dog-output", { includeImage: true });

  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();

    if (data.status === "success") {
      dogImgDiv.innerHTML = `<img src="${data.message}" alt="Random Dog" style="max-width: 100%; height: auto;">`;
    } else {
      dogImgDiv.innerHTML = "<p>Error fetching dog image</p>";
    }
  } catch (error) {
    dogImgDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    stampCardFromOutput("dog-output");
  }
}

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
