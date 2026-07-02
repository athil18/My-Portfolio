-- =============================================================================
-- MHD Commerce: MongoDB → Supabase PostgreSQL Migration
-- Phase 3: Complete Schema, Indexes, RLS Policies, Triggers, Functions
-- Generated: 2026-07-01
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE product_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'failed', 'refunded');
CREATE TYPE transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'requires_action', 'canceled', 'refunded');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE file_folder AS ENUM ('products', 'avatars', 'documents');

-- =============================================================================
-- TABLE: profiles (merged User + UserProfile)
-- Maps to: users collection + userProfiles collection
-- Auth is handled by Supabase auth.users; this stores app-level metadata
-- =============================================================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    last_login TIMESTAMPTZ,
    -- Merged from UserProfile
    avatar TEXT,
    phone TEXT,
    location_city TEXT,
    location_country TEXT,
    date_of_birth DATE,
    bio TEXT,
    social_twitter TEXT,
    social_linkedin TEXT,
    social_github TEXT,
    -- Legacy ID for data migration mapping
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_legacy_id ON public.profiles(legacy_mongo_id);

-- =============================================================================
-- TABLE: products
-- Maps to: products collection
-- =============================================================================

CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    status product_status DEFAULT 'draft' NOT NULL,
    priority product_priority DEFAULT 'medium' NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
    sku TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_user_status ON public.products(user_id, status);
CREATE INDEX idx_products_category_status ON public.products(category, status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_is_deleted ON public.products(is_deleted);
CREATE INDEX idx_products_legacy_id ON public.products(legacy_mongo_id);
-- Full text search index (replaces MongoDB text index)
-- Uses a generated column approach for immutability
CREATE OR REPLACE FUNCTION public.products_fts_vector(title TEXT, description TEXT, tags TEXT[])
RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(tags, ' '), ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE INDEX idx_products_fts ON public.products
    USING GIN (public.products_fts_vector(title, description, tags));

-- =============================================================================
-- TABLE: orders
-- Maps to: orders collection (header only, items normalized out)
-- =============================================================================

CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status order_status DEFAULT 'pending' NOT NULL,
    payment_status payment_status DEFAULT 'unpaid' NOT NULL,
    stripe_session_id TEXT,
    -- Shipping address (flattened from nested object)
    shipping_line1 TEXT,
    shipping_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_legacy_id ON public.orders(legacy_mongo_id);

-- =============================================================================
-- TABLE: order_items (normalized from embedded items[] array in orders)
-- =============================================================================

CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- =============================================================================
-- TABLE: transactions
-- Maps to: transactions collection (Stripe payment records)
-- =============================================================================

CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    stripe_payment_id TEXT NOT NULL UNIQUE,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status transaction_status DEFAULT 'pending' NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    error TEXT,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_order_id ON public.transactions(order_id);
CREATE INDEX idx_transactions_stripe_id ON public.transactions(stripe_payment_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_legacy_id ON public.transactions(legacy_mongo_id);

-- =============================================================================
-- TABLE: carts
-- Maps to: carts collection (header)
-- =============================================================================

CREATE TABLE public.carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_price NUMERIC(12,2) DEFAULT 0 NOT NULL,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_carts_user_id ON public.carts(user_id);

-- =============================================================================
-- TABLE: cart_items (normalized from embedded items[] array in carts)
-- =============================================================================

CREATE TABLE public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- =============================================================================
-- TABLE: files
-- Maps to: files collection (Cloudinary file references)
-- =============================================================================

CREATE TABLE public.files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    size_thumbnail TEXT,
    size_medium TEXT,
    size_large TEXT,
    public_id TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    folder file_folder NOT NULL,
    is_optimized BOOLEAN DEFAULT FALSE NOT NULL,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_folder ON public.files(folder);
CREATE INDEX idx_files_user_folder ON public.files(user_id, folder);

-- =============================================================================
-- TABLE: notifications
-- Maps to: notifications collection
-- =============================================================================

CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'info' NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);

-- =============================================================================
-- TABLE: analytics_events
-- Maps to: analyticsEvents collection
-- =============================================================================

CREATE TABLE public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_id TEXT,
    event TEXT NOT NULL,
    category TEXT NOT NULL,
    label TEXT,
    value NUMERIC,
    properties JSONB DEFAULT '{}'::jsonb,
    url TEXT,
    user_agent TEXT,
    ip TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_guest_id ON public.analytics_events(guest_id);
CREATE INDEX idx_analytics_event ON public.analytics_events(event);
CREATE INDEX idx_analytics_category ON public.analytics_events(category);
CREATE INDEX idx_analytics_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_category_event ON public.analytics_events(category, event);
CREATE INDEX idx_analytics_timestamp_event ON public.analytics_events(timestamp DESC, event);

-- =============================================================================
-- TABLE: calendar_events
-- Maps to: calendarEvents collection
-- =============================================================================

CREATE TABLE public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_calendar_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_calendar_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_user_dates ON public.calendar_events(user_id, start_date, end_date);

-- =============================================================================
-- TABLE: sessions (will be deprecated once Supabase Auth is fully integrated)
-- Maps to: sessions collection
-- =============================================================================

CREATE TABLE public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    device TEXT DEFAULT 'Unknown Device',
    browser TEXT DEFAULT 'Unknown Browser',
    os TEXT DEFAULT 'Unknown OS',
    ip_address TEXT DEFAULT 'Unknown',
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT FALSE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_token ON public.sessions(token);
CREATE INDEX idx_sessions_expires_at ON public.sessions(expires_at);

-- =============================================================================
-- TABLE: refresh_tokens (will be deprecated once Supabase Auth is fully integrated)
-- Maps to: refreshTokens collection
-- =============================================================================

CREATE TABLE public.refresh_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    legacy_mongo_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON public.refresh_tokens(expires_at);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalculate cart total_price when cart_items change
CREATE OR REPLACE FUNCTION public.recalculate_cart_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.carts
    SET total_price = (
        SELECT COALESCE(SUM(price * quantity), 0)
        FROM public.cart_items
        WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Computed discount percentage view for products
CREATE OR REPLACE FUNCTION public.discount_percentage(p public.products)
RETURNS INTEGER AS $$
BEGIN
    IF p.compare_at_price IS NOT NULL AND p.compare_at_price > p.price THEN
        RETURN ROUND((1 - p.price / p.compare_at_price) * 100);
    END IF;
    RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- updated_at triggers for all tables with updated_at column
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_carts_updated_at BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_files_updated_at BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_notifications_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_analytics_updated_at BEFORE UPDATE ON public.analytics_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_calendar_updated_at BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on Supabase Auth signup
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recalculate cart total when items change
CREATE TRIGGER on_cart_item_change AFTER INSERT OR UPDATE OR DELETE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.recalculate_cart_total();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles, update only their own
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- PRODUCTS: Anyone can read active products; owners can CRUD their own
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_deleted = false);
CREATE POLICY "products_insert_own" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- ORDERS: Users can only see their own orders
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- ORDER_ITEMS: Visible if user owns the parent order
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- TRANSACTIONS: Users see only their own transactions
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_service" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CARTS: Users see only their own cart
CREATE POLICY "carts_select_own" ON public.carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "carts_insert_own" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "carts_update_own" ON public.carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "carts_delete_own" ON public.carts FOR DELETE USING (auth.uid() = user_id);

-- CART_ITEMS: Visible if user owns the parent cart
CREATE POLICY "cart_items_select_own" ON public.cart_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "cart_items_insert_own" ON public.cart_items FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "cart_items_update_own" ON public.cart_items FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));
CREATE POLICY "cart_items_delete_own" ON public.cart_items FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()));

-- FILES: Users see only their own files
CREATE POLICY "files_select_own" ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "files_insert_own" ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "files_delete_own" ON public.files FOR DELETE USING (auth.uid() = user_id);

-- NOTIFICATIONS: Users see only their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ANALYTICS: Insert by anyone (including anonymous); select by admin only via service key
CREATE POLICY "analytics_insert_any" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "analytics_select_own" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);

-- CALENDAR_EVENTS: Users see only their own events
CREATE POLICY "calendar_select_own" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "calendar_insert_own" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "calendar_update_own" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "calendar_delete_own" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- SESSIONS: Users see only their own sessions
CREATE POLICY "sessions_select_own" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_delete_own" ON public.sessions FOR DELETE USING (auth.uid() = user_id);

-- REFRESH_TOKENS: Users see only their own tokens
CREATE POLICY "refresh_tokens_select_own" ON public.refresh_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "refresh_tokens_insert_own" ON public.refresh_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "refresh_tokens_delete_own" ON public.refresh_tokens FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Active products view (replaces Mongoose pre-find middleware)
CREATE OR REPLACE VIEW public.active_products AS
SELECT *, public.discount_percentage(products.*) AS discount_pct
FROM public.products
WHERE is_deleted = false;

-- Unread notification count per user
CREATE OR REPLACE VIEW public.unread_notification_counts AS
SELECT user_id, COUNT(*) AS unread_count
FROM public.notifications
WHERE is_read = false
GROUP BY user_id;
