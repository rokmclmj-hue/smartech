"use client";
import { useState } from "react";
import Link from "next/link";
import { INDUSTRIES } from "@/lib/industries";

const ALL_TAGS = Array.from(new Set(INDUSTRIES.flatMap((i) => i.tag)));

export default function Industries() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const visible = activeTag
    ? INDUSTRIES.filter((i) => i.tag.includes(activeTag))
    : INDUSTRIES;

  return (
    <section id="industries" className="py-28 border-b hair bg-paper relative">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-7">
            <div className="mono text-[11px] dim mb-4">— 02 · 20 INDUSTRIES OF VACUUM</div>
            <h2 className="section-title display">
              진공은 산업의<br />
              <span className="italic">보이지 않는 기반</span>입니다.
            </h2>
            <p className="mt-6 text-[15px] max-w-[55ch] leading-[1.75] text-[#2a2823]">
              반도체부터 핵융합까지, 진공펌프는 20개 산업에서 쓰입니다.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <div className="border hair p-5 bg-white">
              <div className="mono text-[11px] dim mb-3">FILTER BY TAG</div>
              <div className="flex flex-wrap gap-2 text-[11.5px]">
                <button
                  className={`chip ${activeTag === null ? "active" : ""}`}
                  onClick={() => setActiveTag(null)}
                >
                  ALL
                </button>
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className={`chip ${activeTag === tag ? "active" : ""}`}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-t border-l hair">
          {visible.map((it) => (
            <Link
              key={it.n}
              href={`/industries/${it.slug}`}
              className="ind-card relative p-5 border-r border-b hair bg-paper hover:bg-ink hover:text-paper transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="ind-num mono text-[11px] text-[#6A6660] group-hover:text-paper/70">
                  {String(it.n).padStart(2, "0")} / 20
                </div>
                <div className="mono text-[10px] opacity-50">{it.tag[0]}</div>
              </div>

              <div className="mt-4 aspect-[4/3] relative overflow-hidden border hair bg-[#F6F4EF]">
                <img
                  src={it.image}
                  alt={it.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="mt-5 display text-[26px] leading-[1.1]">{it.title}</div>
              <div className="mt-2 text-[12.5px] leading-[1.55] opacity-80 max-w-[26ch]">{it.line}</div>

              <div className="mt-5 pt-4 border-t border-dashed border-current/20">
                <div className="mono text-[10px] opacity-60 mb-2">RECOMMENDED</div>
                <div className="flex flex-wrap gap-1">
                  {it.models.slice(0, 3).map((m) => (
                    <span key={m} className="px-2 py-1 border border-current text-[10.5px]">{m}</span>
                  ))}
                  {it.models.length > 3 && (
                    <span className="px-2 py-1 text-[10.5px] opacity-60">+{it.models.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 mono text-[11px] opacity-60 group-hover:opacity-100 group-hover:text-edred flex items-center gap-1">
                자세히 보기 <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-[12.5px] dim mono flex justify-between">
          <span></span>
          <span>{visible.length} / 20 INDUSTRIES</span>
        </div>
      </div>
    </section>
  );
}
