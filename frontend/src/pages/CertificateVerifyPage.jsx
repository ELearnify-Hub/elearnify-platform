import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { certificateAPI } from '../services/api';

const CertificateVerifyPage = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await certificateAPI.verify(certificateId);
        setCertificate(data.certificate);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate not found');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-4">
        Verifying certificate...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center bg-[var(--bg-primary)] px-4">
        <div className="p-8 rounded-3xl border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-lg)]">
          <h1 className="text-2xl font-bold text-red-600">
            Invalid Certificate
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-primary)] text-[var(--text-primary)] page-enter-soft">
      <div className="max-w-2xl w-full bg-[var(--surface-1)] border border-[var(--border-light)] rounded-3xl p-8 text-center shadow-[var(--shadow-lg)]">
        <div className="text-5xl mb-4">✅</div>

        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Certificate Verified
        </h1>

        <p className="mt-4 text-[var(--text-secondary)]">
          This certificate is valid and was issued by ELearnify.
        </p>

        <div className="mt-8 space-y-3 text-left bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-2xl p-5 text-[var(--text-secondary)]">
          <p>
            <strong>Student:</strong> {certificate.studentName}
          </p>
          <p>
            <strong>Course:</strong> {certificate.courseTitle}
          </p>
          <p>
            <strong>Certificate ID:</strong> {certificate.certificateId}
          </p>
          <p>
            <strong>Issued On:</strong>{' '}
            {new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifyPage;