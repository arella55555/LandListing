import pool from "./db";

export async function migrate() {
  try {
    await pool.query(`
      -- ============================================================
        --  lupa.ph – Clean Database Schema
        -- ============================================================

        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        -- ============================================================
        -- USERS
        -- ============================================================

        CREATE TABLE IF NOT EXISTS users (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name       VARCHAR(120) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        phone           VARCHAR(20) NOT NULL,
        password_hash   TEXT NOT NULL,
        role            VARCHAR(10) NOT NULL CHECK (role IN ('buyer','seller','admin')),
        is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- ============================================================
        -- CATEGORIES
        -- ============================================================

        CREATE TABLE IF NOT EXISTS categories (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(60) NOT NULL UNIQUE,
        description     TEXT,
        icon            VARCHAR(60)
        );

        INSERT INTO categories (name, description, icon) VALUES
        ('Agricultural', 'Farmlands and agricultural lots', '🌾'),
        ('Residential',  'Lots for residential use', '🏡'),
        ('Commercial',   'Commercial lots and properties', '🏢'),
        ('Industrial',   'Industrial lots and factories', '🏭'),
        ('Farm Lot',     'Farm lots and coconut lands', '🥥')
        ON CONFLICT (name) DO NOTHING;

        -- ============================================================
        -- LISTINGS
        -- ============================================================

        CREATE TABLE IF NOT EXISTS listings (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id         INT NOT NULL REFERENCES categories(id),
        title               VARCHAR(200) NOT NULL,
        description         TEXT NOT NULL,
        price               NUMERIC(15,2) NOT NULL CHECK (price >= 0),
        area_sqm            NUMERIC(12,2) NOT NULL CHECK (area_sqm > 0),
        latitude            NUMERIC(10,7) NOT NULL,
        longitude           NUMERIC(10,7) NOT NULL,
        barangay            VARCHAR(100),
        municipality        VARCHAR(100) NOT NULL,
        province            VARCHAR(100) NOT NULL,
        title_status        VARCHAR(20) NOT NULL CHECK (title_status IN ('TCT','OCT','tax_dec','other')),
        listing_type        VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale','rent','lease')),
        status              VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('draft','pending','active','sold','leased','rented','rejected','archived')),
        negotiable          BOOLEAN NOT NULL DEFAULT TRUE,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        -- ============================================================
        -- LISTING IMAGES
        -- ============================================================

        CREATE TABLE IF NOT EXISTS listing_images (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id          UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        image_url           TEXT NOT NULL,
        is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order          INT NOT NULL DEFAULT 0
        );

        -- ============================================================
        -- NEGOTIATIONS
        -- ============================================================

        CREATE TABLE IF NOT EXISTS negotiations (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id          UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        buyer_id            UUID NOT NULL REFERENCES users(id),
        seller_id           UUID NOT NULL REFERENCES users(id),
        asking_price        NUMERIC(15,2) NOT NULL,
        final_price         NUMERIC(15,2),
        status              VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','rejected','withdrawn','completed')),
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(listing_id, buyer_id),
        CHECK (buyer_id <> seller_id)
        );

        -- ============================================================
        -- MESSAGES
        -- ============================================================

        CREATE TABLE IF NOT EXISTS messages (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        negotiation_id      UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
        sender_id           UUID NOT NULL REFERENCES users(id),
        content             TEXT NOT NULL,
        message_type        VARCHAR(20) NOT NULL CHECK (message_type IN ('text','offer','counter_offer','acceptance','rejection')),
        offer_amount        NUMERIC(15,2),
        sent_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK ((message_type IN ('offer','counter_offer') AND offer_amount IS NOT NULL) OR (message_type NOT IN ('offer','counter_offer')))
        );

        -- ============================================================
        -- SAVED LISTINGS / FAVORITES
        -- ============================================================

        CREATE TABLE IF NOT EXISTS saved_listings (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_id          UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
        saved_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, listing_id)
        );

        -- ============================================================
        -- REVIEWS
        -- ============================================================

        CREATE TABLE IF NOT EXISTS reviews (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reviewer_id         UUID NOT NULL REFERENCES users(id),
        seller_id           UUID NOT NULL REFERENCES users(id),
        listing_id          UUID NOT NULL REFERENCES listings(id),
        rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment             TEXT,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(reviewer_id, listing_id)
        );

        -- ============================================================
        -- ADMIN LOGS
        -- ============================================================

        CREATE TABLE IF NOT EXISTS admin_logs (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id            UUID NOT NULL REFERENCES users(id),
        action              VARCHAR(80) NOT NULL,
        target_type         VARCHAR(40) NOT NULL,
        target_id           UUID NOT NULL,
        notes               TEXT,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    console.log("Migration successful");
  } catch (err) {
    console.error(err);
  } //finally {
    //await pool.end();  
  //}
}

////migrate(); 
 