-- Supabase SQL Migration: BarFlow Core Schema & Security
-- Contiene: Tablas de usuarios, balance de tokens y órdenes de bebidas.
-- Regla ANTIGRAV: Primary Keys estrictas en cada tabla.
-- Regla ANTIGRAV: Row-Level Security (RLS) habilitado por defecto.

-- 0. Limpieza (Destruir tablas antiguas para aplicar el nuevo sistema MXN)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.drinks CASCADE;
DROP TABLE IF EXISTS public.wallet_balance CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Tabla Perfiles de Usuarios (Users)
-- Extiende la tabla auth.users nativa de Supabase.
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Catálogo de Bebidas (Drinks)
CREATE TABLE public.drinks (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_mxn NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Balance de Tokens / Wallet (wallet_balance)
-- Registra los tokens disponibles por usuario para ordenar bebidas.
CREATE TABLE public.wallet_balance (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Órdenes / Pedidos (Orders)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id TEXT DEFAULT 'guest_user' NOT NULL,
  drink_id UUID REFERENCES public.drinks(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_mxn NUMERIC(10, 2) NOT NULL,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar STRICT Row-Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- === RLS Policies ===

-- Users: Pueden leer y actualizar su PROPIO perfil.
CREATE POLICY "Users can view their own profile."
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Drinks: Todos pueden leer las bebidas disponibles (Lectura Pública).
CREATE POLICY "Anyone can view drinks."
  ON public.drinks FOR SELECT USING (true);

-- Wallet: Los usuarios solo pueden ver su propio saldo.
CREATE POLICY "Users can view their own wallet"
  ON public.wallet_balance FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON public.wallet_balance FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders: Solo usuarios autenticados pueden insertar órdenes.
CREATE POLICY "Authenticated users can insert orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view any order for demo"
  ON public.orders FOR SELECT USING (true);

-- Creación de función para asegurar Perfil con Usuario nuevo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Trigger automático al registro
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
