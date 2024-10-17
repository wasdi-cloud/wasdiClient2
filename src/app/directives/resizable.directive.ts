import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appResizable]'
})
export class ResizableDirective implements OnInit {
  @Input() m_iResizableGrabWidth = 5;
  @Input('minResizeWidth') m_iResizableMinWidth = 0;
  @Input('position') m_sPosition = 'right';
  @Input('heightPercent') m_iHeightPercent?: number = 0;

  m_bIsDragging = false;

  constructor(
    private m_oElement: ElementRef
  ) {
    /**
     * Remove normal mouse events
     */
    function preventGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'none';
    }

    /**
     * Re-add normal mouse events
     */
    function restoreGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'auto';
    }

    /**
     * Track width of element
     * @param iWidth 
     */
    const m_iNewWidth = (iWidth) => {
      const iNewWidth = Math.max(this.m_iResizableMinWidth, iWidth);
      m_oElement.nativeElement.style.width = (iNewWidth) + "px";
    }

    /**
     * Handle mouse movement when DOWN (Grabbing)
     * @param oEvent 
     * @returns 
     */
    const mouseMoveG = (oEvent) => {
      if (!this.m_bIsDragging) {
        return;
      }
      if (this.m_sPosition === 'right') {
        m_iNewWidth(oEvent.clientX - m_oElement.nativeElement.offsetLeft)
      }
      oEvent.stopPropagation();
    };

    /**
     * Handle Mouse up inside the drag (Grab) zone
     * @param oEvent 
     * @returns 
     */
    const mouseUpG = (oEvent) => {
      if (!this.m_bIsDragging) {
        return;
      }
      restoreGlobalMouseEvents();
      this.m_bIsDragging = false;
      oEvent.stopPropagation();
    };

    /**
     * Listen for mouse inside the drag zone - return true 
     * @param oEvent 
     */
    const mouseDown = (oEvent) => {
      if (this.inDragRegion(oEvent)) {
        this.m_bIsDragging = true;
        preventGlobalMouseEvents();
        oEvent.stopPropagation();
      }
    };

    /**
     * If the mouse is in the drag zone add new cursor and event listeners
     * @param oEvent 
     */
    const mouseMove = (oEvent) => {
      if (this.inDragRegion(oEvent) || this.m_bIsDragging) {
        if (this.m_sPosition === 'right') {
          m_oElement.nativeElement.style.cursor = "col-resize";
        } else {
          m_oElement.nativeElement.style.cursor = "row-resize"
        }
      } else {
        m_oElement.nativeElement.style.cursor = "default";
      }
    }
    document.addEventListener('mousemove', mouseMoveG, true);
    document.addEventListener('mouseup', mouseUpG, true);
    m_oElement.nativeElement.addEventListener('mousedown', mouseDown, true);
    m_oElement.nativeElement.addEventListener('mousemove', mouseMove, true);
  }

  ngOnInit(): void {
    //Add the Draggable Bar to the element
    if (this.m_sPosition === 'right') {
      this.m_oElement.nativeElement.style["border-right"] = this.m_iResizableGrabWidth + "px solid darkgrey";
    }
    //Add the Draggable Bar to the element
    if (this.m_sPosition === 'bottom') {
      this.m_oElement.nativeElement.style["border-bottom"] = this.m_iResizableGrabWidth + "px solid darkgrey";
    }
  }

  /**
   * Check whether or not the cursor is in the Draggable Region (within px of the drag bar)
   * @param oEvent 
   * @returns 
   */
  inDragRegion(oEvent): boolean {
    if (this.m_sPosition === 'right') {
      return this.m_oElement.nativeElement.clientWidth - oEvent.clientX + this.m_oElement.nativeElement.offsetLeft < this.m_iResizableGrabWidth;
    } else {
      return this.m_oElement.nativeElement.clientHeight + oEvent.clientY + this.m_oElement.nativeElement.offsetHeight > this.m_iResizableGrabWidth;
    }
  }
}
