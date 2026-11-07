-- One-off migration (2026-11-07): admin-editable landing-page content for categories.
-- Run once against the production database. Safe to re-run.
-- Fresh databases get the same result from Tables.sql + Database/Procedures/.

-- 1. New column
ALTER TABLE categories ADD COLUMN IF NOT EXISTS content TEXT NULL;

-- 2. Functions (same as Database/Procedures/usp_category_getbytype.sql and usp_category_updatecontent.sql)
-- Return columns changed (content added) — CREATE OR REPLACE can't change a function's
-- return type, so drop the old signature first.
DROP FUNCTION IF EXISTS usp_category_getbytype(VARCHAR);

CREATE OR REPLACE FUNCTION usp_category_getbytype(p_type VARCHAR(20))
RETURNS TABLE (id INT, type VARCHAR(20), name VARCHAR(100), slug VARCHAR(100), createdat TIMESTAMPTZ, content TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.type, c.name, c.slug, c.createdat, c.content
    FROM categories c
    WHERE c.type = p_type
    ORDER BY c.name;
END;
$$;

-- Sets a category's landing-page content JSON (NULL clears it back to auto-generated text).
CREATE OR REPLACE FUNCTION usp_category_updatecontent(p_id INT, p_content TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE categories SET content = p_content WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- 3. Content that previously lived in app/src/data/categoryContent.js
UPDATE categories SET content = $json${"seoTitle":"Karwa Chauth Gift Hampers in Lucknow – Snekart","description":"Karwa Chauth gift hampers for your wife, with dry fruits for sargi and thoughtful keepsakes. Delivered across Lucknow by Snekart.","heading":"Karwa Chauth Gift Hampers – Delivered in Lucknow","intro":"She fasts from sunrise to moonrise. Say thank you with a hamper that feels as thoughtful as the day itself.","sections":[{"title":"Karwa Chauth gifts for your wife","body":"Karwa Chauth is a day of devotion — a nirjala fast kept from dawn until the moon rises, for the long life of a partner. The best gift is one that honours that effort: something she can enjoy once the fast is broken, and something she can keep.\n\nOur Karwa Chauth hampers pair premium dry fruits with curated keepsakes, packed beautifully so the moment you hand it over feels special — not like a last-minute purchase."},{"title":"What to put in a sargi hamper","body":"Sargi is the pre-dawn meal traditionally given by the mother-in-law before the fast begins. It needs to be nourishing and long-lasting: almonds, cashews, raisins, dates and other dry fruits are a classic choice because they give steady energy through a long day without water.\n\nOur dry fruit hampers and jars work well as a sargi gift, or as an addition to the thali."},{"title":"Karwa Chauth gift delivery in Lucknow","body":"Snekart is a Lucknow brand, and we deliver across the city — Gomti Nagar, Indira Nagar, Hazratganj, Aliganj, Mahanagar, Jankipuram, Alambagh and beyond. Order a few days before Karwa Chauth so your hamper arrives in good time for the day."}],"faqs":[{"q":"What is a good Karwa Chauth gift for wife?","a":"A gift that recognises her fast: a hamper of premium dry fruits to break the fast with, combined with a keepsake she can hold on to. Our Karwa Chauth hampers are curated around exactly that."},{"q":"Do you deliver Karwa Chauth gifts in Lucknow?","a":"Yes. Snekart is based in Lucknow and delivers across the city. We recommend ordering a few days before Karwa Chauth."},{"q":"What should be in a Karwa Chauth sargi hamper?","a":"Energy-rich foods that last through the day — almonds, cashews, raisins, dates and other dry fruits are the traditional choice. Our dry fruit hampers are a ready-made sargi option."}]}$json$ WHERE type = 'Festival' AND slug = 'karwa-chauth';
UPDATE categories SET content = $json${"seoTitle":"Diwali Gift Hampers in Lucknow – Snekart","description":"Diwali gift hampers for family, friends and clients — dry fruits, sweets and curated kits. Delivered across Lucknow by Snekart.","heading":"Diwali Gift Hampers – Delivered in Lucknow","intro":"Diwali gifting, made thoughtful. Curated hampers for the people who light up your year.","sections":[{"title":"Diwali gifts for family and friends","body":"Diwali is the biggest gifting moment of the year, and the boxes start to look the same. Our hampers are curated around a feeling — gratitude, warmth, celebration — so they say something more than \"Happy Diwali\".\n\nChoose from dry fruit hampers, festive kits and premium gift boxes across three price tiers, so there is something right for everyone on your list."},{"title":"Corporate Diwali gifting in Lucknow","body":"Gifting to employees, clients or partners? We put together Diwali hampers in bulk with consistent packaging and on-time delivery across Lucknow. Get in touch for corporate orders."},{"title":"Diwali gift delivery across Lucknow","body":"Snekart is a Lucknow brand. We deliver across the city — Gomti Nagar, Indira Nagar, Hazratganj, Aliganj, Mahanagar, Jankipuram, Alambagh and more. Diwali week is our busiest time, so order early to get your preferred delivery date."}],"faqs":[{"q":"What are good Diwali gift ideas?","a":"Dry fruit hampers are a timeless choice. For something more personal, pick a curated kit built around how you want the person to feel — grateful, celebrated or cared for."},{"q":"Do you deliver Diwali hampers in Lucknow?","a":"Yes. We deliver across Lucknow. Order early in Diwali week to secure your preferred delivery date."},{"q":"Do you take bulk or corporate Diwali orders?","a":"Yes. We handle corporate Diwali gifting for teams and clients in Lucknow, including bulk orders."}]}$json$ WHERE type = 'Festival' AND slug = 'diwali';
