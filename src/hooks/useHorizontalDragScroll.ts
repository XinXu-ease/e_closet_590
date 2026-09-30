"use client";

import { useRef, type MouseEvent as ReactMouseEvent } from "react";

export function useHorizontalDragScroll<T extends HTMLElement>() {
  const drag = useRef({
    active: false,
    dragged: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const finishDrag = (element: T) => {
    drag.current.active = false;
    element.removeAttribute("data-dragging");
    window.setTimeout(() => {
      drag.current.dragged = false;
    }, 0);
  };

  return {
    onMouseDown(event: ReactMouseEvent<T>) {
      if (event.button !== 0) return;
      drag.current.active = true;
      drag.current.dragged = false;
      drag.current.startX = event.clientX;
      drag.current.startScrollLeft = event.currentTarget.scrollLeft;
      event.currentTarget.setAttribute("data-dragging", "true");
    },
    onMouseMove(event: ReactMouseEvent<T>) {
      if (!drag.current.active) return;
      const distance = event.clientX - drag.current.startX;
      if (Math.abs(distance) > 4) drag.current.dragged = true;
      if (drag.current.dragged) {
        event.preventDefault();
        event.currentTarget.scrollLeft = drag.current.startScrollLeft - distance;
      }
    },
    onMouseUp(event: ReactMouseEvent<T>) {
      finishDrag(event.currentTarget);
    },
    onMouseLeave(event: ReactMouseEvent<T>) {
      if (drag.current.active) finishDrag(event.currentTarget);
    },
    onClickCapture(event: ReactMouseEvent<T>) {
      if (!drag.current.dragged) return;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
