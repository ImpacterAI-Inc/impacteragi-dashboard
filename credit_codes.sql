-- ImpacterAGI Credit Codes Database
-- Beta Launch - Free Credits for Early Adopters

CREATE TABLE IF NOT EXISTS credit_codes (
    code TEXT PRIMARY KEY,
    credits INTEGER NOT NULL,
    description TEXT,
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS code_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    user_email TEXT NOT NULL,
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (code) REFERENCES credit_codes(code)
);

-- Beta Launch Codes (February 2026)
INSERT INTO credit_codes (code, credits, description, max_uses) VALUES
-- High-value codes for VIPs / influencers
('BETA10K', 10000, 'VIP Beta Tester - 10,000 credits', 1),
('FOUNDER', 10000, 'Founder Access - 10,000 credits', 5),
('INFLUENCER', 5000, 'Influencer Partner - 5,000 credits', 10),

-- Standard beta codes
('BETA5K', 5000, 'Beta Tester - 5,000 credits', 1),
('EARLYBIRD', 5000, 'Early Bird Special - 5,000 credits', 20),
('LAUNCH2026', 3000, 'Launch Promo - 3,000 credits', 50),

-- Medium codes for broader distribution
('WELCOME', 2000, 'Welcome Bonus - 2,000 credits', 100),
('TRYIT', 1000, 'Try It Out - 1,000 credits', 200),
('STARTER', 1000, 'Starter Pack - 1,000 credits', 500),

-- Mass distribution codes
('BETA500', 500, 'Quick Test - 500 credits', 1000),
('HELLO', 500, 'Hello World - 500 credits', -1);  -- Unlimited uses

-- Set expiration for time-limited codes (30 days from now)
UPDATE credit_codes 
SET expires_at = datetime('now', '+30 days')
WHERE code IN ('LAUNCH2026', 'EARLYBIRD', 'WELCOME');
