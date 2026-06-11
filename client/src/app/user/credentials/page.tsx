"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Save, UploadCloud, UserCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EnterpriseInput, FormField } from "@/components/forms/EnterpriseForm";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import authService from "@/services/auth.service";
import { MAX_IMAGE_SIZE_BYTES } from "@/utils/compressImage";
import uploadService from "@/services/upload.service";
import { shouldUseUnoptimizedImage } from "@/utils/imageUrl";

export default function UserCredentialsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [avatarPublicId, setAvatarPublicId] = useState<string | undefined>(undefined);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || undefined);
      setAvatarDirty(false);
    }
  }, [user]);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast({ type: "error", title: "Image too large", message: "Please choose an image under 4MB." });
      return;
    }

    try {
      setAvatarUploading(true);
      const uploaded = await uploadService.uploadImageFile(
        file,
        "avatar",
        avatarPublicId
      );
      setAvatarPreview(uploaded.imageUrl);
      setAvatarPublicId(uploaded.publicId);
      setAvatarDirty(true);
    } catch {
      showToast({ type: "error", title: "Upload failed", message: "Could not upload the selected image." });
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    setAvatarPublicId(undefined);
    setAvatarDirty(true);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      const payload: {
        name: string;
        email: string;
        phone: string;
        avatar?: string;
        avatarPublicId?: string;
      } = {
        name: String(formData.get("name") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
      };

      if (avatarDirty) {
        payload.avatar = avatarPreview || "";
        payload.avatarPublicId = avatarPublicId || "";
      }

      await authService.updateMe(payload);
      await refreshUser();
      setAvatarDirty(false);
      showToast({ type: "success", title: "Credentials updated" });
    } catch (error) {
      showToast({ type: "error", title: "Update failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);
      await authService.updatePassword({
        currentPassword: String(formData.get("currentPassword") || ""),
        newPassword: String(formData.get("newPassword") || ""),
      });
      form.reset();
      showToast({ type: "success", title: "Password updated" });
    } catch (error) {
      showToast({ type: "error", title: "Password update failed", message: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-[50vh]" />;

  if (!user) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" className="border-slate-200 bg-white text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Login required</h1>
          <p className="mt-2 text-sm text-slate-600">Login to manage your credentials.</p>
          <Link href="/login?next=/user/credentials" className="mt-6 inline-block">
            <Button>Login</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <section className="blue-hero-bg border-b border-white/10 py-12 text-white lg:py-16">
        <Container size="lg">
          <Badge variant="accent" icon={<KeyRound className="h-3 w-3" />}>User Credentials</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Manage Credentials</h1>
          <p className="mt-3 max-w-2xl text-white/72">Update your profile details and password securely.</p>
        </Container>
      </section>

      <Container size="md" className="py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Profile Details</h2>
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile photo"
                      width={64}
                      height={64}
                      unoptimized={shouldUseUnoptimizedImage(avatarPreview)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-8 w-8" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<UploadCloud className="h-4 w-4" />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={<X className="h-4 w-4" />}
                      onClick={handleRemoveAvatar}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">Profile photo is optional. JPG or PNG, up to 4MB.</p>

              <FormField label="Name">
                <EnterpriseInput name="name" defaultValue={user.name} required />
              </FormField>
              <FormField label="Email">
                <EnterpriseInput name="email" type="email" defaultValue={user.email} required />
              </FormField>
              <FormField label="Phone">
                <EnterpriseInput
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8,15}"
                  defaultValue={user.phone || ""}
                  placeholder="9876543210"
                />
              </FormField>
              <Button type="submit" size="lg" fullWidth loading={loading} icon={<Save className="h-4 w-4" />}>
                Save Profile
              </Button>
            </form>
          </Card>

          <Card padding="lg" className="border-slate-200 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
              <FormField label="Current Password">
                <div className="relative">
                  <EnterpriseInput name="currentPassword" type={showCurrentPassword ? "text" : "password"} required className="pr-12" />
                  <button type="button" onClick={() => setShowCurrentPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
              <FormField label="New Password" helper="Use at least 8 characters.">
                <div className="relative">
                  <EnterpriseInput name="newPassword" type={showNewPassword ? "text" : "password"} required minLength={8} className="pr-12" />
                  <button type="button" onClick={() => setShowNewPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
              <Button type="submit" variant="outline" size="lg" fullWidth loading={loading}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </>
  );
}
