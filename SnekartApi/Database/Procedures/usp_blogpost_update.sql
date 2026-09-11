-- publishedat is excluded on purpose — an edit never touches when the post first went live
-- (see BlogPostRepository.UpdateAsync).
CREATE OR REPLACE FUNCTION usp_blogpost_update(
    p_id INT, p_title VARCHAR(500), p_slug VARCHAR(255), p_category VARCHAR(100), p_emotion TEXT,
    p_excerpt TEXT, p_content TEXT, p_author VARCHAR(255), p_readtime VARCHAR(50),
    p_image VARCHAR(1000), p_video VARCHAR(1000), p_relatedproductids TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE blogposts
    SET title = p_title, slug = p_slug, category = p_category, emotion = p_emotion,
        excerpt = p_excerpt, content = p_content, author = p_author, readtime = p_readtime,
        image = p_image, video = p_video, relatedproductids = p_relatedproductids
    WHERE id = p_id;

    RETURN FOUND;
END;
$$;
