"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const contactInfo = [
  {
    name: "Email Support",
    details: "support@sportsbook.com",
    icon: EnvelopeIcon,
    description: "Get help via email within 24 hours",
  },
  {
    name: "Phone Support",
    details: "+91 98765 43210",
    icon: PhoneIcon,
    description: "Call us Mon-Sat, 9 AM - 8 PM IST",
  },
  {
    name: "Live Chat",
    details: "Available on website",
    icon: ChatBubbleLeftRightIcon,
    description: "Instant support during business hours",
  },
];

const offices = [
  {
    city: "Surat (HQ)",
    address: "123 Sports Complex Road, Vesu, Surat - 395007, Gujarat",
    phone: "+91 98765 43210",
    email: "surat@sportsbook.com",
  },
  {
    city: "Mumbai",
    address: "456 Bandra West, Mumbai - 400050, Maharashtra",
    phone: "+91 98765 43211",
    email: "mumbai@sportsbook.com",
  },
  {
    city: "Bangalore",
    address: "789 Koramangala, Bangalore - 560034, Karnataka",
    phone: "+91 98765 43212",
    email: "bangalore@sportsbook.com",
  },
];

const supportTypes = [
  {
    title: "General Inquiries",
    description: "Questions about our platform and services",
    icon: QuestionMarkCircleIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Booking Issues",
    description: "Problems with bookings, payments, or cancellations",
    icon: ExclamationTriangleIcon,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Venue Partnership",
    description: "Information about listing your sports facility",
    icon: MapPinIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
      });
    }, 3000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-green-600 via-green-700 to-green-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions or need help? We're here to assist you with all your sports booking needs.
          </motion.p>
        </div>
      </section>

      {/* Contact Options Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the best way to reach us based on your needs
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactInfo.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <contact.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {contact.name}
                </h3>
                <p className="text-lg font-medium text-green-600 mb-2">
                  {contact.details}
                </p>
                <p className="text-gray-600 text-sm">{contact.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content - Form and Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="booking">Booking Issue</option>
                      <option value="venue">Venue Partnership</option>
                      <option value="payment">Payment Issue</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Brief description of your inquiry"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`w-full px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                    isSubmitted
                      ? "bg-green-600 text-white"
                      : isSubmitting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSubmitted 
                    ? "Message Sent!" 
                    : isSubmitting 
                    ? "Sending..." 
                    : "Send Message"
                  }
                </button>
              </form>
            </motion.div>

            {/* Support Types & FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  How Can We Help?
                </h2>
                <div className="space-y-4">
                  {supportTypes.map((type, index) => (
                    <div
                      key={type.title}
                      className={`p-6 rounded-lg ${type.bgColor} border border-opacity-20`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <type.icon className={`w-8 h-8 ${type.color}`} />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {type.title}
                          </h3>
                          <p className="text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="w-6 h-6 text-green-600 mr-2" />
                  Business Hours
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 8:00 PM IST</p>
                  <p><span className="font-medium">Saturday:</span> 10:00 AM - 6:00 PM IST</p>
                  <p><span className="font-medium">Sunday:</span> 10:00 AM - 4:00 PM IST</p>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  * Email support is available 24/7 with responses within 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Offices
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Visit us at any of our locations across India
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {office.city}
                </h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start">
                    <MapPinIcon className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{office.address}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">{office.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm">{office.email}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions
            </p>
          </motion.div>
          <div className="space-y-6">
            {[
              {
                q: "How do I book a sports venue?",
                a: "Simply browse our venues, select your preferred time slot, and complete the payment. You'll receive instant confirmation."
              },
              {
                q: "Can I cancel my booking?",
                a: "Yes, you can cancel bookings according to the venue's cancellation policy. Refunds are processed as per the terms."
              },
              {
                q: "How do I list my sports facility?",
                a: "Register as a venue owner, submit your facility details, and our team will verify and approve your listing within 48 hours."
              },
              {
                q: "What payment methods are accepted?",
                a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
