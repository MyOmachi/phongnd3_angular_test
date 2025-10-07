import { Directive, ElementRef, input, output } from '@angular/core';

@Directive({ selector: '[appInfiniteScroll]', standalone: true })
export class InfiniteScrollDirective {
  disabled = input(false);
  rootMargin = input('200px 0px');
  reached = output<void>();
  private io?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.io = new IntersectionObserver(
      ([entry]) => {
        if (!this.disabled() && entry.isIntersecting) this.reached.emit();
      },
      { root: null, rootMargin: this.rootMargin(), threshold: 0.01 }
    );

    this.io.observe(this.el.nativeElement);
  }
  ngOnDestroy() {
    this.io?.disconnect();
  }
}
