import TopTemplate from "@/components/templates/top/Top.template";
import { getForecast } from "@/repositories/forecast/actions/get";

const Home: React.FC = async () => {
  const forecast = await getForecast();
  console.log(forecast);

  return <TopTemplate />;
};

export default Home;
