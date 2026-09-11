CREATE OR REPLACE FUNCTION usp_blogpost_add(
    p_title VARCHAR(500), p_slug VARCHAR(255), p_category VARCHAR(100), p_emotion TEXT,
    p_excerpt TEXT, p_content TEXT, p_author VARCHAR(255), p_readtime VARCHAR(50),
    p_image VARCHAR(1000), p_video VARCHAR(1000), p_publishedat TIMESTAMPTZ, p_relatedproductids TEXT
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO blogposts (title, slug, category, emotion, excerpt, content, author, readtime,
                            image, video, publishedat, relatedproductids)
    VALUES (p_title, p_slug, p_category, p_emotion, p_excerpt, p_content, p_author, p_readtime,
            p_image, p_video, p_publishedat, p_relatedproductids);
END;
$$;
