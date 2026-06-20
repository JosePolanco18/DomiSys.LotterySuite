import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardDto, DashboardService } from 'src/app/proxy/reportes/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [SharedModule, CommonModule, RouterLink]
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardDto | null = null;
  isLoading = true;
  private refreshTimer: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
    // ponytail: simple setInterval, replace with SignalR if real-time matters
    this.refreshTimer = setInterval(() => this.load(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  load(): void {
    this.dashboardService.obtenerDashboard().subscribe({
      next: (d) => { this.data = d; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  get balanceHoy(): number {
    if (!this.data) return 0;
    return this.data.ventasHoy - this.data.premiosPagadosHoy;
  }

  get enVerde(): boolean {
    return this.balanceHoy > 0;
  }
}
