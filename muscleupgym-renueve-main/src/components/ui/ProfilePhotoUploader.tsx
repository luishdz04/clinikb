'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui';

interface ProfilePhotoUploaderProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ProfilePhotoUploader({ value, onChange }: ProfilePhotoUploaderProps) {
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onChange(imageSrc);
      setShowCamera(false);
    }
  }, [onChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-3">
        Foto de perfil
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Mode */}
      {showCamera ? (
        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="relative rounded-xl overflow-hidden bg-black border-2 border-primary shadow-2xl">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full aspect-video object-cover"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'user',
              }}
            />
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="primary"
              onClick={capture}
              className="w-32"
            >
              Capturar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCamera(false)}
              className="w-32"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        /* Upload/Preview Mode */
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl bg-surface/30">
          
          {/* Avatar Preview or Placeholder */}
          <div className="relative group mb-6">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${value ? 'border-primary shadow-xl shadow-primary/20' : 'border-border bg-surface flex items-center justify-center'}`}>
              {value ? (
                <img
                  src={value}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            
            {/* Quick Remove Button (only if value exists) */}
            {value && (
              <button
                onClick={removePhoto}
                className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                title="Eliminar foto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {value ? 'Cambiar foto' : 'Subir imagen'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCamera(true)}
              className="flex-1 gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Tomar foto
            </Button>
          </div>
          
          {!value && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Formatos permitidos: JPG, PNG. Máximo 5MB.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
