import { useState } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { publicKey, urlEndpoint, authenticator } from '../lib/imagekit';
import { Button } from './Button';
import { Upload, X, Check, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ImageUpload({ onUploadSuccess, folder = "/tournament" }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(null);

  const onError = (err) => {
    console.error("ImageKit Upload Error:", err);
    setUploading(false);
    setProgress(0);
    
    // Provide more specific error messages
    const errorMsg = err.message || "Upload failed. Check your ImageKit keys.";
    toast.error(errorMsg, { duration: 5000 });
    setPreview(null);
  };

  const onSuccess = (res) => {
    setUploading(false);
    setProgress(100);
    setPreview(res.url);
    onUploadSuccess(res.url);
    toast.success("Image uploaded successfully!");
  };

  const onUploadStart = () => {
    setUploading(true);
    setProgress(0);
  };

  const onUploadProgress = (progress) => {
    const percentage = Math.round((progress.loaded / progress.total) * 100);
    setProgress(percentage);
  };

  return (
    <IKContext 
      publicKey={publicKey} 
      urlEndpoint={urlEndpoint} 
      authenticator={authenticator}
    >
      <div className="space-y-4">
        <div 
          className={`relative h-48 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
            ${preview ? 'border-primary/50 bg-primary/5' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-primary/30'}`}
        >
          {preview ? (
            <div className="relative w-full h-full group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation();
                    setPreview(null); 
                    onUploadSuccess(""); 
                  }}
                  className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <label 
              htmlFor="ik-upload-input"
              className="text-center p-6 cursor-pointer w-full h-full flex flex-col items-center justify-center"
            >
              <div className="mb-3 p-3 bg-slate-100 dark:bg-white/5 rounded-full inline-block">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {uploading ? `Uploading... ${progress}%` : 'Click or Drag to Upload'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                PNG, JPG or WebP (Max 5MB)
              </p>
            </label>
          )}

          {uploading && (
            <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          )}

          <IKUpload
            id="ik-upload-input"
            fileName={`upload-${Date.now()}`}
            folder={folder}
            useUniqueFileName={true}
            onError={onError}
            onSuccess={onSuccess}
            onUploadStart={onUploadStart}
            onUploadProgress={onUploadProgress}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </IKContext>
  );
}
