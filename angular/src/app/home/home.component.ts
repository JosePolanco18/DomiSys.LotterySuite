import { AuthService } from '@abp/ng.core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    SharedModule
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private checkAuthInterval?: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get hasLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    const hasOAuthParams = this.route.snapshot.queryParams['code'];

    if (hasOAuthParams) {
      this.checkAuthInterval = setInterval(() => {
        if (this.hasLoggedIn) {
          clearInterval(this.checkAuthInterval);
          this.router.navigate(['/dashboard']);
        }
      }, 500);
      return;
    }

    setTimeout(() => {
      if (this.hasLoggedIn) {
        this.router.navigate(['/dashboard']);
      } else {
        this.authService.navigateToLogin();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.checkAuthInterval) {
      clearInterval(this.checkAuthInterval);
    }
  }
}
