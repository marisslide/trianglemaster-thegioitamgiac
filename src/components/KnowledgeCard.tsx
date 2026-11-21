import React from 'react';
import { AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';
import { KnowledgeSection } from '../types';
import { TriangleDiagram } from './TriangleDiagram';

interface KnowledgeCardProps {
  section: KnowledgeSection;
  accentColor: string;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ section, accentColor }) => {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            {section.title}
          </h3>
        </div>
      </div>

      {section.formula && (
        <div
          className="rounded-xl px-4 py-3.5 border text-sm sm:text-base font-math font-semibold text-slate-900"
          style={{
            backgroundColor: `${accentColor}0D`,
            borderColor: `${accentColor}33`,
          }}
        >
          {section.formula}
        </div>
      )}

      <div className={section.diagramData ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : ''}>
        <div className={section.diagramData ? 'lg:col-span-7 space-y-4' : 'space-y-4'}>
          <ul className="space-y-2.5">
            {section.points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-700">
                <CheckCircle2
                  className="w-4 h-4 mt-1 shrink-0"
                  style={{ color: accentColor }}
                />
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          {section.warning && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-950 font-medium leading-relaxed">
                {section.warning}
              </p>
            </div>
          )}

          {section.example && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
              <div className="text-sm font-bold text-slate-900">{section.example.title}</div>
              <p className="text-sm text-slate-700 font-medium">{section.example.given}</p>
              <div className="space-y-1 pl-3 border-l border-slate-300 text-sm text-slate-700 font-math">
                {section.example.solution.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div className="text-sm font-semibold text-blue-700 pt-1">
                {section.example.conclusion}
              </div>
            </div>
          )}
        </div>

        {section.diagramData && (
          <div className="lg:col-span-5">
            <TriangleDiagram data={section.diagramData} />
          </div>
        )}
      </div>
    </article>
  );
};
