import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css']
})
export class SliderComponent {
  /**
    * Is the slider disabled>
    */
  @Input() m_bIsDisabled: boolean = false;

  /**
   * Is the slider labeled?
   */
  @Input() m_bHasLabels: boolean = false;

  /**
   * Does the slider have steps (increments)?
   */
  @Input() m_bHasSteps: boolean = false;

  /**
   * Is the slider a range input? (i.e., Max and Min Values)
   */
  @Input() m_bIsRange: boolean = false;

  /**
   * Does the slider have handles? ("thumbs")
   */
  @Input() m_bHasHandles: boolean = true;

  /**
   * Does the slider have a value indicator?
   */
  @Input() m_bHasThumbLabel: boolean = false;

  /**
   * Default Value for a single input slider
   */
  @Input() m_iDefaultValue?: number = 50;

  @Input() m_iMinValue?: number = 0;

  @Input() m_iMaxValue?: number = 100;

  @Input() m_iStep?: number;

  @Input() m_iValue: number;


  @Output() m_oSelectionChange: EventEmitter<any> = new EventEmitter<any>();


  emitSelectionChange() {
    this.m_oSelectionChange.emit(this.m_iValue)
  }

}
