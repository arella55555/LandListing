import { pool } from "./db";

export async function migrate() {
  try {
    /* ============================================================
       BASE TABLES (SAFE FOR NEW DATABASES)
    ============================================================ */

    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;

      -- ============================================================
      -- USERS
      -- ============================================================

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password_hash TEXT NOT NULL,

        -- KEEP OLD COMPATIBILITY
        role VARCHAR(20) NOT NULL DEFAULT 'buyer',

        is_verified BOOLEAN NOT NULL DEFAULT FALSE,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- CATEGORIES
      -- ============================================================

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(60)
      );

      INSERT INTO categories (
        name,
        description,
        icon
      ) VALUES
      (
        'Agricultural',
        'Farmlands and agricultural lots',
        '🌾'
      ),
      (
        'Residential',
        'Lots for residential use',
        '🏡'
      ),
      (
        'Commercial',
        'Commercial lots and properties',
        '🏢'
      ),
      (
        'Industrial',
        'Industrial lots and factories',
        '🏭'
      ),
      (
        'Farm Lot',
        'Farm lots and coconut lands',
        '🥥'
      )
      ON CONFLICT (name) DO NOTHING;

      -- ============================================================
      -- LISTINGS
      -- ============================================================

      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        seller_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

        category_id INT NOT NULL
        REFERENCES categories(id),

        title VARCHAR(200) NOT NULL,

        description TEXT NOT NULL,

        price NUMERIC(15,2)
        NOT NULL
        CHECK (price >= 0),

        area_sqm NUMERIC(12,2)
        NOT NULL
        CHECK (area_sqm > 0),

        latitude NUMERIC(10,7) NOT NULL,
        longitude NUMERIC(10,7) NOT NULL,

        barangay VARCHAR(100),

        municipality VARCHAR(100) NOT NULL,

        province VARCHAR(100) NOT NULL,

        title_status VARCHAR(20)
        NOT NULL
        CHECK (
          title_status IN (
            'TCT',
            'OCT',
            'tax_dec',
            'other'
          )
        ),

        listing_type VARCHAR(20)
        NOT NULL
        CHECK (
          listing_type IN (
            'sale',
            'rent',
            'lease'
          )
        ),

        -- OLD COLUMN KEPT FOR COMPATIBILITY
        status VARCHAR(20)
        NOT NULL
        DEFAULT 'pending'
        CHECK (
          status IN (
            'draft',
            'pending',
            'active',
            'sold',
            'leased',
            'rented',
            'rejected',
            'archived'
          )
        ),

        negotiable BOOLEAN NOT NULL DEFAULT TRUE,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- LISTING IMAGES
      -- ============================================================

      CREATE TABLE IF NOT EXISTS listing_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        listing_id UUID NOT NULL
        REFERENCES listings(id)
        ON DELETE CASCADE,

        image_url TEXT NOT NULL,

        is_primary BOOLEAN NOT NULL DEFAULT FALSE,

        sort_order INT NOT NULL DEFAULT 0
      );

      -- ============================================================
      -- NEGOTIATIONS
      -- ============================================================

      CREATE TABLE IF NOT EXISTS negotiations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        listing_id UUID NOT NULL
        REFERENCES listings(id)
        ON DELETE CASCADE,

        buyer_id UUID NOT NULL
        REFERENCES users(id),

        seller_id UUID NOT NULL
        REFERENCES users(id),

        asking_price NUMERIC(15,2) NOT NULL,

        final_price NUMERIC(15,2),

        status VARCHAR(20)
        NOT NULL
        DEFAULT 'open'
        CHECK (
          status IN (
            'open',
            'accepted',
            'rejected',
            'withdrawn',
            'completed'
          )
        ),

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE(listing_id, buyer_id),

        CHECK (buyer_id <> seller_id)
      );

      -- ============================================================
      -- MESSAGES
      -- ============================================================

      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        negotiation_id UUID NOT NULL
        REFERENCES negotiations(id)
        ON DELETE CASCADE,

        sender_id UUID NOT NULL
        REFERENCES users(id),

        content TEXT NOT NULL,

        message_type VARCHAR(20)
        NOT NULL
        CHECK (
          message_type IN (
            'text',
            'offer',
            'counter_offer',
            'acceptance',
            'rejection'
          )
        ),

        offer_amount NUMERIC(15,2),

        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        CHECK (
          (
            message_type IN (
              'offer',
              'counter_offer'
            )
            AND offer_amount IS NOT NULL
          )
          OR
          (
            message_type NOT IN (
              'offer',
              'counter_offer'
            )
          )
        )
      );

      -- ============================================================
      -- SAVED LISTINGS
      -- ============================================================

      CREATE TABLE IF NOT EXISTS saved_listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

        listing_id UUID NOT NULL
        REFERENCES listings(id)
        ON DELETE CASCADE,

        saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE(user_id, listing_id)
      );

      -- ============================================================
      -- REVIEWS
      -- ============================================================

      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        reviewer_id UUID NOT NULL
        REFERENCES users(id),

        seller_id UUID NOT NULL
        REFERENCES users(id),

        listing_id UUID NOT NULL
        REFERENCES listings(id),

        rating SMALLINT NOT NULL
        CHECK (
          rating BETWEEN 1 AND 5
        ),

        comment TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        UNIQUE(reviewer_id, listing_id)
      );

      -- ============================================================
      -- ADMIN LOGS
      -- ============================================================

      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        admin_id UUID NOT NULL
        REFERENCES users(id),

        action VARCHAR(80) NOT NULL,

        target_type VARCHAR(40) NOT NULL,

        target_id UUID NOT NULL,

        notes TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- NEW TABLES (SAFE ADDITIONS)
      -- ============================================================

      CREATE TABLE IF NOT EXISTS seller_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

        valid_id_url TEXT NOT NULL,

        selfie_with_id_url TEXT,

        proof_of_ownership_url TEXT,

        status VARCHAR(20)
        NOT NULL DEFAULT 'pending'
        CHECK (
          status IN (
            'pending',
            'approved',
            'rejected'
          )
        ),

        reviewed_by UUID
        REFERENCES users(id),

        rejection_reason TEXT,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        reviewed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS listing_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        listing_id UUID NOT NULL
        REFERENCES listings(id)
        ON DELETE CASCADE,

        reported_by UUID NOT NULL
        REFERENCES users(id),

        reason TEXT NOT NULL,

        status VARCHAR(20)
        NOT NULL DEFAULT 'open'
        CHECK (
          status IN (
            'open',
            'reviewed',
            'dismissed'
          )
        ),

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    /* ============================================================
       SAFE ALTERS FOR EXISTING DATABASES
       ONLY ADDS NEW STUFF
       DOES NOT REMOVE OR RENAME OLD COLUMNS
    ============================================================ */

    await pool.query(`
      -- ============================================================
      -- USERS SAFE UPDATES
      -- ============================================================

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS admin_level
      SMALLINT NOT NULL DEFAULT 0;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_suspended
      BOOLEAN NOT NULL DEFAULT FALSE;

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS seller_verification_status
      VARCHAR(20);

      -- allow superadmin safely
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_role_check;

      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (
        role IN (
          'buyer',
          'seller',
          'admin',
          'superadmin'
        )
      );

      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_seller_verification_status_check;

      ALTER TABLE users
      ADD CONSTRAINT users_seller_verification_status_check
      CHECK (
        seller_verification_status IN (
          'pending',
          'approved',
          'rejected'
        )
        OR seller_verification_status IS NULL
      );
    `);

    await pool.query(`
      -- ============================================================
      -- LISTINGS SAFE UPDATES
      -- ============================================================

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS moderation_status
      VARCHAR(20)
      DEFAULT 'pending';

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS listing_status
      VARCHAR(20)
      DEFAULT 'available';

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS approved_by UUID;

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS rejected_by UUID;

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS flagged_reason TEXT;
    `);

    await pool.query(`
  -- ============================================================
  -- BUYER VERIFICATION
  -- ============================================================

  CREATE TABLE IF NOT EXISTS buyer_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

    valid_id_url TEXT NOT NULL,

    selfie_with_id_url TEXT,

    proof_of_funds_url TEXT,

    billing_address TEXT,

    gcash_name VARCHAR(120),

    gcash_number VARCHAR(20),

    bank_name VARCHAR(120),

    bank_account_name VARCHAR(120),

    bank_account_number VARCHAR(60),

    status VARCHAR(20)
    NOT NULL DEFAULT 'pending'
    CHECK (
      status IN (
        'pending',
        'approved',
        'rejected'
      )
    ),

    reviewed_by UUID
    REFERENCES users(id),

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    reviewed_at TIMESTAMPTZ
  );
`);

await pool.query(`
  -- ============================================================
  -- USERS SAFE BUYER VERIFICATION
  -- ============================================================

  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS buyer_verification_status
  VARCHAR(20);

  ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_buyer_verification_status_check;

  ALTER TABLE users
  ADD CONSTRAINT users_buyer_verification_status_check
  CHECK (
    buyer_verification_status IN (
      'pending',
      'approved',
      'rejected'
    )
    OR buyer_verification_status IS NULL
  );
`);

    await pool.query(`
      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
    `);

    await pool.query(`
      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
    `);

    await pool.query(`
      ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS is_featured
      BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS listing_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        listing_id UUID NOT NULL
        REFERENCES listings(id)
        ON DELETE CASCADE,

        document_type VARCHAR(40)
        NOT NULL,

        document_url TEXT NOT NULL,

        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}
