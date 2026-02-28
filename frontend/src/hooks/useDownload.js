import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Shared hook for downloading generated documents.
 *
 * @returns {{ download: Function }}
 *
 * `download` accepts:
 *   - historyId {string}  - Generation history ID
 *   - format    {string}  - File format ('pdf' or 'docx')
 *   - prefix    {string}  - Filename prefix (e.g. 'resume' or 'project')
 */
const useDownload = () => {
  const download = async (historyId, format, prefix) => {
    if (!historyId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/download/${historyId}/${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${prefix}_${historyId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return { download };
};

export default useDownload;
