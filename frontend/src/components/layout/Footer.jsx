import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Send,
  Heart,
} from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from '../ui/BrandIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/doctors', label: 'Find a Doctor' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ];

  const socialLinks = [
    { name: 'Facebook', Icon: Facebook, url: '#' },
    { name: 'Twitter', Icon: Twitter, url: '#' },
    { name: 'Instagram', Icon: Instagram, url: '#' },
    { name: 'LinkedIn', Icon: Linkedin, url: '#' },
    { name: 'YouTube', Icon: Youtube, url: '#' },
  ];

  const contactInfo = [
    { Icon: MapPin, text: 'Chabahil, Kathmandu, Nepal' },
    { Icon: Phone, text: '+977-1-444-5678' },
    { Icon: Mail, text: 'hello@medicare.com.np' },
    { Icon: Clock, text: 'Sun–Fri: 8:00 AM – 8:00 PM' },
  ];

  return (
    <footer className="mt-20 bg-slate-950 text-slate-300">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 text-white shadow-lg shadow-primary-500/30">
                <Plus className="h-5 w-5" strokeWidth={3} />
              </span>
              <span className="font-display text-lg font-bold text-white">
                Medi<span className="text-primary-400">Care</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your trusted healthcare partner in Nepal. Book appointments with top doctors and receive quality care —
              simply and affordably.
            </p>
            <div className="mt-5 flex gap-2">
              {socialLinks.map(({ name, Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  aria-label={name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/40 hover:bg-primary-500/10 hover:text-primary-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
                    <ChevronRight className="h-3.5 w-3.5 text-primary-500 transition-transform group-hover:translate-x-0.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Payments</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm font-medium text-emerald-400">eSewa</span>
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm font-medium text-purple-400">Khalti</span>
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
              <p className="text-xs text-slate-400">Secure payments protected with industry-standard encryption.</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h4>
            <ul className="mt-4 space-y-3">
              {contactInfo.map(({ Icon, text }, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300">
              Get in touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Subscribe to our newsletter</p>
              <p className="text-xs text-slate-400">Health tips and clinic updates, once a month.</p>
            </div>
          </div>
          <form className="flex w-full gap-2 md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input input-sm flex-1 border-slate-700 bg-slate-950 text-white placeholder-slate-500 md:w-64"
            />
            <button type="submit" className="btn btn-primary btn-sm whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container-custom flex flex-col items-center justify-between gap-3 py-5 text-sm md:flex-row">
          <p className="text-slate-500">© {currentYear} MediCare Clinic. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <span className="h-4 w-px bg-slate-700" />
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
