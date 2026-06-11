import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Clock, ExternalLink, Radio, ShieldCheck, Users, Video } from 'lucide-react';
import { getLiveClassById, updateLiveClassStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const providerLabels = {
  jitsi: 'Built-in ELearnify Live Room',
  google_meet: 'Google Meet',
  zoom: 'Zoom',
  custom: 'Custom Live Link',
};

const formatDateTime = (value) => {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const LiveClassRoomPage = () => {
  const { id } = useParams();
  const { user, isAdmin, isInstructor } = useAuth();
  const meetRef = useRef(null);
  const apiRef = useRef(null);

  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const loadLiveClass = async () => {
    try {
      const data = await getLiveClassById(id);
      setLiveClass(data.liveClass);
    } catch (error) {
      console.error('Live class room error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveClass();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [id]);

  const canManage = liveClass && (
    isAdmin ||
    (isInstructor && String(liveClass.instructor?._id || liveClass.instructor) === String(user?._id))
  );

  const changeStatus = async (status) => {
    setStatusLoading(true);
    try {
      await updateLiveClassStatus(id, status);
      await loadLiveClass();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (!liveClass || liveClass.provider !== 'jitsi' || !meetRef.current) return;
    if (apiRef.current) return;

    const existingScript = document.querySelector('script[data-jitsi-api="true"]');

    const createRoom = () => {
      if (!window.JitsiMeetExternalAPI || !meetRef.current || apiRef.current) return;

      const domain = 'meet.jit.si';
      const options = {
        roomName: liveClass.roomName,
        parentNode: meetRef.current,
        width: '100%',
        height: 650,
        userInfo: {
          displayName: user?.name || 'ELearnify Learner',
          email: user?.email || undefined,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: user?.role === 'student',
          prejoinPageEnabled: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      };

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    };

    if (existingScript) {
      createRoom();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.dataset.jitsiApi = 'true';
    script.onload = createRoom;
    script.onerror = () => setScriptError(true);
    document.body.appendChild(script);
  }, [liveClass, user]);

  if (loading) {
    return <main className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--text-secondary)]">Loading live class...</main>;
  }

  if (!liveClass) {
    return <main className="min-h-screen bg-[var(--bg-primary)] p-8 text-red-500">Live class not found.</main>;
  }

  const externalClass = liveClass.provider !== 'jitsi';

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-4 py-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to="/live-classes" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
          <ArrowLeft size={16} /> Back to live classes
        </Link>

        <section className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${liveClass.status === 'live' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                  {liveClass.status === 'live' ? '● Live Now' : liveClass.status}
                </span>
                <span className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  {providerLabels[liveClass.provider] || 'Live Class'}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">{liveClass.title}</h1>
              <p className="mt-2 max-w-3xl text-[var(--text-secondary)]">
                {liveClass.description || 'Interactive live learning session.'}
              </p>
            </div>

            {canManage && (
              <div className="flex flex-wrap gap-2">
                {liveClass.status !== 'live' && liveClass.status !== 'completed' && (
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => changeStatus('live')}
                    className="rounded-2xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Start Class
                  </button>
                )}
                {liveClass.status === 'live' && (
                  <button
                    type="button"
                    disabled={statusLoading}
                    onClick={() => changeStatus('completed')}
                    className="rounded-2xl bg-slate-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              { icon: CalendarDays, label: 'Schedule', value: formatDateTime(liveClass.scheduledAt) },
              { icon: Clock, label: 'Duration', value: `${liveClass.durationMinutes || 60} minutes` },
              { icon: Users, label: 'Instructor', value: liveClass.instructor?.name || 'Instructor' },
              { icon: ShieldCheck, label: 'Course', value: liveClass.course?.title || 'Course' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-3xl bg-[var(--bg-secondary)] p-4">
                <Icon className="mb-3 text-blue-600 dark:text-blue-400" size={22} />
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {externalClass ? (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-10 text-center shadow-[var(--shadow-sm)]"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ExternalLink size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Open {providerLabels[liveClass.provider]}</h2>
            <p className="mx-auto mt-2 max-w-xl text-[var(--text-secondary)]">
              This class uses an external meeting link. Students can join, while admins and instructors can start or manage the session status from ELearnify.
            </p>
            <a
              href={liveClass.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              Launch Meeting <ExternalLink size={18} />
            </a>
          </motion.section>
        ) : (
          <section className="overflow-hidden rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <Radio size={18} className="text-red-500" /> ELearnify Live Room
              </div>
              <div className="text-sm text-[var(--text-secondary)]">Room: {liveClass.roomName}</div>
            </div>
            {scriptError ? (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                Could not load the live room script. You can still open the room in a new tab.
                <a href={liveClass.meetingLink} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 underline dark:text-blue-400">
                  Open room
                </a>
              </div>
            ) : (
              <div ref={meetRef} className="min-h-[650px] bg-[var(--bg-secondary)]" />
            )}
          </section>
        )}

        {(liveClass.agenda?.length > 0 || liveClass.resources?.length > 0) && (
          <section className="grid gap-5 md:grid-cols-2">
            {liveClass.agenda?.length > 0 && (
              <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Class Agenda</h3>
                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                  {liveClass.agenda.map((point) => <li key={point} className="flex gap-2"><Video size={16} className="mt-0.5 text-blue-500" /> {point}</li>)}
                </ul>
              </div>
            )}
            {liveClass.resources?.length > 0 && (
              <div className="rounded-[2rem] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
                <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Resources</h3>
                <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                  {liveClass.resources.map((resource) => <li key={resource} className="flex gap-2"><ExternalLink size={16} className="mt-0.5 text-blue-500" /> {resource}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default LiveClassRoomPage;
