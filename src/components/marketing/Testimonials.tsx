import React from 'react';
import { useApp } from '../../context/AppContext';
import { SEED_REVIEWS } from '../../services/mockData';
import { Star, ShieldCheck, Quote, ThumbsUp } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { t, language } = useApp();

  if (!SEED_REVIEWS || SEED_REVIEWS.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'មតិយោបល់ពិតពីប្រតិភូដែលបានចូលរួម ១០០%' : '100% Verified Traveler Reviews'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('testimonialsTitle')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t('testimonialsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SEED_REVIEWS.map(rev => (
            <div
              key={rev.id}
              className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 shadow-xs hover:shadow-lg"
            >
              <div className="space-y-3">
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    {t('verifiedBadge') || 'Verified'}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Traveler Bio */}
              <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3">
                <img
                  src={rev.userAvatar}
                  alt={rev.userName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border-2 border-sky-500"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {rev.userName}
                  </h4>
                  <div className="text-[10px] text-slate-500 truncate">{rev.userCountry}</div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold truncate mt-0.5">
                    {rev.packageTitle.split('&')[0]}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
