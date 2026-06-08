import { useEffect, useState } from 'react';
import { certificateAPI } from '../services/api';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await certificateAPI.getAll();
        setCertificates(data.certificates || []);
      } catch (error) {
        console.error('Failed to fetch certificates', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading certificates...</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-gray-900 dark:text-white">
          Issued Certificates
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
            <tr>
              <th className="text-left p-4">Certificate ID</th>
              <th className="text-left p-4">Student</th>
              <th className="text-left p-4">Course</th>
              <th className="text-left p-4">Issued</th>
            </tr>
          </thead>

          <tbody>
            {certificates.map(cert => (
              <tr
                key={cert._id}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="p-4 font-medium text-blue-600">
                  {cert.certificateId}
                </td>
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  {cert.studentName}
                </td>
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  {cert.courseTitle}
                </td>
                <td className="p-4 text-gray-500">
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {certificates.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No certificates issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCertificates;