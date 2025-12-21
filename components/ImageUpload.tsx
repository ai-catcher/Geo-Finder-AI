
import React, { useRef } from 'react';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:border-blue-500 transition-colors cursor-pointer group"
         onClick={() => fileInputRef.current?.click()}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-lg font-medium text-slate-700">点击或将图片拖拽至此</p>
      <p className="text-sm text-slate-500 mt-1">支持 PNG, JPG 或 WebP (最大 10MB)</p>
    </div>
  );
};
