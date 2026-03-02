import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from
'@angular/router';
import Keycloak from 'keycloak-js';
import { AuthService } from './auth.service';
//angular lo esegue automaticamente prima di
//attivare qualsiasi rotta che ha canActivate: [authGuard]
//lo vedremo dopo nell'app.routes.ts
export const authGuard: CanActivateFn = (
_route: ActivatedRouteSnapshot,
state: RouterStateSnapshot
) => {
const keycloak = inject(Keycloak);
//se autenticato,carica il componente
if (keycloak.authenticated) return true;
//altrimenti manda al login
keycloak.login({
redirectUri: window.location.origin + state.url,
});
return false;
};
//aggiugiamo il userPlusGuard
export const userPlusGuard: CanActivateFn = () => {
const authService = inject(AuthService);
const router = inject(Router);
//se l'utente user_plus true
if (authService.hasRole('user_plus')) return true;
//altrimenti torna a / (home nel nostro caso):
router.navigate(['/']);
return false;
};