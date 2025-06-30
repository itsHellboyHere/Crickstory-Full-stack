
import CricketSegment from "../components/CricketSegment";
import HomeGridComponent from "../components/HomeGridComponent";
import HomeNavbar from "../components/HomeNavbar";
import { Metadata } from "next";
import Hero from "../components/Hero";
import TagComponent from "../components/TagComponent";



export const metadata: Metadata = {
  title: "SportStory",
  description: "Come and Talk about Sports post your sports moments and higlights and get the reach , join the community ",
}
export default async function Home() {

  return (
    <main>
      <HomeNavbar />
      <Hero />
      <HomeGridComponent />
      <CricketSegment />
      <TagComponent />
    </main>
  );
}