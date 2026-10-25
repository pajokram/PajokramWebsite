import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ChangeDetectionStrategy
} from '@angular/core';
import {AboutItems} from './about-items';
import {SVG_SPRITE_META} from '../../svg-sprite-meta';
import {
  AnimatedTooltipComponent,
  AnimatedTooltipData
} from '../../animated-tooltip/animated-tooltip.component';
import {AboutViewAnimations} from './about-view.animations';

export interface DeskItem {
  id: string;
  type: string;
  x: number;
  y: number;
  topOffsetsTooltip: Record<string, number>;
  states?: string[];
  showOnSmallScreen: boolean;
  stateTooltips?: Record<string, string>;
  currentStateIndex?: number;
}

@Component({
  selector: 'app-about-view',
  templateUrl: './about-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimatedTooltipComponent],
  providers: [AboutViewAnimations]
})
export class AboutViewComponent implements OnInit, AfterViewInit {
  @HostBinding('class') class = 'h-full flex flex-col';

  @ViewChild('deskWrapper', {static: true}) deskWrapper!: ElementRef;
  @ViewChildren('item') itemRefs!: QueryList<ElementRef<SVGElement>>;

  maxDeskWidth = 1000;
  deskWidth = 0;
  isTouchUser = false;
  isCompact = false;
  requestedTooltip: AnimatedTooltipData | null = null;

  defaultItems: DeskItem[] = AboutItems.map(item => ({...item, currentStateIndex: 0}));

  items: DeskItem[] = [];

  private resizeObserver?: ResizeObserver;

  constructor(
    private cdr: ChangeDetectorRef,
    private animations: AboutViewAnimations
  ) {
  }

  ngOnInit() {
    this.isTouchUser = 'ontouchstart' in window;
    this.items = [...this.defaultItems];
    this.resizeTableAndRepositionItems()
  }

  ngAfterViewInit() {
    this.resizeTableAndRepositionItems();
    this.cdr.detectChanges();

    this.resizeObserver = new ResizeObserver(() => this.resizeTableAndRepositionItems());
    this.resizeObserver.observe(this.deskWrapper.nativeElement);

    this.animations.connectItems(this.itemRefs);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.animations.destroy();
  }

  getScreenX(relX: number): number {
    return this.deskWidth / 2 + relX;
  }

  resizeTableAndRepositionItems() {
    this.deskWidth = Math.min(this.deskWrapper.nativeElement.offsetWidth, this.maxDeskWidth);
    this.isCompact = window.innerWidth < 768;
    this.items = this.isCompact
      ? this.defaultItems.filter(item => item.showOnSmallScreen)
      : [...this.defaultItems];
    this.cdr.detectChanges();
  }

  cycleState(event: MouseEvent, item: DeskItem) {
    if (!item.states || item.states.length <= 1) return;
    const nextState = ((item.currentStateIndex ?? 0) + 1) % item.states.length;
    this.animations.animateStateChange(event.currentTarget as SVGElement, () => {
      item.currentStateIndex = nextState;
      this.showTooltip(item);
    });
  }

  getImageSrc(item: DeskItem): string {
    const state = item.states?.[item.currentStateIndex!];
    return `svg/about/${state}.svg`;
  }

  /** Returns the sprite symbol id for the current state of an item, e.g. "#about-dino" */
  getSymbolRef(item: DeskItem): string {
    const state = item.states?.[item.currentStateIndex!];
    return `#about-${state}`;
  }

  /** Returns the SVG viewBox for the current state of an item from the sprite metadata */
  getSvgViewBox(item: DeskItem): string {
    const state = item.states?.[item.currentStateIndex!];
    return SVG_SPRITE_META[`about-${state}`]?.viewBox ?? '0 0 100 100';
  }

  /** Returns the original SVG width attribute (in mm) for the current item state */
  getSvgWidth(item: DeskItem): string | null {
    const state = item.states?.[item.currentStateIndex!];
    return SVG_SPRITE_META[`about-${state}`]?.width ?? null;
  }

  /** Returns the original SVG height attribute (in mm) for the current item state */
  getSvgHeight(item: DeskItem): string | null {
    const state = item.states?.[item.currentStateIndex!];
    return SVG_SPRITE_META[`about-${state}`]?.height ?? null;
  }

  focus(item: DeskItem, event: MouseEvent) {
    if (this.isTouchUser) return;
    this.showTooltip(item);
    this.animations.resetItemScales();
    // Use currentTarget (the <svg>) – event.target may be the inner <use>
    this.animations.scaleItem(event.currentTarget as SVGElement);
  }

  unfocus(item: DeskItem) {
    if (this.isTouchUser) return;
    // A delayed mouseleave from the previous item must not cancel a newer tooltip.
    if (this.requestedTooltip?.id === item.id) {
      this.requestedTooltip = null;
    }
    this.animations.resetItemScales();
  }

  getTooltip(item: DeskItem): string {
    const state = item.states?.[item.currentStateIndex ?? 0];
    return item.stateTooltips?.[state ?? ''] ?? '';
  }

  showTooltip(item: DeskItem) {
    const tooltipText = this.getTooltip(item);
    if (!tooltipText) return;

    this.requestedTooltip = {
      id: item.id,
      x: item.x,
      y: item.y - this.getTooltipOffset(item),
      text: tooltipText
    };
    this.cdr.detectChanges();
  }

  private getTooltipOffset(item: DeskItem) {
    return item.topOffsetsTooltip[item.states?.[item.currentStateIndex ?? 0] ?? ''] || 0
  }

}
