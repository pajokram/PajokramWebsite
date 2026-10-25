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
import gsap from 'gsap';
import {AboutItems} from './about-items';
import {SVG_SPRITE_META} from '../../svg-sprite-meta';

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
  imports: []
})
export class AboutViewComponent implements OnInit, AfterViewInit {
  @HostBinding('class') class = 'h-full flex flex-col';

  @ViewChild('deskWrapper', {static: true}) deskWrapper!: ElementRef;
  @ViewChild('desk', {static: true}) desk!: ElementRef;
  @ViewChildren('item') itemRefs!: QueryList<ElementRef>;

  editButton?: HTMLElement;

  maxDeskWidth = 1000;
  deskWidth = 0;
  isEditMode = false;
  isTouchUser = false;
  isCompact = false;
  hoveredTooltip: { id: string, x: number, y: number, text: string } | null = null;
  tooltipTween?: gsap.core.Tween
  itemTweens: gsap.core.Tween[] = [];
  editButtonTween?: gsap.core.Tween;

  defaultItems: DeskItem[] = AboutItems.map(item => ({...item, currentStateIndex: 0}));

  items: DeskItem[] = [];
  draggingId: string | null = null;
  dragOffset = {x: 0, y: 0};

  private resizeObserver?: ResizeObserver;

  constructor(private cdr: ChangeDetectorRef) {
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

    const initItems = () => {
      this.itemRefs.forEach(ref => {
        gsap.set(ref.nativeElement, {
          transformBox: 'fill-box',
          transformOrigin: '50% 50%',
        });
      });
    };
    initItems();
    this.itemRefs.changes.subscribe(initItems);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    this.itemTweens.forEach(tween => tween.kill());
    this.tooltipTween?.kill();
    this.editButtonTween?.kill();
  }

  toggleEditMode(target: EventTarget | null, newMode: boolean = !this.isEditMode) {
    if (this.isEditMode === newMode) return;
    this.swapEditButton(target as HTMLElement, newMode);
    newMode ? this.startWiggle() : this.stopWiggle();
  }

  getScreenX(relX: number): number {
    return this.deskWidth / 2 + relX;
  }

  getRelativeX(screenX: number): number {
    return screenX - this.deskWidth / 2;
  }

  resizeTableAndRepositionItems() {
    this.deskWidth = Math.min(this.deskWrapper.nativeElement.offsetWidth, this.maxDeskWidth);
    this.isCompact = window.innerWidth < 768;
    if (this.isCompact && this.editButton) {
      this.toggleEditMode(this.editButton, false)
    }
    this.items = this.isCompact
      ? this.defaultItems.filter(item => item.showOnSmallScreen)
      : [...this.defaultItems];
    this.cdr.detectChanges();
  }

  onPointerDown(event: PointerEvent, itemId: string) {
    if (!this.isEditMode || this.isTouchUser) return;
    this.draggingId = itemId;
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;
    this.dragOffset.x = event.clientX - this.getScreenX(item.x);
    this.dragOffset.y = event.clientY - item.y;
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent) {
    if (!this.draggingId || !this.isEditMode || this.isTouchUser) return;
    const item = this.items.find(i => i.id === this.draggingId);
    if (!item) return;
    item.x = Math.round(this.getRelativeX(event.clientX - this.dragOffset.x));
    item.y = Math.round(event.clientY - this.dragOffset.y);
    event.preventDefault();
  }

  onPointerUp() {
    this.draggingId = null;
  }

  cycleState(event: MouseEvent, item: DeskItem) {
    if (this.isEditMode || !item.states) return;
    const nextState = ((item.currentStateIndex ?? 0) + 1) % item.states.length;
    // Use currentTarget (the <svg>) – event.target might be the inner <use> element
    const el = event.currentTarget as HTMLElement;
    gsap.fromTo(el, {scale: 1}, {
      scale: 0.85, duration: 0.1, ease: 'power2.out',
      transformBox: 'fill-box', transformOrigin: '50% 50%',
      onComplete: () => {
        item.currentStateIndex = nextState;
        this.showTooltip(item); // refresh tooltip text for new state
        gsap.to(el, {
          scale: 1, duration: 0.1, ease: 'power2.out',
          transformBox: 'fill-box', transformOrigin: '50% 50%'
        });
      }
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
    if (this.isEditMode) return;
    this.showTooltip(item);
    this.rescaleItems();
    // Use currentTarget (the <svg>) – event.target may be the inner <use>
    this.scaleItem(event.currentTarget as HTMLElement);
  }

  unfocus() {
    if (this.isTouchUser) return;
    if (this.isEditMode) return;
    this.hideTooltip();
    this.rescaleItems();
  }

  getTooltip(item: DeskItem): string {
    const state = item.states?.[item.currentStateIndex ?? 0];
    return item.stateTooltips?.[state ?? ''] ?? '';
  }

  showTooltip(item: DeskItem) {
    const tooltipText = this.getTooltip(item);
    if (!tooltipText) return;

    this.tooltipTween?.kill();

    // Set position & text first so the element exists in the DOM before GSAP touches it
    const x = item.x;
    const y = item.y - this.getTooltipOffset(item);
    const alreadyVisible = this.hoveredTooltip != null;
    this.hoveredTooltip = {id: item.id, x, y, text: tooltipText};
    this.cdr.detectChanges();

    const el = document.getElementById('tooltip-box');
    if (el) {
      if (alreadyVisible) {
        // Tooltip already visible (state cycling via click): keep it visible and do a
        // subtle scale-pop from center so the top edge never shifts visually.
        // xPercent: -50 is always passed explicitly so GSAP fully owns the x-centering
        // and never loses it when switching transformOrigin between animations.
        this.tooltipTween = gsap.fromTo(el,
          {scale: 0.9, xPercent: -50, transformOrigin: '50% 50%'},
          {scale: 1, xPercent: -50, duration: 0.2, ease: 'back.out(2)', transformOrigin: '50% 50%'}
        );
      } else {
        this.tooltipTween = gsap.fromTo(el,
          {opacity: 0, scale: 0.9, xPercent: -50, transformOrigin: '50% 100%'},
          {opacity: 1, scale: 1, xPercent: -50, duration: 0.25, ease: 'power2.out', transformOrigin: '50% 100%'}
        );
      }
    }
  }

  hideTooltip() {
    const el = document.getElementById('tooltip-box');
    this.tooltipTween?.kill();
    if (el) {
      // Animate out first, THEN remove from DOM
      this.tooltipTween = gsap.to(el, {
        opacity: 0, scale: 0.9, xPercent: -50, duration: 0.2, ease: 'power2.in',
        transformOrigin: '50% 100%',
        onComplete: () => {
          this.hoveredTooltip = null;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.hoveredTooltip = null;
    }
  }

  private rescaleItems() {
    this.itemTweens.forEach(tween => tween.kill());
    this.itemTweens = [];
    this.itemRefs.forEach(ref => {
      const el = ref.nativeElement;
      this.itemTweens.push(gsap.to(el, {
        scale: 1, duration: 0.2, ease: 'power2.out',
        transformBox: 'fill-box', transformOrigin: '50% 50%',
      }));
    });
  }

  private scaleItem(el: HTMLElement) {
    this.itemTweens = this.itemTweens.filter(tween => {
      if (tween.targets().includes(el)) {
        tween.kill();
        return false;
      }
      return true;
    });
    if (el) {
      this.itemTweens.push(gsap.to(el, {
        scale: 1.05, duration: 0.2, ease: 'power2.out',
        transformBox: 'fill-box', transformOrigin: '50% 50%',
      }));
    }
  }

  private getTooltipOffset(item: DeskItem) {
    return item.topOffsetsTooltip[item.states?.[item.currentStateIndex ?? 0] ?? ''] || 0
  }

  private startWiggle() {
    this.itemRefs.forEach(item => {
      const el = item.nativeElement;
      const tween = gsap.fromTo(el, {rotation: -.5}, {
        rotation: .5,
        duration: 0.1,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
        transformBox: 'fill-box',
        transformOrigin: '50% 50%',
      });
      this.itemTweens.push(tween);
    });
  }

  private stopWiggle() {
    this.itemTweens.forEach(tween => tween.kill());
    this.itemTweens = [];
    this.itemRefs.forEach(item => {
      const el = item.nativeElement;
      gsap.set(el, {rotation: 0, transformBox: 'fill-box', transformOrigin: '50% 50%'});
    });
  }

  onEditOver(target: EventTarget | null) {
    this.editButton = target as HTMLElement;
    this.editButtonTween?.kill();
    this.editButtonTween = gsap.to(target, {
      scale: 1.1, duration: 0.2, ease: 'power2.out',
      transformBox: 'fill-box', transformOrigin: '50% 50%',
    });
  }

  onEditOut(target: EventTarget | null) {
    this.editButtonTween?.kill();
    this.editButtonTween = gsap.to(target, {
      scale: 1, duration: 0.2, ease: 'power2.out',
      transformBox: 'fill-box', transformOrigin: '50% 50%',
    });
  }

  private swapEditButton(target: HTMLElement, newMode: boolean) {
    this.editButtonTween?.kill();
    const previousScale = gsap.getProperty(target, 'scale');
    this.editButtonTween = gsap.to(target, {
      scale: 0.85, duration: 0.1, ease: 'power2.out',
      transformBox: 'fill-box', transformOrigin: '50% 50%',
      onComplete: () => {
        this.isEditMode = newMode;
        this.cdr.detectChanges();
        gsap.to(target, {
          scale: previousScale, duration: 0.1, ease: 'power2.out',
          transformBox: 'fill-box', transformOrigin: '50% 50%',
        });
      }
    });
  }
}
