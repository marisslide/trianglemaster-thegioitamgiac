import React, { useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { DiagramAngle, DiagramData, DiagramPoint, DiagramSegment } from '../types';

interface TriangleDiagramProps {
  data: DiagramData;
  compact?: boolean;
  className?: string;
}

function getUnitVector(from: DiagramPoint, to: DiagramPoint): { ux: number; uy: number; len: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { ux: dx / len, uy: dy / len, len };
}

function renderTicks(p1: DiagramPoint, p2: DiagramPoint, seg: DiagramSegment, idx: number) {
  if (!seg.ticks) return null;
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const { ux, uy } = getUnitVector(p1, p2);
  // Perpendicular vector
  const px = -uy;
  const py = ux;
  const tickHalf = 6;
  const spacing = 5.5;
  const color = seg.color || '#1E293B';

  const offsets =
    seg.ticks === 1 ? [0] : seg.ticks === 2 ? [-spacing / 2, spacing / 2] : [-spacing, 0, spacing];

  return (
    <g key={`ticks_${idx}`}>
      {offsets.map((off, i) => {
        const cx = mx + ux * off;
        const cy = my + uy * off;
        return (
          <line
            key={i}
            x1={cx - px * tickHalf}
            y1={cy - py * tickHalf}
            x2={cx + px * tickHalf}
            y2={cy + py * tickHalf}
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function renderAngleMarker(
  angle: DiagramAngle,
  pointMap: Map<string, DiagramPoint>,
  idx: number
) {
  const v = pointMap.get(angle.vertex);
  const pFrom = pointMap.get(angle.from);
  const pTo = pointMap.get(angle.to);
  if (!v || !pFrom || !pTo) return null;

  const u1 = getUnitVector(v, pFrom);
  const u2 = getUnitVector(v, pTo);
  const color = angle.color || '#2563EB';

  if (angle.isRightAngle) {
    const sz = 14;
    const c1x = v.x + u1.ux * sz;
    const c1y = v.y + u1.uy * sz;
    const c2x = v.x + u2.ux * sz;
    const c2y = v.y + u2.uy * sz;
    const cornerX = v.x + (u1.ux + u2.ux) * sz;
    const cornerY = v.y + (u1.uy + u2.uy) * sz;
    return (
      <g key={`ang_${idx}`}>
        <polygon
          points={`${v.x},${v.y} ${c1x},${c1y} ${cornerX},${cornerY} ${c2x},${c2y}`}
          fill={`${color}1F`}
        />
        <polyline
          points={`${c1x},${c1y} ${cornerX},${cornerY} ${c2x},${c2y}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="miter"
        />
      </g>
    );
  }

  // Compute signed shortest angle from u1 to u2 in SVG coordinates
  const a1 = Math.atan2(u1.uy, u1.ux);
  const a2 = Math.atan2(u2.uy, u2.ux);
  let diff = a2 - a1;
  while (diff <= -Math.PI) diff += 2 * Math.PI;
  while (diff > Math.PI) diff -= 2 * Math.PI;

  const sweepFlag = diff >= 0 ? 1 : 0;
  const baseRadius = angle.radius ?? 22;
  const arcCount = angle.arcs ?? 1;

  // Bisector direction for label placement
  const midAngle = a1 + diff / 2;
  const labelDist = baseRadius + (arcCount - 1) * 5 + 16;
  const lx = v.x + Math.cos(midAngle) * labelDist;
  const ly = v.y + Math.sin(midAngle) * labelDist;

  return (
    <g key={`ang_${idx}`}>
      {angle.highlight && (
        <path
          d={`M ${v.x} ${v.y} L ${v.x + Math.cos(a1) * baseRadius} ${
            v.y + Math.sin(a1) * baseRadius
          } A ${baseRadius} ${baseRadius} 0 0 ${sweepFlag} ${
            v.x + Math.cos(a2) * baseRadius
          } ${v.y + Math.sin(a2) * baseRadius} Z`}
          fill={`${color}24`}
        />
      )}
      {Array.from({ length: arcCount }).map((_, k) => {
        const r = baseRadius + k * 5;
        const sx = v.x + Math.cos(a1) * r;
        const sy = v.y + Math.sin(a1) * r;
        const ex = v.x + Math.cos(a2) * r;
        const ey = v.y + Math.sin(a2) * r;
        return (
          <path
            key={k}
            d={`M ${sx} ${sy} A ${r} ${r} 0 0 ${sweepFlag} ${ex} ${ey}`}
            fill="none"
            stroke={color}
            strokeWidth={angle.highlight ? 2.4 : 1.9}
            strokeLinecap="round"
          />
        );
      })}
      {angle.label && (
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="12.5"
          fontWeight="700"
          fill={color}
          className="select-none"
        >
          {angle.label}
        </text>
      )}
    </g>
  );
}

export const TriangleDiagram: React.FC<TriangleDiagramProps> = ({
  data,
  compact = false,
  className = '',
}) => {
  const [zoom, setZoom] = useState(1);

  const pointMap = useMemo(() => {
    const map = new Map<string, DiagramPoint>();
    for (const pt of data.points) {
      map.set(pt.id, pt);
    }
    return map;
  }, [data.points]);

  const viewBox = data.viewBox || '0 0 460 200';

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/80">
        <span className="text-xs font-medium text-slate-600">
          {data.caption || 'Hình vẽ hình học tương tác'}
        </span>
        {!compact && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
              title="Thu nhỏ hình"
              aria-label="Thu nhỏ hình"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono tabular-nums text-slate-500 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
              title="Phóng to hình"
              aria-label="Phóng to hình"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoom !== 1 && (
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors"
                title="Đặt lại tỉ lệ"
                aria-label="Đặt lại tỉ lệ"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto flex items-center justify-center p-3 sm:p-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="w-full max-w-[480px]"
        >
          <svg
            viewBox={viewBox}
            className="w-full h-auto block overflow-visible"
            role="img"
            aria-label={data.caption || 'Hình vẽ tam giác'}
          >
            {/* Triangle Fills */}
            {(data.fills ?? []).map((f, idx) => {
              const pts = f.vertices
                .map((vid) => pointMap.get(vid))
                .filter((p): p is DiagramPoint => Boolean(p));
              if (pts.length !== 3) return null;
              return (
                <polygon
                  key={`fill_${idx}`}
                  points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill={f.fill || '#EFF6FF'}
                />
              );
            })}

            {/* Angle Arcs & Right Angle Squares */}
            {(data.angles ?? []).map((ang, idx) => renderAngleMarker(ang, pointMap, idx))}

            {/* Segments & Tick Marks */}
            {data.segments.map((seg, idx) => {
              const p1 = pointMap.get(seg.from);
              const p2 = pointMap.get(seg.to);
              if (!p1 || !p2) return null;
              const strokeColor = seg.color || '#1E293B';
              const strokeWidth = seg.highlight ? 3.2 : 2.2;
              const mx = (p1.x + p2.x) / 2 + (seg.labelOffset?.dx ?? 0);
              const my = (p1.y + p2.y) / 2 + (seg.labelOffset?.dy ?? 0);

              return (
                <g key={`seg_${idx}`}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={seg.dashed ? '6 5' : undefined}
                    strokeLinecap="round"
                  />
                  {renderTicks(p1, p2, seg, idx)}
                  {seg.label && (
                    <text
                      x={mx}
                      y={my}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="12"
                      fontWeight="600"
                      fill={seg.color || '#334155'}
                      className="select-none"
                    >
                      {seg.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Vertex Points & Labels */}
            {data.points.map((pt) => {
              const isNamed = Boolean(pt.label && pt.label.trim());
              return (
                <g key={`pt_${pt.id}`}>
                  {isNamed && pt.label.length <= 2 && pt.label === pt.label.toUpperCase() && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={3.5}
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth={2}
                    />
                  )}
                  {isNamed && (
                    <text
                      x={pt.x + (pt.labelOffset?.dx ?? 0)}
                      y={pt.y + (pt.labelOffset?.dy ?? -12)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="14.5"
                      fontWeight="700"
                      fill="#0F172A"
                      fontStyle={pt.label === pt.label.toLowerCase() ? 'italic' : 'normal'}
                      className="select-none"
                    >
                      {pt.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {data.notToScale && (
        <div className="px-4 py-1.5 bg-amber-50/70 border-t border-amber-100 text-[12px] text-amber-800 text-center font-medium">
          Hình vẽ minh họa, không theo tỉ lệ — chỉ căn cứ vào dữ kiện và kí hiệu toán học đã cho.
        </div>
      )}
    </div>
  );
};
