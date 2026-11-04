"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";

export function useHorizontalDragScroll<T extends HTMLElement>() {
  const drag = useRef({
    active: false,
    dragged: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });

  const finishDrag = (element: T) => {
    drag.current.active = false;
    drag.current.pointerId = -1;
    element.removeAttribute("data-dragging");
  };

  return {
    onPointerDown(event: ReactPointerEvent<T>) {
      if (event.button !== 0 && event.pointerType !== "touch") return;
      drag.current.active = true;
      drag.current.dragged = false;
      drag.current.pointerId = event.pointerId;
      drag.current.startX = event.clientX;
      drag.current.startScrollLeft = event.currentTarget.scrollLeft;
      event.currentTarget.setAttribute("data-dragging", "true");
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: ReactPointerEvent<T>) {
      if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;
      const distance = event.clientX - drag.current.startX;
      if (Math.abs(distance) > 6) drag.current.dragged = true;
      if (drag.current.dragged) {
        event.preventDefault();
        event.currentTarget.scrollLeft = drag.current.startScrollLeft - distance;
      }
    },
    onPointerUp(event: ReactPointerEvent<T>) {
      if (drag.current.pointerId !== event.pointerId) return;
      finishDrag(event.currentTarget);
      if (drag.current.dragged) {
        window.setTimeout(() => { drag.current.dragged = false; }, 150);
      }
    },
    onPointerCancel(event: ReactPointerEvent<T>) {
      if (drag.current.pointerId !== event.pointerId) return;
      drag.current.dragged = false;
      finishDrag(event.currentTarget);
    },
  };
}
