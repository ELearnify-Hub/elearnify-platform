// components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h3 className="text-white text-lg font-bold mb-2">ELearnify</h3>
          <p className="text-sm">
            A modern e-learning platform built with the MERN stack.
            Learn at your own pace, anytime, anywhere.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/"        className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
            <li><Link to="/login"   className="hover:text-white transition-colors">Login</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div>
          <h4 className="text-white font-semibold mb-3">Built With</h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Tailwind CSS', 'JWT'].map(tech => (
              <span key={tech} className="bg-gray-800 text-gray-300 px-2 py-1 rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-sm">
        © {new Date().getFullYear()} ELearnify. Built as a MERN Stack learning project.
      </div>
    </footer>
  );
};

export default Footer;