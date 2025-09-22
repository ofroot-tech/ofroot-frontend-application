import Link from "next/link";
import {
  Megaphone,
  Search,
  Users,
  BarChart3,
  Mail,
  Palette,
} from "lucide-react";
import Footer from "../components/Footer";
import MarketingNavbar from "./MarketingNavbar";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <MarketingNavbar />
      {/* Hero Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-[#20b2aa] to-[#1a8f85] text-white">
        <h1 className="text-5xl font-bold mb-4">Grow Your Business with OfRoot</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Ads, SEO, content, and automation — everything you need to get more calls, more jobs, and more revenue.
        </p>
        <p className="text-lg mb-8 max-w-2xl mx-auto font-medium">
          We create scalable growth using data paired with experience and insight. Our team has worked with some of the top marketing companies across the industry, delivering millions in revenue for early-stage and established brands alike. We believe in Growth Science: making sure you get found in search, activating your audience on social, and creating compelling content that cuts through the noise. Our SEO and online marketing expertise is proven and battle-tested.
        </p>
        <div className="flex justify-center">
          <Link
            href="https://form.jotform.com/252643454932157"
            target="_blank"
            className="inline-block bg-white text-[#20b2aa] font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
          >
            Join the Waitlist
          </Link>
          <Link
            href="https://form.jotform.com/252643426225151"
            target="_blank"
            className="ml-4 inline-block bg-[#20b2aa] text-white font-semibold px-6 py-3 rounded shadow hover:bg-[#1a8f85] transition"
          >
            Contact
          </Link>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto bg-white md:bg-transparent md:mb-0 mb-8">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose ofroot?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-lg p-6 shadow text-center">
            <h3 className="text-xl font-semibold mb-2">All-in-One Growth</h3>
            <p>
              We handle ads, SEO, content, social, and email so you can focus on
              running your business.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Automation & AI</h3>
            <p>
              From lead follow-ups to reporting, we automate repetitive work and
              boost conversions with AI.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
            <p>
              Get strategy, creative, and hands-on execution from a team that
              knows how to grow service businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 bg-[#f7fafc]">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <Megaphone className="w-10 h-10 text-[#20b2aa] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Paid Ads Management</h3>
            <p>
              Google, Meta, TikTok & YouTube — campaigns built to drive calls,
              bookings, and ROI.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <Search className="w-10 h-10 text-[#20b2aa] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">SEO & Content</h3>
            <p>
              Rank locally, publish keyword-rich blogs, and win organic leads
              that compound over time.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <Users className="w-10 h-10 text-[#20b2aa] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Social Media Growth</h3>
            <p>
              Posts, engagement, and paid campaigns that make your brand visible
              where customers spend time.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <BarChart3 className="w-10 h-10 text-[#20b2aa] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Conversion Funnels</h3>
            <p>
              Landing pages and A/B testing that turn traffic into booked jobs,
              not just clicks.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <Mail className="w-10 h-10 text-[#20b2aa] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Email & SMS Marketing</h3>
            <p>
              Follow-ups, review requests, and drip campaigns that keep you
              top-of-mind and drive repeat work.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow text-center">
            <Palette className="w-10 h-10 text-[#20b2aa] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Branding & Creative</h3>
            <p>
              Logos, messaging, photos, videos, and case studies to make your
              business look trusted and professional.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to grow?</h2>
        <p className="mb-8">
          Join our waitlist and be the first to know when new campaigns and
          features launch.
        </p>
        <Link
          href="https://form.jotform.com/252643454932157"
          target="_blank"
          className="inline-block bg-[#20b2aa] text-white font-semibold px-6 py-3 rounded shadow hover:bg-[#1a8f85] transition"
        >
          Join the Waitlist
        </Link>
      </section>
      {/* Footer Section */}
      <Footer />
    </main>
  );
}
