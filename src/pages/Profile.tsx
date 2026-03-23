import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Clock, CreditCard, Pause, Trash2, Upload, Loader2, FileText } from 'lucide-react';

function KycSection() {
  const { user, profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [kycError, setKycError] = useState('');
  const [kycSuccess, setKycSuccess] = useState('');

  async function handleUpload(file: File) {
    if (!user) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setKycError('Please upload a JPG, PNG, WebP, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setKycError('File must be under 10MB.');
      return;
    }

    setUploading(true);
    setKycError('');
    setKycSuccess('');

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${user.id}/kyc_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ kyc_document_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setKycSuccess('Document uploaded successfully. Our team will review it shortly.');
    } catch {
      setKycError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  if (profile?.kyc_verified) {
    return (
      <div className="mt-6 p-4 rounded-lg border border-green-200 bg-green-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Identity Verification</h3>
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Identity Verified</span>
        </div>
      </div>
    );
  }

  if (profile?.kyc_document_url) {
    return (
      <div className="mt-6 p-4 rounded-lg border border-amber-200 bg-amber-50">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Identity Verification</h3>
        <div className="flex items-center space-x-2 text-amber-600 mb-2">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Document Submitted — Pending Review</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FileText className="h-4 w-4" />
          <span>Your ID document has been uploaded. We'll verify it within 1-2 business days.</span>
        </div>
        {kycError && (
          <div className="mt-3 text-sm text-red-600">{kycError}</div>
        )}
        {kycSuccess && (
          <div className="mt-3 text-sm text-green-600">{kycSuccess}</div>
        )}
        <div className="mt-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Re-upload Document
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Identity Verification</h3>
      <p className="text-sm text-gray-500 mb-3">
        Upload a government-issued photo ID (driver's licence or passport) to verify your identity.
      </p>
      {kycError && (
        <div className="mb-3 text-sm text-red-600">{kycError}</div>
      )}
      {kycSuccess && (
        <div className="mb-3 text-sm text-green-600">{kycSuccess}</div>
      )}
      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors">
        <span className="flex items-center gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload ID Document
        </span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
      </label>
      <p className="mt-2 text-xs text-gray-500">
        Accepted: JPG, PNG, WebP, PDF. Max 10MB.
      </p>
    </div>
  );
}

export function Profile() {
  const { user, profile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !user) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName, phone })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePause() {
    if (!user) return;
    try {
      const { error: pauseError } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'paused' as const })
        .eq('id', user.id);
      if (pauseError) throw pauseError;
      setShowPauseModal(false);
      window.location.reload();
    } catch (err) {
      setError('Failed to pause account. Please try again.');
      setShowPauseModal(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    try {
      const { error: deleteError } = await supabase
        .from('user_profiles')
        .update({ subscription_status: 'cancelled' as const })
        .eq('id', user.id);
      if (deleteError) throw deleteError;
      setShowDeleteModal(false);
      await signOut();
    } catch (err) {
      setError('Failed to delete account. Please try again.');
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                Profile updated successfully!
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  bg-gray-50 text-gray-900 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-600
                  focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-blue-600
                  focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
              <input
                type="text"
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                  bg-gray-50 text-gray-900 cursor-not-allowed"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <KycSection />

          <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
            {profile?.stripe_payment_method_id ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-700">
                  <CreditCard className="h-5 w-5" />
                  <span>Card ending in ****{profile.stripe_payment_method_id.slice(-4)}</span>
                </div>
                <Link to="/billing" className="text-blue-600 text-sm hover:underline">
                  Update Card
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">No payment method on file</span>
                <Link to="/billing" className="text-blue-600 text-sm hover:underline">
                  Add Card
                </Link>
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Controls</h3>

            {profile?.subscription_status !== 'paused' && profile?.subscription_status !== 'cancelled' && (
              <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50 mb-4">
                <div>
                  <p className="font-medium text-amber-800">Pause Betting</p>
                  <p className="text-sm text-amber-700">Temporarily stop all automated betting</p>
                </div>
                <button onClick={() => setShowPauseModal(true)} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                  <Pause className="h-4 w-4 inline mr-1" /> Pause
                </button>
              </div>
            )}

            {profile?.subscription_status === 'paused' && (
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 mb-4">
                <p className="font-medium text-amber-800">Account is paused</p>
                <p className="text-sm text-amber-700 mb-2">Your automated betting is currently paused.</p>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-700">Delete Account</p>
                <p className="text-sm text-red-600">Permanently cancel your EVA subscription</p>
              </div>
              <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                <Trash2 className="h-4 w-4 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pause Betting?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will temporarily stop all automated betting on your account. You can resume at any time from your profile or billing page.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePause}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
              >
                Confirm Pause
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently cancel your EVA subscription and sign you out. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
