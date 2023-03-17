import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
const appRoutes: Routes = [
  {
    path: '',
    loadChildren: './web/web.module#WebModule'
  },

  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule'
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
