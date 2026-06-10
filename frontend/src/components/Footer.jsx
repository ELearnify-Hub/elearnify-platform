// components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--footer-border)] bg-[var(--footer-bg)] text-[var(--text-secondary)] transition-colors duration-200">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
            ELearnify
          </h3>
          <p className="text-sm leading-relaxed">
            A modern e-learning platform built with the MERN stack. Learn at your own pace, anytime, anywhere.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-[var(--text-primary)]">
            Quick Links
          </h4>
          <ul className="list-none space-y-2 text-sm">
            <li><Link to="/" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">Home</Link></li>
            <li><Link to="/courses" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">All Courses</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">Login</Link></li>
            <li><Link to="/register" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-[var(--text-primary)]">
            Built With
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Tailwind CSS', 'JWT'].map((tech) => (
              <span
                key={tech}
                className="rounded border border-[var(--border-light)] bg-[var(--bg-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--footer-border)] py-4 text-center text-sm">
        © {new Date().getFullYear()} ELearnify. Built as a MERN Stack learning project.
      </div>
    </footer>
  );
};

export default Footer;
