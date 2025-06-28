'use client'
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import axios from '@/app/utils/axios';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
interface CroppedAreaPixels {
    width: number;
    height: number;
    x: number;
    y: number;
}

const CreatePost: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter()
    const onCropComplete = useCallback((_: any, croppedAreaPixels: CroppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
        }
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result as string));
            reader.readAsDataURL(file);
        });
    };

    const getCroppedImg = async (): Promise<Blob | null> => {
        if (!imageSrc || !croppedAreaPixels) return null;

        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg');
        });
    };

    const createImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });
    };

    const handleUpload = async () => {
        setLoading(true);

        const croppedImageBlob = await getCroppedImg();
        if (!croppedImageBlob) {
            toast.error('Failed to crop image.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', croppedImageBlob, 'cropped.jpg');

        try {
            await axios.post('/api/posts/create/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post created successfully!');
            setImageSrc(null);
            setTitle('');
            router.push('/posts')
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Post</h1>

            <input
                type="text"
                placeholder="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 mb-4"
                disabled={loading}
            />

            <div
                onClick={() => inputRef.current?.click()}
                className={`w-full h-8 mb-4 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                <span className="text-gray-600">Click to select an image</span>
            </div>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={inputRef}
                className="hidden"
                disabled={loading}
            />

            {imageSrc && (
                <div className="relative w-full h-64 bg-gray-200 mb-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>
            )}

            {imageSrc && (
                <div className="mb-4">
                    <label htmlFor="zoom">Zoom:</label>
                    <input
                        id="zoom"
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full"
                        disabled={loading}
                    />
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!imageSrc || !title || loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-white transition ${loading ? 'bg-gray-400 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
            >
                {loading ? (
                    <>
                        <FaSpinner className="animate-spin" />
                        Uploading...
                    </>
                ) : (
                    'Upload Post'
                )}
            </button>
        </div>
    );
};

export default CreatePost;
