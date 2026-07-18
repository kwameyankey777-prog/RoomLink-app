import RecentlyViewed from "./RecentlyViewed";
import HeroCTA from "./HeroCTA";
import NavAuth from "./NavAuth";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import HostelGrid from "./HostelGrid";

export const metadata = {
  title: "HnAlink | Find. Connect. Stay ",
  description: "Hostels and apartments near campus, reviewed by occupants.",
};
export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: hostels, error } = await supabase
    .from("hostels")
    .select("*")
    .eq("status", "approved");

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved");

  return (
   <main className="min-h-screen pb-20 bg-white text-gray-900">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HnAlink" className="h-9 w-9 rounded-lg" />
        <span className="text-[#1E88E5] font-bold text-xl tracking-tight">HnAlink</span>
        </Link>
        <NavAuth />
      </header>

      <section className="px-6 py-20 text-center bg-white border-b border-gray-100">
       <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 leading-[1.1] tracking-tight">
          Find your next place<br />
          to <span className="text-[#1E88E5]">call home</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
          Hostels and apartments near campus, reviewed by occupants.
        </p>
        <HeroCTA />
      </section>
<section className="px-6 pt-14 pb-32 max-w-6xl mx-auto">
        {error && <p className="text-red-500">Error: {error.message}</p>}
        <RecentlyViewed />
        <HostelGrid hostels={hostels} reviews={reviews} />
      </section>
      
    </main>
  );
}

