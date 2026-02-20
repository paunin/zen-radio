import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRadio } from "~/context/RadioContext";
import { Icon } from "~/components/ui/Icon";
import { StationRow } from "./StationRow";
import { SwipeableRow } from "./SwipeableRow";
import type { Station } from "~/types/station";

function SortableFavoriteRow({
  station,
  isCurrentStation,
  isPlaying,
  isBuffering,
  onPlay,
  onToggleFavorite,
}: {
  station: Station;
  isCurrentStation: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: station.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none"
      {...attributes}
      {...listeners}
    >
      <StationRow
        station={station}
        isCurrentStation={isCurrentStation}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        isFavorite={true}
        orderMode={true}
        onPlay={onPlay}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}

export function FavoritesSection() {
  const { t } = useTranslation();
  const { state, actions } = useRadio();
  const [orderMode, setOrderMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = state.favorites.findIndex((s) => s.id === active.id);
      const newIndex = state.favorites.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      actions.reorderFavorites(arrayMove(state.favorites, oldIndex, newIndex));
    },
    [state.favorites, actions]
  );

  if (state.favorites.length === 0) return null;

  return (
    <div>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-text-label uppercase text-[0.65rem] tracking-[0.08em]">
          {t("favorites")} ({state.favorites.length})
        </span>
        {state.favorites.length > 1 && (
          <button
            onClick={() => setOrderMode((v) => !v)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors duration-150 cursor-pointer ${
              orderMode
                ? "text-accent"
                : "text-text-secondary/40 hover:text-text-secondary"
            }`}
            aria-label={orderMode ? t("save") : t("reorder")}
            title={orderMode ? t("save") : t("reorder")}
          >
            <span className="text-[0.6rem] uppercase tracking-[0.06em]">
              {orderMode ? t("save") : t("reorder")}
            </span>
            <Icon name="reorder" size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {orderMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={state.favorites.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {state.favorites.map((station) => (
                <SortableFavoriteRow
                  key={station.id}
                  station={station}
                  isCurrentStation={state.currentStation?.id === station.id}
                  isPlaying={
                    state.isPlaying &&
                    state.currentStation?.id === station.id
                  }
                  isBuffering={
                    state.isBuffering &&
                    state.currentStation?.id === station.id
                  }
                  onPlay={actions.play}
                  onToggleFavorite={actions.toggleFavorite}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          state.favorites.map((station) => (
            <SwipeableRow
              key={station.id}
              onSwipeRight={() => {}}
              onSwipeLeft={() => actions.toggleFavorite(station)}
              rightIcon="star"
              rightLabel={t("swipeFav")}
              leftIcon="starOutline"
              leftLabel={t("swipeUnfav")}
            >
              <StationRow
                station={station}
                isCurrentStation={state.currentStation?.id === station.id}
                isPlaying={
                  state.isPlaying &&
                  state.currentStation?.id === station.id
                }
                isBuffering={
                  state.isBuffering &&
                  state.currentStation?.id === station.id
                }
                isFavorite={true}
                onPlay={actions.play}
                onToggleFavorite={actions.toggleFavorite}
              />
            </SwipeableRow>
          ))
        )}
      </div>
    </div>
  );
}
