import React, { useState, useEffect, useMemo } from 'react';
import { Play, Volume2, VolumeX, Image as ImageIcon, Film } from 'lucide-react';
import { TourVideo } from '../../types';

export interface VideoGalleryPlayerProps {
  videos?: TourVideo[];
  featuredVideoUrl?: string;
  images?: string[];
  title?: string;
  defaultMode?: 'video' | 'photo';
  aspectRatioClass?: string;
  className?: string;
  onMediaSelect?: (type: 'video' | 'photo', index: number) => void;
}

export interface VideoInfo {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  thumbnailUrl: string;
  videoId?: string;
}

export function parseVideoUrl(url: string, autoPlay = true, isMuted = true, customThumbnail?: string): VideoInfo {
  if (!url || typeof url !== 'string') {
    return { type: 'unknown', embedUrl: '', thumbnailUrl: '' };
  }

  const cleanUrl = url.trim();

  // 1. YouTube Matchers (standard, shorts, embed, shortlink)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const ytMatch = cleanUrl.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const muteParam = isMuted ? '1' : '0';
    const autoParam = autoPlay ? '1' : '0';
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoParam}&mute=${muteParam}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`,
      thumbnailUrl: customThumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  // 2. Vimeo Matchers
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+))/i;
  const vimeoMatch = cleanUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const muteParam = isMuted ? '1' : '0';
    const autoParam = autoPlay ? '1' : '0';
    return {
      type: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=${autoParam}&muted=${muteParam}&playsinline=1&title=0&byline=0&portrait=0`,
      thumbnailUrl: customThumbnail || `https://vumbnail.com/${videoId}.jpg`
    };
  }

  // 3. Direct Video (.mp4, .webm, .ogg, .mov, data:video, blob:)
  const isDirect = cleanUrl.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i) || cleanUrl.startsWith('blob:') || cleanUrl.startsWith('data:video');
  if (isDirect) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
      thumbnailUrl: customThumbnail || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80'
    };
  }

  // Fallback direct URL if not matched
  return {
    type: 'direct',
    embedUrl: cleanUrl,
    thumbnailUrl: customThumbnail || 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80'
  };
}

export const VideoGalleryPlayer: React.FC<VideoGalleryPlayerProps> = ({
  videos = [],
  featuredVideoUrl,
  images = [],
  title = 'Tour Video',
  defaultMode = 'video',
  aspectRatioClass = 'aspect-[16/9] sm:aspect-[21/9]',
  className = '',
  onMediaSelect
}) => {
  // Aggregate all playable videos
  const normalizedVideos: TourVideo[] = useMemo(() => {
    const list: TourVideo[] = [...videos];
    if (featuredVideoUrl && !list.some(v => v.url === featuredVideoUrl)) {
      list.unshift({
        id: 'feat_primary',
        title: `${title} - Official Mission Video Tour`,
        url: featuredVideoUrl,
        isFeatured: true
      });
    }
    return list;
  }, [videos, featuredVideoUrl, title]);

  const hasVideos = normalizedVideos.length > 0;
  const hasImages = images.length > 0;

  // Set default active mode to 'video' if video exists, otherwise fallback to 'photo'
  const initialMode = hasVideos ? (defaultMode === 'photo' && hasImages ? 'photo' : 'video') : 'photo';
  const [activeMediaMode, setActiveMediaMode] = useState<'video' | 'photo'>(initialMode);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted so browser allows auto-play

  // Sync mode when package/videos change
  useEffect(() => {
    if (hasVideos) {
      setActiveMediaMode('video');
      setActiveVideoIdx(0);
    } else if (hasImages) {
      setActiveMediaMode('photo');
      setActivePhotoIdx(0);
    }
  }, [hasVideos, hasImages, normalizedVideos.length]);

  const currentVideo = normalizedVideos[activeVideoIdx] || normalizedVideos[0];
  const videoInfo = useMemo(() => {
    if (!currentVideo) return null;
    return parseVideoUrl(currentVideo.url, true, isMuted, currentVideo.thumbnailUrl);
  }, [currentVideo, isMuted]);

  const handleSelectVideo = (idx: number) => {
    setActiveMediaMode('video');
    setActiveVideoIdx(idx);
    if (onMediaSelect) onMediaSelect('video', idx);
  };

  const handleSelectPhoto = (idx: number) => {
    setActiveMediaMode('photo');
    setActivePhotoIdx(idx);
    if (onMediaSelect) onMediaSelect('photo', idx);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* ── Main Media Display Container ── */}
      <div className={`relative ${aspectRatioClass} rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 group`}>
        {activeMediaMode === 'video' && videoInfo ? (
          /* VIDEO PLAYER (Default Auto-Play) */
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            {videoInfo.type === 'direct' ? (
              <video
                key={videoInfo.embedUrl}
                src={videoInfo.embedUrl}
                autoPlay
                muted={isMuted}
                playsInline
                controls
                loop
                className="w-full h-full object-cover"
              />
            ) : (
              <iframe
                key={`${videoInfo.embedUrl}-${isMuted}`}
                src={videoInfo.embedUrl}
                title={currentVideo?.title || 'Tour Package Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0"
              />
            )}

            {/* Overlaid Badges & Sound Controller */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-xl bg-red-600/90 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Featured Video Tour</span>
              </span>
            </div>

            <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={isMuted ? 'Click to Unmute Sound' : 'Click to Mute Sound'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Unmute Sound</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Sound On</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Video Title Strip */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 pt-8 pointer-events-none flex items-end justify-between text-white">
              <div className="space-y-0.5 truncate pr-4">
                <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="truncate">{currentVideo?.title || title}</span>
                </div>
                {currentVideo?.duration && (
                  <div className="text-[11px] text-slate-300 font-mono">Duration: {currentVideo.duration}</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* PHOTO DISPLAY */
          <div className="w-full h-full relative">
            <img
              src={images[activePhotoIdx] || images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format&fit=crop&q=80'}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute bottom-3 left-3 bg-slate-950/75 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Photo {activePhotoIdx + 1} of {images.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Combined Media Thumbnail Selector (Videos + Photos) ── */}
      {(normalizedVideos.length > 0 || images.length > 1) && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* 1. Video Gallery Thumbnails */}
          {normalizedVideos.map((vid, idx) => {
            const isSelected = activeMediaMode === 'video' && activeVideoIdx === idx;
            const parsed = parseVideoUrl(vid.url, false, true);
            const thumb = vid.thumbnailUrl || parsed.thumbnailUrl || (images.length > 0 ? images[0] : '');

            return (
              <button
                key={vid.id || idx}
                type="button"
                onClick={() => handleSelectVideo(idx)}
                className={`relative shrink-0 w-24 sm:w-28 h-16 sm:h-18 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group bg-slate-900 ${
                  isSelected
                    ? 'border-red-500 scale-105 shadow-lg ring-2 ring-red-500/30'
                    : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-400'
                }`}
                title={`Play Video: ${vid.title}`}
              >
                <img
                  src={thumb}
                  alt={vid.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                    isSelected ? 'bg-red-600 text-white animate-pulse' : 'bg-white/90 text-slate-900 group-hover:scale-110'
                  }`}>
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                  Video
                </div>
              </button>
            );
          })}

          {/* 2. Photo Gallery Thumbnails */}
          {images.map((img, idx) => {
            const isSelected = activeMediaMode === 'photo' && activePhotoIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPhoto(idx)}
                className={`relative shrink-0 w-24 sm:w-28 h-16 sm:h-18 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group bg-slate-900 ${
                  isSelected
                    ? 'border-sky-500 scale-105 shadow-lg ring-2 ring-sky-500/30'
                    : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-400'
                }`}
                title={`View Photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Gallery Photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                  Photo
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
