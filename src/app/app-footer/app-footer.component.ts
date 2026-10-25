import {Component, HostBinding, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-footer.component.html'
})
export class AppFooterComponent {
  @HostBinding('class') class = 'w-full';

}
