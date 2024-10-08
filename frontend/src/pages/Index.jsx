import axios from "axios";
import { useState } from "react";
import { useLoaderData, useNavigation } from "react-router-dom";

import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

import WeatherWidget from "../components/WeatherWidget";
import WeatherList from "../components/WeatherList";
import SearchInput from "../components/SearchInput";

const CACHE_KEY = "weatherData";
const CACHE_EXP = 3600000;

function isCacheValid(cachedData) {
  if (!cachedData) return false;
  const { timeCached } = cachedData;
  const now = new Date().getTime();
  return now - timeCached < CACHE_EXP;
}

export async function loader() {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

  if (isCacheValid(cachedData)) {
    return cachedData.data;
  } else {
    try {
      const response = await axios.get(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timelinemulti?key=${apiKey}&locations=New%20York%2CUSA%7CLondon%2CUK%7CTokyo%2CJapan%7CSydney%2CAustralia&locationNames=New%20York%7CLondon%7CTokyo%7CSydney`
      );

      const dataToCache = {
        timeCached: new Date().getTime(),
        data: response.data,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
      return response.data;
    } catch (e) {
      console.log(e.message);
      throw new Error("Failed to fetch the needed data.");
    }
  }
}

export default function IndexPage() {
  const response = useLoaderData();
  const places = [...response.locations];

  const [open, setOpen] = useState(false);
  // const navigation = useNavigation();

  return (
    <div className="">
      <Collapse in={open}>
        <Alert
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          No results found.
        </Alert>
      </Collapse>

      {/* <h2 className="welcome-heading">
        Welcome to <span className="highlight">weather4me.com</span>!
      </h2> */}
      <div className="sub-heading">
        <h3>
          <em>Explore the weather around the globe.</em>
        </h3>
      </div>

      <div className="search-input">
        <SearchInput places={places} />
      </div>

      <h3 className="sub-heading">Popular destination around the world.</h3>

      <div style={{ margin: "0 10px" }}>
        {response ? (
          <WeatherList>
            {places.map((place) => (
              <WeatherWidget key={place.latitude} location={place} />
            ))}
          </WeatherList>
        ) : (
          <CircularProgress color="secondary" />
        )}
      </div>
    </div>
  );
}
