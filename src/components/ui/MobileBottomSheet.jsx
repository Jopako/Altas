/**
 * MobileBottomSheet — Painel inferior deslizável (só mobile).
 * Dois snap points: "peek" (mostra um resumo) e "full" (mostra tudo, com scroll interno).
 * Arrasta pelo handle; também dá pra tocar no handle pra alternar.
 */
import { useEffect, useRef, useState } from 'react';

const SNAP_PEEK = 0.15;   // 15% da altura da tela
const SNAP_FULL = 0.85;   // 85% da altura da tela

export function MobileBottomSheet({ theme, children }) {
    const isDark = theme === 'dark';
    const [snap, setSnap] = useState('peek');
    const [dragY, setDragY] = useState(0);
    const [dragging, setDragging] = useState(false);
    const startYRef = useRef(0);
    const startSnapRef = useRef('peek');
    const sheetRef = useRef(null);
    const contentRef = useRef(null);

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const fullH = vh * SNAP_FULL;
    const peekH = vh * SNAP_PEEK;
    const targetH = snap === 'full' ? fullH : peekH;
    const currentH = Math.max(peekH * 0.6, Math.min(fullH + 40, targetH - dragY));

    const onPointerDown = (e) => {
        startYRef.current = e.clientY;
        startSnapRef.current = snap;
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!dragging) return;
        const dy = e.clientY - startYRef.current;
        setDragY(dy);
    };

    const onPointerUp = () => {
        if (!dragging) return;
        setDragging(false);
        const threshold = 60;
        if (dragY > threshold) {
            setSnap('peek');
        } else if (dragY < -threshold) {
            setSnap('full');
        } else {
            setSnap(startSnapRef.current === 'peek' ? 'full' : 'peek');
        }
        setDragY(0);
    };

    useEffect(() => {
        const onResize = () => setSnap('peek');
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <div
            ref={sheetRef}
            className={`lg:hidden fixed left-0 right-0 bottom-0 rounded-t-3xl border-t shadow-[0_-8px_30px_rgba(0,0,0,0.35)]
                ${isDark ? 'bg-[#0d203b] border-white/10' : 'bg-white border-[#1B2F55]/10'}`}
            style={{
                height: currentH,
                zIndex: 1200,                    // 👈 acima dos controles do Leaflet (800+)
                transition: dragging ? 'none' : 'height 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
        >
            {/* Handle */}
            <div
                className="flex justify-center pt-2 pb-3 cursor-grab active:cursor-grabbing touch-none select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                <div className={`w-10 h-1.5 rounded-full ${isDark ? 'bg-white/30' : 'bg-[#1B2F55]/25'}`} />
            </div>

            {/* Conteúdo (scroll interno quando expandido) */}
            <div
                ref={contentRef}
                className="h-[calc(100%-24px)] overflow-y-auto overscroll-contain px-3 pb-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {children}
            </div>
        </div>
    );
}