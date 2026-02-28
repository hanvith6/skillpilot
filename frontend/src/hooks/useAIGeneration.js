import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Shared hook for all AI generation tool pages.
 *
 * @returns {{ loading: boolean, result: any, setResult: Function, historyId: string|null, generate: Function }}
 *
 * `generate` accepts an options object:
 *   - endpoint {string}       - API path, e.g. '/api/generate/resume'
 *   - payload  {object}       - Request body to POST
 *   - user     {object}       - Current user (needs .credits)
 *   - updateCredits {Function}- Callback to update credit balance in parent
 *   - successMessage {Function(creditsUsed: number): string} - Toast text on success
 *   - extractResult {Function(responseData): any} - (optional) Extract result from response.data
 */
const useAIGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [historyId, setHistoryId] = useState(null);

  const generate = async ({ endpoint, payload, user, updateCredits, successMessage, extractResult }) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to continue');
        return;
      }

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      const data = extractResult ? extractResult(response.data) : response.data.data;
      setResult(data);
      if (response.data.history_id) {
        setHistoryId(response.data.history_id);
      }
      updateCredits(user.credits - response.data.credits_used);
      toast.success(successMessage(response.data.credits_used));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return { loading, result, historyId, generate };
};

export default useAIGeneration;
