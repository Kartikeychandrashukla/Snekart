CREATE OR REPLACE FUNCTION usp_blogpost_getbyslug(p_slug VARCHAR(255))
RETURNS TABLE (
    id INT, title VARCHAR(500), slug VARCHAR(255), category VARCHAR(100), emotion TEXT,
    excerpt TEXT, content TEXT, author VARCHAR(255), readtime VARCHAR(50), image VARCHAR(1000),
    video VARCHAR(1000), publishedat TIMESTAMPTZ, relatedproductids TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT b.id, b.title, b.slug, b.category, b.emotion, b.excerpt, b.content, b.author,
           b.readtime, b.image, b.video, b.publishedat, b.relatedproductids
    FROM blogposts b
    WHERE b.slug = p_slug;
END;
$$;
