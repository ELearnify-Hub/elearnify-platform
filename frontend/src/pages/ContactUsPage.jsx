import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Mail, MapPin, MessageCircle, Phone, Send, Share2, ShieldCheck } from 'lucide-react';
import { sendContactMessage } from '../services/api';

const supportCards = [
  { icon: Mail, title: 'Email Support', value: 'support@elearnify.com', text: 'For account, courses, certificates, and technical support.' },
  { icon: Phone, title: 'Help Desk', value: '+91 85858 58585', text: 'Available Monday to Saturday during learning hours.' },
  { icon: MapPin, title: 'Learning Office', value: 'Durgapur, West Bengal, India', text: 'Online-first platform with local learner support.' },
];

const socialLinks = [
  { icon: Globe2, label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { icon: Share2, label: 'Facebook', href: 'https://www.facebook.com' },
  { icon: MessageCircle, label: 'Instagram', href: 'https://www.instagram.com' },
  { icon: Globe2, label: 'YouTube', href: 'https://www.youtube.com' },
  { icon: Share2, label: 'GitHub', href: 'https://github.com' },
];

const categories = [
  { value: 'general', label: 'General Support' },
  { value: 'course', label: 'Course Help' },
  { value: 'payment', label: 'Payment/Enrollment' },
  { value: 'certificate', label: 'Certificate Support' },
  { value: 'live-class', label: 'Live Class Help' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'partnership', label: 'Partnership' },
];

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: '', message: '' });

    try {
      const data = await sendContactMessage(formData);
      setStatus({ type: 'success', message: data.message || 'Message sent successfully.' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        subject: '',
        message: '',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-10 text-[var(--text-primary)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white shadow-[var(--shadow-lg)] md:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-50">
              <MessageCircle size={16} /> Help and support
            </span>
            <h1 className="text-3xl font-extrabold md:text-5xl">Contact ELearnify Support</h1>
            <p className="mt-4 max-w-2xl text-blue-100">
              Need help with courses, live classes, certificates, AI assistant, or your account? Send us a message and we will guide you clearly.
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {supportCards.map(({ icon: Icon, title, value, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-110 dark:bg-blue-900/30 dark:text-blue-400">
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
              <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">{value}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)] md:p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Support ticket</p>
              <h2 className="mt-1 text-2xl font-extrabold text-[var(--text-primary)]">Send a Message</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Tell us exactly what you need. Your message will be saved for admin review.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]" />
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Your email" required className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]" />
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number optional" className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]" />
              <select name="category" value={formData.category} onChange={handleChange} className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]">
                {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>

            <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" required className="mt-4 w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]" />
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write your message..." rows="7" required className="mt-4 w-full rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-[var(--text-primary)]" />

            <button type="submit" disabled={sending} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
              <Send size={18} /> {sending ? 'Sending...' : 'Send Message'}
            </button>

            {status.message && (
              <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${status.type === 'success' ? 'border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]' : 'border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]'}`}>
                {status.message}
              </p>
            )}
          </form>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
              <ShieldCheck className="mb-3 text-blue-600 dark:text-blue-400" size={28} />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Professional Support Channels</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Add your real social media/contact links in this page anytime. The structure is ready for a professional website footer and support section.
              </p>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" title={label} className="flex h-11 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition hover:-translate-y-1 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Quick Help Topics</h3>
              <div className="mt-4 space-y-3">
                {['Course enrollment issue', 'Live class joining issue', 'Certificate verification', 'Login or password help', 'Instructor partnership'].map((topic) => (
                  <div key={topic} className="rounded-2xl bg-[var(--bg-secondary)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ContactUsPage;
