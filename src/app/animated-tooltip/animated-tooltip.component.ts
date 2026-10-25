import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import gsap from 'gsap';

export interface AnimatedTooltipData {
  id: string;
  x: number;
  y: number;
  text: string;
}

type TooltipPhase = 'hidden' | 'opening' | 'visible' | 'closing';

@Component({
  selector: 'app-animated-tooltip',
  templateUrl: './animated-tooltip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class AnimatedTooltipComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tooltipBox') tooltipBox?: ElementRef<HTMLElement>;

  displayedTooltip: AnimatedTooltipData | null = null;

  private requestedTooltip: AnimatedTooltipData | null = null;
  private phase: TooltipPhase = 'hidden';
  private tween?: gsap.core.Tween;
  private viewInitialized = false;
  private updateQueued = false;
  private destroyed = false;

  constructor(private cdr: ChangeDetectorRef) {
  }

  @Input()
  set tooltip(tooltip: AnimatedTooltipData | null) {
    this.requestedTooltip = tooltip;
    this.queueUpdate();
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.queueUpdate();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.tween?.kill();
  }

  private queueUpdate() {
    if (!this.viewInitialized || this.updateQueued) return;

    this.updateQueued = true;
    queueMicrotask(() => {
      this.updateQueued = false;
      if (!this.destroyed) {
        this.processRequest();
      }
    });
  }

  private processRequest() {
    const nextTooltip = this.requestedTooltip;

    if (!this.displayedTooltip) {
      if (nextTooltip) {
        this.openTooltip(nextTooltip);
      }
      return;
    }

    if (!nextTooltip || this.displayedTooltip.id !== nextTooltip.id) {
      this.closeTooltip();
      return;
    }

    if (this.phase === 'closing') {
      return;
    }

    // State changes on the same item can update in place.
    this.displayedTooltip = nextTooltip;
    this.cdr.detectChanges();
    this.animateOpen(true);
  }

  private openTooltip(tooltip: AnimatedTooltipData) {
    this.displayedTooltip = tooltip;
    this.cdr.detectChanges();
    this.phase = 'opening';
    this.animateOpen(false);
  }

  private animateOpen(isStateChange: boolean) {
    const el = this.tooltipBox?.nativeElement;
    this.tween?.kill();

    if (!el) {
      this.phase = 'hidden';
      return;
    }

    this.phase = 'opening';
    this.tween = gsap.fromTo(el,
      {
        scale: isStateChange ? 0.94 : 0,
        y: isStateChange ? 1 : 3,
        xPercent: -50,
        transformOrigin: '50% 100%'
      },
      {
        scale: 1,
        y: 0,
        xPercent: -50,
        duration: 0.1,
        ease: 'power2.out',
        transformOrigin: '50% 100%',
        overwrite: true,
        onComplete: () => {
          this.tween = undefined;
          this.phase = 'visible';
          gsap.set(el, {scale: 1, y: 0, xPercent: -50});

          if (!this.requestedTooltip || this.requestedTooltip.id !== this.displayedTooltip?.id) {
            this.closeTooltip();
          }
        }
      }
    );
  }

  private closeTooltip() {
    if (!this.displayedTooltip || this.phase === 'closing') return;

    const el = this.tooltipBox?.nativeElement;
    this.tween?.kill();
    this.phase = 'closing';

    if (!el) {
      this.finishClose();
      return;
    }

    this.tween = gsap.to(el, {
      scale: 0,
      y: 3,
      xPercent: -50,
      duration: 0.1,
      ease: 'power2.in',
      transformOrigin: '50% 100%',
      overwrite: true,
      onComplete: () => {
        this.tween = undefined;
        gsap.set(el, {scale: 0, y: 3, xPercent: -50});
        this.finishClose();
      }
    });
  }

  private finishClose() {
    const nextTooltip = this.requestedTooltip;
    if (nextTooltip) {
      // Content and position change only while the box is fully collapsed.
      this.openTooltip(nextTooltip);
      return;
    }

    this.displayedTooltip = null;
    this.phase = 'hidden';
    this.cdr.detectChanges();
  }
}
