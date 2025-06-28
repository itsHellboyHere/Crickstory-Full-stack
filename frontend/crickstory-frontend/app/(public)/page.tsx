
import CricketSegment from "../components/CricketSegment";
import HomeGridComponent from "../components/HomeGridComponent";
import HomeNavbar from "../components/HomeNavbar";
import { Metadata } from "next";
import Hero from "../components/Hero";
import TagComponent from "../components/TagComponent";



export const metadata: Metadata = {
  title: "CrickStory",
  description: "Come and Talk about Cricket  join the community ",
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