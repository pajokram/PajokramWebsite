import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-nav-item',
  imports: [
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nav-item.component.html'
})
export class NavItemComponent {
  @Input() text: string = '';
  @Input() href: string = '';

}
