'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import axios from '@/app/utils/axios';
import toast from 'react-hot-toast';
import { FaSpinner, FaTimes, FaChevronLeft, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { IoMdImages } from 'react-icons/io';
import { MdVideoLibrary } from 'react-icons/md';
import { addNewPost } from '../features/postsSlice';
import { useAppDispatch } from '../store/hook';
interface CroppedAreaPixels {
    width: number;
    height: number;
    x: number;
    y: number;
}

interface MediaItem {
    id: string;
    src: string;
    type: 'image' | 'video';
    croppedAreaPixels: CroppedAreaPixels | null;
}

const CreatePost: React.FC = () => {
    const dispatch = useAppDispatch()
    const [step, setStep] = useState<'select' | 'edit' | 'details'>('select');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();
    const [locationInput, setLocationInput] = useState('');
    const [location, setLocation] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const timerRef = useRef<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const currentMedia = mediaItems[currentMediaIndex];

    // Fetch places from Google Places API
    const fetchPlaces = useCallback(async (query: string) => {
        if (!query) return setSuggestions([]);
        const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${key}`;
        try {
            const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            const places = data.predictions.map((p: any) => p.description);
            setSuggestions(places);
        } catch (err) {
            console.error('Places API error:', err);
        }
    }, []);

    const onLocationChange = (v: string) => {
        setLocationInput(v);
        clearTimeout(timerRef.current ?? undefined);
        timerRef.current = window.setTimeout(() => fetchPlaces(v), 300);
    };

    const selectLocation = (loc: string) => {
        setLocation(loc);
        setLocationInput(loc);
        setSuggestions([]);
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: CroppedAreaPixels) => {
        const updatedMedia = [...mediaItems];
        updatedMedia[currentMediaIndex].croppedAreaPixels = croppedAreaPixels;
        setMediaItems(updatedMedia);
    }, [mediaItems, currentMediaIndex]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const newMediaItems = [...mediaItems];

        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i];
            const isVideo = file.type.includes('video');

            try {
                const src = await readFile(file);
                newMediaItems.push({
                    id: Math.random().toString(36).substring(7),
                    src,
                    type: isVideo ? 'video' : 'image',
                    croppedAreaPixels: null
                });
            } catch (err) {
                console.error('Error reading file:', err);
                toast.error(`Could not process ${file.name}`);
            }
        }

        setMediaItems(newMediaItems);
        if (newMediaItems.length > 0) {
            setCurrentMediaIndex(newMediaItems.length - 1);
            setStep('edit');
        }
    };

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const getCroppedImg = async (media: MediaItem): Promise<Blob | null> => {
        if (!media.croppedAreaPixels || media.type === 'video') {
            // For videos or uncropped images, return original
            const response = await fetch(media.src);
            return await response.blob();
        }

        const image = await createImage(media.src);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const { width, height, x, y } = media.croppedAreaPixels;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(
            image,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height
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
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });
    };

    const handleUpload = async () => {
        if (!title || mediaItems.length === 0) {
            toast.error('Please add a title and at least one media item');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('location', location);
            tags.forEach(tag => formData.append('tags', tag));

            // Process each media item
            for (let i = 0; i < mediaItems.length; i++) {
                const media = mediaItems[i];
                const blob = await getCroppedImg(media);
                if (blob) {
                    const fileExt = media.type === 'video' ? 'mp4' : 'jpg';
                    formData.append('files', blob, `media_${i}.${fileExt}`);
                }
                setUploadProgress(((i + 1) / mediaItems.length) * 100);
            }

            const res = await axios.post('/api/posts/create/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });
            const newPost = res.data;
            console.log("post-res ", res.data)
            toast.success('Post created successfully!');
            dispatch(addNewPost(newPost));
            router.push('/posts');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed. Please try again.');
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

    const removeMedia = (id: string) => {
        const newMedia = mediaItems.filter(item => item.id !== id);
        setMediaItems(newMedia);
        if (newMedia.length === 0) {
            setStep('select');
        } else if (currentMediaIndex >= newMedia.length) {
            setCurrentMediaIndex(newMedia.length - 1);
        }
    };

    const goBack = () => {
        if (step === 'edit') {
            if (mediaItems.length === 0) {
                setStep('select');
            } else {
                setStep('select');
            }
        } else if (step === 'details') {
            setStep('edit');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white min-h-screen">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                {step !== 'select' ? (
                    <button onClick={goBack} className="text-blue-500">
                        <FaChevronLeft size={20} />
                    </button>
                ) : (
                    <div></div>
                )}
                <h1 className="text-lg font-semibold">
                    {step === 'select' ? 'New Post' :
                        step === 'edit' ? 'Crop' : 'New Post'}
                </h1>
                {step === 'details' ? (
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="text-blue-500 font-semibold"
                    >
                        {loading ? 'Sharing...' : 'Share'}
                    </button>
                ) : (
                    <div></div>
                )}
            </div>

            {/* Progress Bar */}
            {loading && (
                <div className="w-full bg-gray-200 h-1">
                    <div
                        className="bg-blue-500 h-1 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            {/* Content Area */}
            <div className="p-4">
                {step === 'select' && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center">
                            <IoMdImages size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-lg mb-4">Drag photos and videos here</p>
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                                Select from computer
                            </button>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                ref={inputRef}
                                className="hidden"
                                multiple
                            />
                        </div>
                    </div>
                )}

                {step === 'edit' && mediaItems.length > 0 && (
                    <div>
                        {/* Media display area */}
                        <div className="relative w-full bg-black" style={{ height: '400px' }}>
                            {currentMedia.type === 'image' ? (
                                <Cropper
                                    image={currentMedia.src}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                    cropShape="rect"
                                    showGrid={false}
                                    classes={{
                                        containerClassName: 'rounded-lg',
                                        mediaClassName: 'rounded-lg',
                                    }}
                                />
                            ) : (
                                <video
                                    src={currentMedia.src}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Media thumbnails */}
                        <div className="flex overflow-x-auto py-4 gap-2">
                            {mediaItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => setCurrentMediaIndex(index)}
                                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden ${currentMediaIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    {item.type === 'image' ? (
                                        <img
                                            src={item.src}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative w-full h-full bg-gray-800">
                                            <video
                                                src={item.src}
                                                className="w-full h-full object-cover"
                                            />
                                            <MdVideoLibrary className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMedia(item.id);
                                        }}
                                        className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full p-1"
                                    >
                                        <FaTimes size={10} />
                                    </button>
                                </div>
                            ))}
                            <div
                                onClick={() => inputRef.current?.click()}
                                className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center cursor-pointer"
                            >
                                <FaPlus className="text-gray-400" />
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    ref={inputRef}
                                    className="hidden"
                                    multiple
                                />
                            </div>
                        </div>

                        {/* Zoom controls */}
                        {currentMedia.type === 'image' && (
                            <div className="mb-4">
                                <label htmlFor="zoom" className="block mb-2">Zoom:</label>
                                <input
                                    id="zoom"
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Next button */}
                        <button
                            onClick={() => setStep('details')}
                            className="w-full bg-blue-500 text-white py-2 rounded-md mt-4"
                        >
                            Next
                        </button>
                    </div>
                )}

                {step === 'details' && (
                    <div>
                        {/* Caption input */}
                        <div className="mb-4">
                            <textarea
                                placeholder="Write a caption..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 h-24"
                                disabled={loading}
                            />
                        </div>

                        {/* Location input */}
                        <div className="mb-4 relative">
                            <label className="block mb-1 text-gray-700">Add Location</label>
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

                        {/* Media preview */}
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="font-medium mb-2">Media ({mediaItems.length})</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {mediaItems.map((item) => (
                                    <div key={item.id} className="relative aspect-square">
                                        {item.type === 'image' ? (
                                            <img
                                                src={item.src}
                                                alt=""
                                                className="w-full h-full object-cover rounded"
                                            />
                                        ) : (
                                            <div className="relative w-full h-full bg-gray-800 rounded">
                                                <video
                                                    src={item.src}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                                <MdVideoLibrary className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePost;