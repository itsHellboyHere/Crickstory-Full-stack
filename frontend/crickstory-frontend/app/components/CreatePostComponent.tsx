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
    const [locationInput, setLocationInput] = useState('')
    const [location, setLocation] = useState('')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const timerRef = useRef<number | null>(null)
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // throttled search to Google Places
    const fetchPlaces = useCallback(async (query: string) => {
        if (!query) return setSuggestions([])
        const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${key}`
        try {
            const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
            const data = await res.json()
            const places = data.predictions.map((p: any) => p.description)
            setSuggestions(places)
        } catch (err) {
            console.error('Places API error:', err)
        }
    }, [])

    const onLocationChange = (v: string) => {
        setLocationInput(v)
        clearTimeout(timerRef.current ?? undefined)
        timerRef.current = window.setTimeout(() => fetchPlaces(v), 300)
    }

    const selectLocation = (loc: string) => {
        setLocation(loc)
        setLocationInput(loc)
        setSuggestions([])
    }

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
        formData.append('location', location)
        tags.forEach(tag => formData.append('tags', tag));
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
    const handleAddTag = () => {
        const newTag = tagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
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
            <div className="mb-4 relative">
                <label className="block mb-1 text-gray-700">Location</label>
                <input
                    type="text"
                    value={locationInput}
                    onChange={e => onLocationChange(e.target.value)}
                    placeholder="Search location..."
                    className="w-full border rounded p-2"
                    disabled={loading}
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border rounded shadow mt-1 w-full max-h-48 overflow-y-auto">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                onClick={() => selectLocation(s)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >{s}</li>
                        ))}
                    </ul>
                )}
            </div>
            {/* Tag Input */}
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded p-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="ml-2 text-blue-500 hover:text-red-500"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                                e.preventDefault();
                                handleAddTag();
                            }
                        }}
                        className="flex-1 border-none focus:ring-0 outline-none"
                        disabled={loading}
                    />
                </div>
            </div>
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
