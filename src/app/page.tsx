"use client";

import Link from "next/link";
import {
  StarIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from "react"; // RE-INTRODUCED: useState & useEffect
import { useSwipeable } from "react-swipeable"; // RE-INTRODUCED: Swiper functionality
import { motion, AnimatePresence } from "framer-motion";

// RE-INTRODUCED: The data for the banner carousel
const banners = [
  {
    title: "Kick Off Your Game",
    subtitle: "Football, Cricket, Badminton, Tennis — all in one place.",
    image: "/home/banner/football.jpg", // Make sure you have these images
    cta: { label: "Book a Venue", href: "/venues" },
  },
  {
    title: "Play Anytime, Anywhere",
    subtitle: "Instant booking with real-time availability.",
    image: "/home/banner/badminton.jpg",
    cta: { label: "Explore Sports", href: "/venues" },
  },
  {
    title: "Join Local Communities",
    subtitle: "Meet other players, join matches, and grow together.",
    image: "/home/banner/basketball.jpg",
    cta: { label: "Join Now", href: "/auth/register" },
  },
];

// Data for the sections below the hero (no changes here)
const featuredVenues = [
  {
    id: 1,
    name: "SRS Badminton",
    image: "/venues/srs-badminton.jpg",
    rating: 4.9,
    reviews: 86,
    location: "Vastrapur, Ahd",
    tags: ["Indoor", "Top Rated", "Budget"],
  },
  {
    id: 2,
    name: "The Cricket Dome",
    image: "/venues/cricket-dome.jpg",
    rating: 4.8,
    reviews: 112,
    location: "Bodakdev, Ahd",
    tags: ["Indoor", "Night Lights"],
  },
  {
    id: 3,
    name: "SmashZone Tennis",
    image: "/venues/smash-zone.jpg",
    rating: 4.7,
    reviews: 74,
    location: "Navrangpura, Ahd",
    tags: ["Clay Court", "Coaching"],
  },
];

const popularSports = [
  { name: "Badminton", image: "/sports/badminton.jpg" },
  { name: "Football", image: "/sports/football.jpg" },
  { name: "Cricket", image: "/sports/cricket.jpg" },
  { name: "Tennis", image: "/sports/tennis.jpg" },
];

export default function Home() {
  // RE-INTRODUCED: State and logic for the carousel
  const [activeBanner, setActiveBanner] = useState(0);
  const nextBanner = () =>
    setActiveBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () =>
    setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);

  // RE-INTRODUCED: Autoplay every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextBanner, 5000);
    return () => clearInterval(timer);
  }, []);

  // RE-INTRODUCED: Swipe handlers for mobile and desktop
  const handlers = useSwipeable({
    onSwipedLeft: nextBanner,
    onSwipedRight: prevBanner,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Logic for the venue scroller (no changes)
  const scrollContainerRef = useRef(null);
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white text-gray-900">
      {/* --- 1. Hero Section (RESTORED to Swiper) --- */}
      <section
        className="relative h-[90vh] text-white overflow-hidden"
        {...handlers}
      >
        <AnimatePresence>
          <motion.div
            key={activeBanner}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${banners[activeBanner].image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 z-10">
          <motion.h1
            key={`${activeBanner}-title`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold drop-shadow-xl mb-4"
          >
            {banners[activeBanner].title}
          </motion.h1>
          <motion.p
            key={`${activeBanner}-subtitle`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl"
          >
            {banners[activeBanner].subtitle}
          </motion.p>
          <motion.div
            key={`${activeBanner}-cta`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              href={banners[activeBanner].cta.href}
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-full font-bold text-lg tracking-wide uppercase transition-transform hover:scale-105 shadow-lg"
            >
              {banners[activeBanner].cta.label}
            </Link>
          </motion.div>
        </div>

        {/* Carousel progress dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                activeBanner === i
                  ? "bg-white"
                  : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>

      {/* --- 2. Book Venues Section (No Changes) --- */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Book Venues</h2>
            <Link
              href="/venues"
              className="text-green-600 font-semibold hover:text-green-500 transition"
            >
              See all venues &gt;
            </Link>
          </div>
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-600" />
            </button>
            <div
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            >
              {featuredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="flex-shrink-0 w-[280px] bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
                >
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{venue.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <StarIcon className="w-5 h-5 text-yellow-500 mr-1" />
                      <span className="font-semibold text-gray-800">
                        {venue.rating}
                      </span>
                      <span className="ml-1">({venue.reviews})</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPinIcon className="w-5 h-5 mr-1" />
                      <span>{venue.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. Popular Sports Section (No Changes) --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Popular Sports
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {popularSports.map((sport) => (
              <Link
                key={sport.name}
                href={`/venues?sport=${sport.name.toLowerCase()}`}
                className="group text-center"
              >
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-shadow">
                  <img
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-lg">{sport.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
