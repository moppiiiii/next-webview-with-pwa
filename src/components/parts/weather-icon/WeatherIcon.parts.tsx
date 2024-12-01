import Image from "next/image";
import WiCloudy from "/public/weather-icons/cloudy.svg";
import WiDay from "/public/weather-icons/day.svg";
import WiRain from "/public/weather-icons/rainy.svg";
import WiSnow from "/public/weather-icons/snowy.svg";
import WiThunder from "/public/weather-icons/thunder.svg";
import { WEATHER_TYPE } from "./constants";
import type { WeatherIconProps } from "./type";

const WeatherIcon: React.FC<WeatherIconProps> = ({ weatherType, isLazy }) => {
  const iconMap: Record<
    (typeof WEATHER_TYPE)[keyof typeof WEATHER_TYPE],
    string
  > = {
    [WEATHER_TYPE.THUNDER]: WiThunder,
    [WEATHER_TYPE.RAIN]: WiRain,
    [WEATHER_TYPE.SNOW]: WiSnow,
    [WEATHER_TYPE.DAY]: WiDay,
    [WEATHER_TYPE.CLOUDS]: WiCloudy,
  };

  return (
    <Image
      loading={isLazy ? "lazy" : "eager"}
      alt={`${weatherType} icon`}
      src={iconMap[weatherType]}
      width={24}
      height={24}
    />
  );
};

export default WeatherIcon;
