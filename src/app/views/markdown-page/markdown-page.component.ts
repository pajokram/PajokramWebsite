import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MarkdownComponent} from 'ngx-markdown';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-markdown-page',
  imports: [
    MarkdownComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './markdown-page.component.html'
})
export class MarkdownPageComponent implements OnInit {
  fileName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const filename = this.route.snapshot.paramMap.get('slug');
    // Check if the filename is valid and file exists

    if (filename) {
      const filePath = `posts/${filename}.md`;
      this.http.get(filePath, {responseType: 'text'}).subscribe({
        next: () => {
          this.fileName = filePath;
          this.cdr.markForCheck();
        },
        error: () => {
          this.router.navigate(['/not-found']).then();
        }
      });
    }
  }
}
