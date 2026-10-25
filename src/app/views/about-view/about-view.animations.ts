import {ElementRef, Injectable, QueryList} from '@angular/core';
import {Subscription} from 'rxjs';
import gsap from 'gsap';

@Injectable()
export class AboutViewAnimations {
  private itemRefs?: QueryList<ElementRef<SVGElement>>;
  private itemChanges?: Subscription;
  private itemTweens = new Map<SVGElement, gsap.core.Tween>();
  private editButtonTween?: gsap.core.Tween;

  connectItems(itemRefs: QueryList<ElementRef<SVGElement>>) {
    this.itemChanges?.unsubscribe();
    this.itemRefs = itemRefs;
    this.initializeItemTransforms();
    this.itemChanges = itemRefs.changes.subscribe(() => this.initializeItemTransforms());
  }

  animateStateChange(element: SVGElement, swapState: () => void) {
    this.killItemTween(element);

    const shrinkTween = gsap.fromTo(element, {scale: 1}, {
      scale: 0.85,
      duration: 0.1,
      ease: 'power2.out',
      transformBox: 'fill-box',
      transformOrigin: '50% 50%',
      onComplete: () => {
        if (this.itemTweens.get(element) !== shrinkTween) return;

        swapState();
        const expandTween: gsap.core.Tween = gsap.to(element, {
          scale: 1,
          duration: 0.1,
          ease: 'power2.out',
          transformBox: 'fill-box',
          transformOrigin: '50% 50%',
          onComplete: () => {
            this.removeCompletedItemTween(element, expandTween);
          }
        });
        this.itemTweens.set(element, expandTween);
      }
    });
    this.itemTweens.set(element, shrinkTween);
  }

  scaleItem(element: SVGElement) {
    this.animateItemScale(element, 1.05);
  }

  resetItemScales() {
    this.itemRefs?.forEach(ref => this.animateItemScale(ref.nativeElement, 1));
  }

  setItemsWiggling(enabled: boolean) {
    this.killItemTweens();

    this.itemRefs?.forEach(ref => {
      const element = ref.nativeElement;
      if (!enabled) {
        gsap.set(element, {
          rotation: 0,
          transformBox: 'fill-box',
          transformOrigin: '50% 50%'
        });
        return;
      }

      const tween = gsap.fromTo(element, {rotation: -0.5}, {
        rotation: 0.5,
        duration: 0.1,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
        transformBox: 'fill-box',
        transformOrigin: '50% 50%'
      });
      this.itemTweens.set(element, tween);
    });
  }

  animateEditButtonHover(target: HTMLElement, hovered: boolean) {
    this.editButtonTween?.kill();
    this.editButtonTween = gsap.to(target, {
      scale: hovered ? 1.1 : 1,
      duration: 0.2,
      ease: 'power2.out',
      transformBox: 'fill-box',
      transformOrigin: '50% 50%'
    });
  }

  animateEditButtonSwap(target: HTMLElement, swapMode: () => void) {
    this.editButtonTween?.kill();
    const previousScale = gsap.getProperty(target, 'scale');

    this.editButtonTween = gsap.to(target, {
      scale: 0.85,
      duration: 0.1,
      ease: 'power2.out',
      transformBox: 'fill-box',
      transformOrigin: '50% 50%',
      onComplete: () => {
        swapMode();
        this.editButtonTween = gsap.to(target, {
          scale: previousScale,
          duration: 0.1,
          ease: 'power2.out',
          transformBox: 'fill-box',
          transformOrigin: '50% 50%'
        });
      }
    });
  }

  destroy() {
    this.itemChanges?.unsubscribe();
    this.killItemTweens();
    this.editButtonTween?.kill();
  }

  private initializeItemTransforms() {
    this.itemRefs?.forEach(ref => {
      gsap.set(ref.nativeElement, {
        transformBox: 'fill-box',
        transformOrigin: '50% 50%'
      });
    });
  }

  private animateItemScale(element: SVGElement, scale: number) {
    this.killItemTween(element);
    const tween: gsap.core.Tween = gsap.to(element, {
      scale,
      duration: 0.2,
      ease: 'power2.out',
      transformBox: 'fill-box',
      transformOrigin: '50% 50%',
      onComplete: () => {
        this.removeCompletedItemTween(element, tween);
      }
    });
    this.itemTweens.set(element, tween);
  }

  private killItemTween(element: SVGElement) {
    this.itemTweens.get(element)?.kill();
    this.itemTweens.delete(element);
  }

  private killItemTweens() {
    this.itemTweens.forEach(tween => tween.kill());
    this.itemTweens.clear();
  }

  private removeCompletedItemTween(element: SVGElement, tween: gsap.core.Tween) {
    if (this.itemTweens.get(element) === tween) {
      this.itemTweens.delete(element);
    }
  }
}
