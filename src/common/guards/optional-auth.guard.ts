import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Siempre permitir acceso, pero extraer usuario si está presente
    const result = super.canActivate(context);
    
    if (result instanceof Promise) {
      return result.catch(() => {
        // Si falla la autenticación, simplemente continuar sin usuario
        return true;
      });
    }
    
    return result;
  }

  handleRequest(err: any, user: any) {
    // Retornar el usuario si existe, o undefined si no
    return user || undefined;
  }
}
