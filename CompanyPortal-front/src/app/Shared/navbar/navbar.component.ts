import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../Services/Auth.service';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuItems: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  private router = inject(Router);
  authService = inject(AuthService);
  isAuth$ = this.authService.isAuthenticated$;
  private sub?: Subscription;

  ngOnInit(): void {
    // أول بناء
    this.rebuildMenus(this.authService.isAuthenticated());

    // اسمع لأي تغيّر في حالة الأوث، و"أعد بناء" القوائم
    this.sub = this.isAuth$.subscribe(isAuth => {
      this.rebuildMenus(isAuth);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private rebuildMenus(isAuth: boolean) {
    // مهم: نعمل آرايز جديدة عشان PrimeNG يلتقط التغيير
    this.menuItems = [
      ...(isAuth ? [{
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/home'
      }] as MenuItem[] : [])
    ];

    this.userMenuItems = isAuth
      ? [
          { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' },
          { separator: true },
          { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
        ]
      : [
          { label: 'Login', icon: 'pi pi-sign-in', routerLink: '/auth/login' },
          { label: 'Register', icon: 'pi pi-user-plus', routerLink: '/auth/register' }
        ];
  }

  logout() {
    this.authService.logOut();
    this.router.navigateByUrl('/auth/login');
  }

}
