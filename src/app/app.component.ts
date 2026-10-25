import {Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {NavigationStart, Router, RouterOutlet} from '@angular/router';
import {NavBarComponent} from './nav-bar/nav-bar.component';
import {AppFooterComponent} from './app-footer/app-footer.component';
import {animateRouteTransition} from './app.animations';
import {filter} from 'rxjs/operators';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavBarComponent,
    AppFooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  @ViewChild('routerWrapper', {static: true}) routerWrapper!: ElementRef<HTMLElement>;

  private previousAnimation: string | null = null;
  /** Fixed-position clone of the leaving view, kept alive during the transition. */
  private pendingLeave: HTMLElement | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => {
        // Remove any leftover clone from a previous (possibly interrupted) transition
        this.pendingLeave?.remove();
        this.pendingLeave = null;

        // Find the currently rendered route component inside the wrapper
        const wrapper = this.routerWrapper.nativeElement;
        const currentView = Array.from(wrapper.children)
          .find((c): c is HTMLElement =>
            c.tagName.toLowerCase() !== 'router-outlet'
          );

        if (currentView) {
          // Clone the live view and pin it exactly over its current viewport position
          const clone = currentView.cloneNode(true) as HTMLElement;
          const rect = currentView.getBoundingClientRect();
          Object.assign(clone.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: '100',
            pointerEvents: 'none',
          });
          document.body.appendChild(clone);
          this.pendingLeave = clone;
        }
      });
  }

  onRouteActivate(component: unknown, outlet: RouterOutlet) {
    const entering = outlet.activatedRouteData?.['animation'] as string | undefined;
    const leaving  = this.previousAnimation;
    this.previousAnimation = entering ?? null;

    const wrapper = this.routerWrapper.nativeElement;
    const enterEl = Array.from(wrapper.children)
      .find((c): c is HTMLElement =>
        c.tagName.toLowerCase() !== 'router-outlet'
      );

    if (enterEl && this.pendingLeave && entering && leaving) {
      const leaveEl = this.pendingLeave;
      this.pendingLeave = null;

      animateRouteTransition(enterEl, leaveEl).then(() => {
        leaveEl.remove();
        gsap.set(enterEl, {clearProps: 'opacity'});
      });
    } else {
      // First load or no animation data – just discard the clone if any
      this.pendingLeave?.remove();
      this.pendingLeave = null;
    }
  }
}
