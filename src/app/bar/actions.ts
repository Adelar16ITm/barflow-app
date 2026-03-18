'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function orderDrink(drinkId: string, tokensCost: number) {
  try {
    // 1. Verificar Sesión (COMENTADO PARA MODO INVITADO)
    /*
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado.' };
    }
    */

    // Demo mode: bypass DB checks and accept order
    return { success: true, message: '¡Orden de prueba exitosa (Invitado)!' };

    // El código completo original se omitió por solicitud del usuario de modo invitado
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
