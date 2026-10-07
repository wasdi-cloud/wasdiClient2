import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
    selector: '[appResizable]',
    standalone: false
})
export class ResizableDirective implements OnInit, OnDestroy {
  @Input() m_iResizableGrabWidth = 5;
  @Input('minResizeWidth') m_iResizableMinWidth = 0;
  @Input('maxResizeWidth') m_iResizableMaxWidth = Infinity;
  @Input('position') m_sPosition = 'right';
  @Input('heightPercent') m_iHeightPercent?: number = 0;
  // Visual border can be thinner/lighter than the (wider) invisible grab hit-zone
  @Input('borderWidth') m_iResizableBorderWidth?: number;
  @Input('borderColor') m_sResizableBorderColor = 'darkgrey';

  m_bIsDragging = false;

  private m_fMouseMoveG: (oEvent: MouseEvent) => void;
  private m_fMouseUpG: (oEvent: MouseEvent) => void;
  private m_fMouseDown: (oEvent: MouseEvent) => void;
  private m_fMouseMove: (oEvent: MouseEvent) => void;

  constructor(
    private m_oElement: ElementRef
  ) {
    /**
     * Remove normal mouse events
     */
    function preventGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'none';
      document.body.style['user-select'] = 'none';
    }

    /**
     * Re-add normal mouse events
     */
    function restoreGlobalMouseEvents() {
      document.body.style['pointer-events'] = 'auto';
      document.body.style['user-select'] = '';
    }

    /**
     * Track width of element
     * @param iWidth 
     */
    const m_iNewWidth = (iWidth) => {
      const iNewWidth = Math.min(this.m_iResizableMaxWidth, Math.max(this.m_iResizableMinWidth, iWidth));
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
        // getBoundingClientRect is viewport-relative, unlike offsetLeft (relative to offsetParent)
        m_iNewWidth(oEvent.clientX - m_oElement.nativeElement.getBoundingClientRect().left)
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
        oEvent.preventDefault();
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
    this.m_fMouseMoveG = mouseMoveG;
    this.m_fMouseUpG = mouseUpG;
    this.m_fMouseDown = mouseDown;
    this.m_fMouseMove = mouseMove;

    document.addEventListener('mousemove', this.m_fMouseMoveG, true);
    document.addEventListener('mouseup', this.m_fMouseUpG, true);
    m_oElement.nativeElement.addEventListener('mousedown', this.m_fMouseDown, true);
    m_oElement.nativeElement.addEventListener('mousemove', this.m_fMouseMove, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.m_fMouseMoveG, true);
    document.removeEventListener('mouseup', this.m_fMouseUpG, true);
    this.m_oElement.nativeElement.removeEventListener('mousedown', this.m_fMouseDown, true);
    this.m_oElement.nativeElement.removeEventListener('mousemove', this.m_fMouseMove, true);
  }

  ngOnInit(): void {
    const iBorderWidth = this.m_iResizableBorderWidth ?? this.m_iResizableGrabWidth;
    //Add the Draggable Bar to the element
    if (this.m_sPosition === 'right') {
      this.m_oElement.nativeElement.style["border-right"] = iBorderWidth + "px solid " + this.m_sResizableBorderColor;
    }
    //Add the Draggable Bar to the element
    if (this.m_sPosition === 'bottom') {
      this.m_oElement.nativeElement.style["border-bottom"] = iBorderWidth + "px solid " + this.m_sResizableBorderColor;
    }
  }

  /**
   * Check whether or not the cursor is in the Draggable Region (within px of the drag bar)
   * @param oEvent 
   * @returns 
   */
  inDragRegion(oEvent): boolean {
    const oRect = this.m_oElement.nativeElement.getBoundingClientRect();
    if (this.m_sPosition === 'right') {
      return oRect.right - oEvent.clientX < this.m_iResizableGrabWidth;
    } else {
      return oRect.bottom - oEvent.clientY < this.m_iResizableGrabWidth;
    }
  }
}
