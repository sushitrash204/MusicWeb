'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'; // Using Heroicons if available, otherwise fallback
import styles from './LyricsEditor.module.css';

interface LyricsEditorProps {
    value: string;
    onChange: (value: string) => void;
    audioFile: File | null;
    existingAudioUrl?: string;
}

interface LyricBlock {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    lane: number; // 0 or 1 for staggered view
}

const MIN_BLOCK_DURATION = 0.5;
const DEFAULT_ZOOM = 50; // pixels per second

export default function LyricsEditor({ value, onChange, audioFile, existingAudioUrl }: LyricsEditorProps) {
    const { t } = useTranslation('common');
    const [mode, setMode] = useState<'edit' | 'sync'>('edit');
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Timeline State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [blocks, setBlocks] = useState<LyricBlock[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const [isSyncEnabled, setIsSyncEnabled] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newBlockText, setNewBlockText] = useState('');
    const [editingText, setEditingText] = useState('');

    // Detect if initial value is synced (JSON) or plain text
    useEffect(() => {
        if (value) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    setIsSyncEnabled(true);
                    setMode('sync');
                }
            } catch (e) {
                setIsSyncEnabled(false);
                setMode('edit');
            }
        }
    }, []); // Only on mount

    // Dragging State
    const [dragState, setDragState] = useState<{
        type: 'move' | 'resize-left' | 'resize-right' | null;
        blockId: string | null;
        startX: number;
        originalStart: number;
        originalEnd: number;
    }>({ type: null, blockId: null, startX: 0, originalStart: 0, originalEnd: 0 });

    const audioRef = useRef<HTMLAudioElement>(null);
    const tracksRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initial Load & Parsing
    useEffect(() => {
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            setAudioUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (existingAudioUrl) {
            setAudioUrl(existingAudioUrl);
        }
    }, [audioFile, existingAudioUrl]);

    // Parse Value to Blocks
    useEffect(() => {
        if (value === '[]' || !value) {
            setBlocks([]);
            return;
        }

        try {
            const json = JSON.parse(value);
            if (Array.isArray(json)) {
                const newBlocks: LyricBlock[] = [];
                for (let i = 0; i < json.length; i++) {
                    const item = json[i];
                    let end = 0;
                    if (item.duration) {
                        end = item.time + item.duration;
                    } else {
                        const nextTime = json[i + 1]?.time;
                        end = nextTime && nextTime > item.time
                            ? nextTime
                            : item.time + 3;
                    }

                    newBlocks.push({
                        id: `block-${Date.now()}-${i}`,
                        text: item.text,
                        startTime: item.time || 0,
                        endTime: end,
                        lane: i % 2
                    });
                }
                setBlocks(newBlocks);
                return;
            }
        } catch (e) {
            // Not JSON
        }

        if (value && mode === 'edit' && blocks.length === 0) {
            const lines = value.split('\n').filter(l => l.trim() && l !== '[]');
            const newBlocks = lines.map((text, i) => ({
                id: `block-${Date.now()}-${i}`,
                text,
                startTime: i * 4,
                endTime: (i * 4) + 3,
                lane: i % 2
            }));
            if (newBlocks.length > 0) setBlocks(newBlocks);
        }
    }, [value, mode]); // Added mode to deps to re-parse text if switching from edit to sync

    const handleTabChange = (newMode: 'edit' | 'sync') => {
        if (newMode === 'sync') {
            // Smart Parsing: Convert text lines to blocks if they don't match
            const currentText = typeof value === 'string' && value.startsWith('[') ?
                blocks.map(b => b.text).join('\n') : value;

            const lines = currentText.split('\n').filter(l => l.trim() && l !== '[]');

            let blocksToSave = blocks;

            // Only re-parse if the number of lines is different from current blocks
            // or if we have no blocks yet
            if (blocks.length !== lines.length) {
                const newBlocks = lines.map((text, i) => {
                    // Try to preserve existing timing if text at same index matches
                    const existing = blocks[i];
                    return {
                        id: `block-${Date.now()}-${i}`,
                        text: text.trim(),
                        startTime: existing?.startTime ?? i * 4,
                        endTime: existing?.endTime ?? (i * 4) + 3,
                        lane: 0
                    };
                });
                setBlocks(newBlocks);
                blocksToSave = newBlocks;
            }

            // CRITICAL: Save the blocks as JSON immediatey when entering Sync mode
            saveBlocks(blocksToSave);
        }
        setMode(newMode);
    };

    const handleSyncToggle = (enabled: boolean) => {
        setIsSyncEnabled(enabled);
        if (!enabled) {
            // If disabling, convert everything to plain text
            const text = blocks.length > 0 ?
                blocks.sort((a, b) => a.startTime - b.startTime).map(b => b.text).join('\n') :
                value;
            onChange(text);
        } else {
            // If enabling, jump to edit tab first to let user check text
            setMode('edit');
        }
    };

    const saveBlocks = (currentBlocks: LyricBlock[]) => {
        const data = currentBlocks
            .sort((a, b) => a.startTime - b.startTime)
            .map(b => ({
                time: Number(b.startTime.toFixed(2)),
                text: b.text,
                duration: Number((b.endTime - b.startTime).toFixed(2))
            }));
        onChange(JSON.stringify(data));
    };

    // --- Timeline Interaction ---

    const getEventTime = (clientX: number) => {
        if (!tracksRef.current) return 0;
        const rect = tracksRef.current.getBoundingClientRect();
        const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
        const x = clientX - rect.left + scrollLeft;
        return Math.max(0, x / zoom);
    };

    const handleMouseDown = (e: React.MouseEvent, block: LyricBlock, type: 'move' | 'resize-left' | 'resize-right') => {
        e.stopPropagation(); // Prevent timeline seek
        setSelectedBlockId(block.id);
        setEditingText(block.text);
        setDragState({
            type,
            blockId: block.id,
            startX: e.clientX,
            originalStart: block.startTime,
            originalEnd: block.endTime
        });
    };

    const handleBlockTextChangeLocal = (text: string) => {
        setEditingText(text);
        if (!selectedBlockId) return;
        // Update the block in blocks state IMMEDIATELY so card updates on timeline
        setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, text } : b));
    };

    const handleSaveBlockText = () => {
        if (!selectedBlockId) return;
        // This persists the blocks state to the parent onChange (e.g. database)
        saveBlocks(blocks);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragState.type || !dragState.blockId) return;

        const deltaPixels = e.clientX - dragState.startX;
        const deltaTime = deltaPixels / zoom;

        setBlocks(prev => {
            const nextBlocks = prev.map(b => {
                if (b.id !== dragState.blockId) return b;

                let newStart = b.startTime;
                let newEnd = b.endTime;

                if (dragState.type === 'move') {
                    newStart = Math.max(0, dragState.originalStart + deltaTime);
                    newEnd = newStart + (dragState.originalEnd - dragState.originalStart);
                } else if (dragState.type === 'resize-left') {
                    newStart = Math.min(dragState.originalStart + deltaTime, dragState.originalEnd - MIN_BLOCK_DURATION);
                    newStart = Math.max(0, newStart);
                } else if (dragState.type === 'resize-right') {
                    newEnd = Math.max(dragState.originalStart + MIN_BLOCK_DURATION, dragState.originalEnd + deltaTime);
                }

                return { ...b, startTime: newStart, endTime: newEnd };
            });
            return nextBlocks;
        });
    }, [dragState, zoom]);

    const handleMouseUp = useCallback(() => {
        if (dragState.type) {
            setDragState({ type: null, blockId: null, startX: 0, originalStart: 0, originalEnd: 0 });
            // Save on drop handled by useEffect on dragState.type
        }
    }, [dragState.type]);

    // Fix for saving latest blocks after drag
    useEffect(() => {
        if (!dragState.type) {
            saveBlocks(blocks);
        }
    }, [dragState.type]); // When drag ends

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Playback
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);

            if (scrollContainerRef.current && isPlaying) {
                const playheadPos = audioRef.current.currentTime * zoom;
                const containerWidth = scrollContainerRef.current.clientWidth;
                const scrollLeft = scrollContainerRef.current.scrollLeft;
                if (playheadPos > scrollLeft + containerWidth * 0.8) {
                    scrollContainerRef.current.scrollLeft = playheadPos - containerWidth * 0.2;
                }
            }
        }
    };

    // --- Actions ---

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleAddText = () => {
        setIsAddModalOpen(true);
        setNewBlockText('');
        // Pause playback when adding text?
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const confirmAddText = () => {
        if (!newBlockText.trim()) return;

        const start = currentTime; // Add at playhead
        const end = start + 3;

        // Find best lane (check collision?)
        const lane = blocks.length % 2;

        const newBlock: LyricBlock = {
            id: `block-${Date.now()}`,
            text: newBlockText,
            startTime: start,
            endTime: end,
            lane: 0 // Always lane 0 for a single row
        };

        const updated = [...blocks, newBlock];
        setBlocks(updated);
        saveBlocks(updated);
        setSelectedBlockId(newBlock.id);

        setIsAddModalOpen(false);
    };

    const handleDeleteText = () => {
        if (!selectedBlockId) return;
        if (confirm(t('confirm_delete_lyric', 'Delete this lyric block?'))) {
            const updated = blocks.filter(b => b.id !== selectedBlockId);
            setBlocks(updated);
            saveBlocks(updated);
            setSelectedBlockId(null);
        }
    };

    const handleTimelineClick = (e: React.MouseEvent) => {
        // Deselect if clicking on empty space
        setSelectedBlockId(null);

        if (!isFullScreen) {
            setIsFullScreen(true);
        }

        // Audio Seek
        const time = getEventTime(e.clientX);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Ruler Render
    const Ruler = () => {
        const marks = [];
        const totalSeconds = Math.max(duration, 300);
        // Ruler step
        let step = 1;
        if (zoom < 20) step = 10;
        else if (zoom < 50) step = 5;

        for (let i = 0; i < totalSeconds; i += step) {
            marks.push(
                <div
                    key={i}
                    className={`${styles.rulerMark} ${i % (step * 5) === 0 ? styles.major : styles.minor}`}
                    style={{ left: i * zoom }}
                >
                    {i % (step * 5) === 0 ? `${Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}` : ''}
                </div>
            );
        }
        return <div className={styles.ruler} style={{ width: totalSeconds * zoom }}>{marks}</div>;
    };

    return (
        <div className={`${styles.container} ${isFullScreen ? styles.fullScreen : ''}`}>
            <div className={styles.editorHeader}>
                <div className={styles.syncToggle}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={isSyncEnabled}
                            onChange={(e) => handleSyncToggle(e.target.checked)}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <span className={styles.toggleLabel}>{t('enable_sync_lyrics', 'Synchronized Lyrics')}</span>
                </div>

                {isSyncEnabled && (
                    <div className={styles.tabs}>
                        <div className={styles.tabGroup}>
                            <button
                                type="button"
                                className={`${styles.tab} ${mode === 'edit' ? styles.active : ''}`}
                                onClick={() => handleTabChange('edit')}
                            >
                                {t('edit_text_only', 'Edit Text')}
                            </button>
                            <button
                                type="button"
                                className={`${styles.tab} ${mode === 'sync' ? styles.active : ''}`}
                                onClick={() => handleTabChange('sync')}
                                disabled={!audioFile && !existingAudioUrl && !value}
                            >
                                {t('sync_timeline', 'Timeline Sync')}
                            </button>
                        </div>

                        {mode === 'sync' && (
                            <button type="button" className={styles.fullScreenBtn} onClick={toggleFullScreen}>
                                {isFullScreen ? (
                                    <>
                                        <ArrowsPointingInIcon className="w-4 h-4" />
                                        {t('exit_fullscreen', 'Exit')}
                                    </>
                                ) : (
                                    <>
                                        <ArrowsPointingOutIcon className="w-4 h-4" />
                                        {t('fullscreen', 'Split UI')}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isSyncEnabled ? (
                <div className={styles.simpleEdit}>
                    <textarea
                        className={styles.textarea}
                        value={value?.startsWith('[') ? blocks.map(b => b.text).join('\n') : value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={t('enter_lyrics_here', 'Enter plain lyrics here...')}
                        rows={10}
                    />
                </div>
            ) : mode === 'edit' ? (
                <div className={styles.editMode}>
                    <div className={styles.editInstructions}>{t('edit_mode_hint', 'Enter lyrics here...')}</div>
                    <textarea
                        className={styles.textarea}
                        value={(() => {
                            try {
                                if (value === '[]') return '';
                                const json = JSON.parse(value);
                                if (Array.isArray(json)) return json.map((i: any) => i.text).join('\n');
                            } catch { }
                            return value;
                        })()}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={t('enter_lyrics_here', 'Enter lyrics...')}
                    />
                </div>
            ) : (
                <>
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        onEnded={() => setIsPlaying(false)}
                    />

                    <div className={styles.syncLayout}>
                        <div className={styles.mainTimeline}>
                            <div className={styles.toolbar}>
                                <div className={styles.toolbarGroup}>
                                    <button type="button" className={`${styles.actionBtn} ${styles.addBtn}`} onClick={handleAddText}>
                                        <PlusIcon className="w-5 h-5" />
                                        {t('add_text', 'Add Text')}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={handleDeleteText}
                                        disabled={!selectedBlockId}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                        {t('delete_text', 'Delete')}
                                    </button>
                                </div>

                                <div className={styles.toolbarGroup}>
                                    <button type="button" className={styles.playButton} onClick={() => {
                                        if (audioRef.current) {
                                            isPlaying ? audioRef.current.pause() : audioRef.current.play();
                                            setIsPlaying(!isPlaying);
                                        }
                                    }}>
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>
                                    <div className={styles.timeDisplay}>
                                        {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>

                                <div className={styles.zoomControls}>
                                    <span className={styles.zoomLabel}>{t('zoom', 'Zoom')}</span>
                                    <input
                                        type="range"
                                        min="10"
                                        max="200"
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className={styles.zoomInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.timelineContainer}>
                                <div
                                    className={styles.tracksArea}
                                    ref={scrollContainerRef}
                                    onClick={handleTimelineClick}
                                >
                                    <div style={{ width: Math.max(duration, 300) * zoom, position: 'relative', height: '100%' }} ref={tracksRef}>
                                        <div className={styles.rulerContainer} style={{ width: '100%' }}>
                                            {Ruler()}
                                        </div>

                                        {/* Playhead */}
                                        <div className={styles.playhead} style={{ left: currentTime * zoom }}>
                                            <div className={styles.playheadHead} />
                                            <div style={{ position: 'absolute', top: 30, left: 5, color: 'red', fontSize: '0.8rem' }}></div>
                                        </div>

                                        {/* Single Track Layout */}
                                        <div className={styles.track}>
                                            {blocks.map(block => (
                                                <div
                                                    key={block.id}
                                                    className={`${styles.block} ${block.id === selectedBlockId ? styles.selected : ''}`}
                                                    style={{
                                                        left: block.startTime * zoom,
                                                        width: (block.endTime - block.startTime) * zoom
                                                    }}
                                                    onMouseDown={(e) => handleMouseDown(e, block, 'move')}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div
                                                        className={`${styles.resizeHandle} ${styles.resizeLeft}`}
                                                        onMouseDown={(e) => handleMouseDown(e, block, 'resize-left')}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <span className={styles.blockText}>{block.text}</span>
                                                    <div
                                                        className={`${styles.resizeHandle} ${styles.resizeRight}`}
                                                        onMouseDown={(e) => handleMouseDown(e, block, 'resize-right')}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.shortcutHint}>
                                💡 {t('timeline_hint_full', 'Click timeline to Fullscreen • Drag/Resize blocks')}
                            </div>
                        </div>

                        {/* Right Panel for Editing Text */}
                        {selectedBlockId && (
                            <div className={styles.editPanel}>
                                <div className={styles.panelHeader}>
                                    <h4 className={styles.panelTitle}>{t('edit_lyric_line', 'Edit Lyric Line')}</h4>
                                    <button type="button" className={styles.closePanel} onClick={() => setSelectedBlockId(null)}>×</button>
                                </div>
                                <div className={styles.panelBody}>
                                    <label className={styles.panelLabel}>{t('text_content', 'Text Content')}</label>
                                    <input
                                        type="text"
                                        className={styles.panelInput}
                                        value={editingText}
                                        onChange={(e) => handleBlockTextChangeLocal(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveBlockText()}
                                        placeholder={t('enter_text_here', 'Enter text here...')}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className={styles.saveBtn}
                                        onClick={handleSaveBlockText}
                                    >
                                        {t('save', 'Save')}
                                    </button>
                                    <div className={styles.panelHint}>
                                        {t('edit_hint_save', 'Click Save to apply changes to the timeline.')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add Text Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>{t('add_new_lyric', 'Add New Lyric')}</h3>
                        <input
                            type="text"
                            className={styles.modalInput}
                            autoFocus
                            value={newBlockText}
                            onChange={(e) => setNewBlockText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmAddText()}
                            placeholder={t('type_lyric_here', 'Type lyrics here...')}
                        />
                        <div className={styles.modalActions}>
                            <button type="button" className={`${styles.modalBtn} ${styles.modalCancel}`} onClick={() => setIsAddModalOpen(false)}>
                                {t('cancel', 'Cancel')}
                            </button>
                            <button type="button" className={`${styles.modalBtn} ${styles.modalSubmit}`} onClick={confirmAddText}>
                                {t('add', 'Add')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
