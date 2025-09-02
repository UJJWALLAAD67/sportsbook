import Link from "next/link";
import { 
  BuildingOfficeIcon, 
  CalendarDaysIcon, 
  UserGroupIcon,
  StarIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const features = [
    {
      icon: BuildingOfficeIcon,
      title: "Find Sports Venues",
      description: "Discover local sports facilities including badminton courts, tennis courts, football fields, and more."
    },
    {
      icon: CalendarDaysIcon,
      title: "Easy Booking",
      description: "Book your preferred time slots with just a few clicks. Real-time availability and instant confirmation."
    },
    {
      icon: UserGroupIcon,
      title: "Join Communities",
      description: "Connect with other sports enthusiasts in your area and join matches with players at your skill level."
    },
    {
      icon: StarIcon,
      title: "Rate & Review",
      description: "Share your experience and help others make informed decisions about sports venues."
    }
  ];

  const popularSports = [
    { name: "Badminton", venues: 24, color: "bg-blue-100 text-blue-800" },
    { name: "Tennis", venues: 18, color: "bg-green-100 text-green-800" },
    { name: "Football", venues: 15, color: "bg-red-100 text-red-800" },
    { name: "Cricket", venues: 12, color: "bg-yellow-100 text-yellow-800" },
    { name: "Basketball", venues: 8, color: "bg-purple-100 text-purple-800" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Book Your Favorite
              <span className="text-primary-600 block">Sports Facilities</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover and book local sports venues, connect with players, and enjoy your favorite sports. 
              From badminton courts to football fields - find it all here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/venues"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Venues
              </Link>
              <Link
                href="/auth/register"
                className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="h-full w-full bg-[radial-gradient(theme(colors.gray.300)_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SportsBook?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to find, book, and enjoy sports facilities in your area.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Sports
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore the most booked sports in your area.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {popularSports.map((sport, index) => (
              <Link
                key={index}
                href={`/venues?sport=${sport.name.toLowerCase()}`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{sport.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${sport.color}`}>
                    {sport.venues} venues
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Playing?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of sports enthusiasts who trust SportsBook for their sports facility needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started Now
            </Link>
            <Link
              href="/venues"
              className="border border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Venues
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
