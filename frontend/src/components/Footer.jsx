// components/Footer.jsx
import { Link } from 'react-router-dom';
import { GraduationCap, Globe2, Mail, MapPin, MessageCircle, Phone, Share2 } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Globe2, label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { icon: Share2, label: 'Facebook', href: 'https://www.facebook.com' },
    { icon: MessageCircle, label: 'Instagram', href: 'https://www.instagram.com' },
    { icon: Globe2, label: 'YouTube', href: 'https://www.youtube.com' },
    { icon: Share2, label: 'GitHub', href: 'https://github.com' },
  ];

  return (
    <footer className="border-t border-[var(--footer-border)] bg-[var(--footer-bg)] text-[var(--text-secondary)] transition-colors duration-200">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link to="/" className="mb-4 inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[var(--shadow-sm)]">
              <GraduationCap size={21} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">ELearnify</span>
          </Link>
          <p className="max-w-sm text-sm leading-relaxed">
            A modern MERN e-learning platform with courses, live classes, AI assistant, quizzes, certificates, and role-based dashboards.
          </p>
          <div className="mt-5 flex gap-2">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" title={label} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-secondary)] transition hover:-translate-y-1 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-[var(--text-primary)]">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
            <li><Link to="/courses" className="hover:text-blue-600 dark:hover:text-blue-400">Courses</Link></li>
            <li><Link to="/live-classes" className="hover:text-blue-600 dark:hover:text-blue-400">Live Classes</Link></li>
            <li><Link to="/ai-assistant" className="hover:text-blue-600 dark:hover:text-blue-400">AI Assistant</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-[var(--text-primary)]">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400">Contact Us</Link></li>
            <li><Link to="/verify/sample" className="hover:text-blue-600 dark:hover:text-blue-400">Verify Certificate</Link></li>
            <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400">Become a Learner</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold text-[var(--text-primary)]">Reach out to us</h4>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2"><Mail size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" /> support@elearnify.com</p>
            <p className="flex items-start gap-2"><Phone size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" /> +91 85858 58585</p>
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-blue-600 dark:text-blue-400" /> Durgapur, West Bengal, India</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--footer-border)] px-4 py-5 text-center text-sm">
        © {new Date().getFullYear()} ELearnify. Built as an advanced MERN Stack learning project.
      </div>
    </footer>
  );
};

export default Footer;
