'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileSection({ user, profile, supabase, markDirty, clearDirty, setProfile }: any) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '+977');
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photo_url || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = (fullName || user?.email || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const isDirty = fullName !== (profile?.full_name || '') || phone !== (profile?.phone || '+977') || !!photoFile;

  useEffect(() => {
    if (isDirty) markDirty('profile');
    else clearDirty('profile');
  }, [isDirty, markDirty, clearDirty]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!fullName.trim()) { toast.error('Full name is required'); return; }
    const phoneRegex = /^\+977\d{9,10}$/;
    if (phone && !phoneRegex.test(phone)) { toast.error('Phone must be +977 followed by 9-10 digits'); return; }

    setSaving(true);
    try {
      let photoUrl = profile?.photo_url || null;

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const res = await fetch('/api/settings/profile/photo', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        photoUrl = data.photoUrl;
      }

      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), phone, photoUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfile((prev: any) => ({ ...prev, full_name: fullName.trim(), phone, photo_url: photoUrl }));
      setPhotoFile(null);
      clearDirty('profile');
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground tracking-tight mb-1">Profile</h2>
      <p className="text-xs text-subtle font-medium mb-6">Manage your personal information and profile photo.</p>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Avatar */}
        <div className="relative group cursor-pointer mx-auto sm:mx-0" onClick={() => fileRef.current?.click()}>
          {photoPreview ? (
            <img src={photoPreview} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-border-subtle" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold border-2 border-border-subtle">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Full Name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent/50 transition-all"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Phone Number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-accent/50 transition-all"
              placeholder="+9779812345678"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-subtle uppercase tracking-wider mb-1.5 block ml-1">Email</label>
            <input value={user?.email || ''} readOnly className="w-full bg-background/50 border border-border-subtle rounded-xl px-4 py-3 text-sm font-medium text-subtle cursor-not-allowed" />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
