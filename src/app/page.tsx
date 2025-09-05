"use client";

import Link from "next/link";
import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

// Banner carousel data
const banners = [
  {
    title: "Kick Off Your Game",
    subtitle: "Football, Cricket, Badminton, Tennis — all in one place.",
    image: "/home/banner/football.jpg", // ✅ fixed path
    cta: { label: "Book a Venue", href: "/venues" },
  },
  {
    title: "Play Anytime, Anywhere",
    subtitle: "Instant booking with real-time availability.",
    image: "/home/banner/badminton.jpg", // ✅ fixed path
    cta: { label: "Explore Sports", href: "/venues" },
  },
  {
    title: "Join Local Communities",
    subtitle: "Meet other players, join matches, and grow together.",
    image: "/home/banner/basketball.jpg", // ✅ fixed path
    cta: { label: "Join Now", href: "/auth/register" },
  },
];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);

  // autoplay every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveBanner((prev) => (prev + 1) % banners.length),
    onSwipedRight: () =>
      setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const features = [
    {
      icon: BuildingOfficeIcon,
      title: "Find Sports Venues",
      description:
        "Search football fields, badminton courts, cricket turfs and more near you.",
    },
    {
      icon: CalendarDaysIcon,
      title: "Instant Booking",
      description:
        "Reserve your slot with live availability & quick confirmation.",
    },
    {
      icon: UserGroupIcon,
      title: "Meet Players",
      description:
        "Join communities, find matches, and connect with local athletes.",
    },
    {
      icon: StarIcon,
      title: "Ratings & Reviews",
      description:
        "Choose the best facilities based on honest feedback from players.",
    },
  ];

  const popularSports = [
    { name: "Football", venues: 15, image: "/images/icons/football.png" },
    { name: "Badminton", venues: 24, image: "/images/icons/badminton.png" },
    { name: "Tennis", venues: 18, image: "/images/icons/tennis.png" },
    { name: "Cricket", venues: 12, image: "/images/icons/cricket.png" },
    { name: "Basketball", venues: 8, image: "/images/icons/basketball.png" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Banner Carousel */}
      <section className="relative h-[80vh] overflow-hidden" {...handlers}>
        {banners.map((banner, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === activeBanner ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="h-full w-full bg-black/60 flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-5xl md:text-7xl font-extrabold text-green-400 drop-shadow-lg mb-6">
                {banner.title}
              </h1>
              <p className="text-xl md:text-2xl text-green-200 mb-6 max-w-2xl">
                {banner.subtitle}
              </p>
              <Link
                href={banner.cta.href}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-transform hover:scale-105"
              >
                {banner.cta.label}
              </Link>
            </div>
          </div>
        ))}

        {/* Carousel dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`w-4 h-4 rounded-full transition ${
                i === activeBanner ? "bg-green-400 scale-125" : "bg-green-200"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-700">
            Why Choose <span className="text-green-600">SportsBook?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl hover:-translate-y-2 transition"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-700 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-green-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Sports */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-green-700">
            Popular <span className="text-green-600">Sports</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {popularSports.map((sport, i) => (
              <Link
                key={i}
                href={`/venues?sport=${sport.name.toLowerCase()}`}
                className="bg-white border rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-2 transition p-6 flex flex-col items-center text-center"
              >
                <img
                  src={sport.image}
                  alt={sport.name}
                  className="w-16 h-16 mb-4"
                />
                <h3 className="text-lg font-semibold text-green-700">
                  {sport.name}
                </h3>
                <p className="text-sm text-green-600">{sport.venues} venues</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Ready to Start Playing?
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-green-100">
          Join thousands of players already booking and playing with SportsBook.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold hover:scale-105 transition"
          >
            Get Started
          </Link>
          <Link
            href="/venues"
            className="border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition"
          >
            Explore Venues
          </Link>
        </div>
      </section>
    </div>
  );
}
