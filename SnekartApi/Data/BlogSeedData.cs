namespace SnekartApi.Data
{
    using SnekartApi.Models;

    // One-time seed for the journal posts that used to live in the frontend's static posts array.
    // RelatedProductIds are resolved against already-seeded products by slug, so this must run
    // after ProductSeedData in Program.cs.
    public static class BlogSeedData
    {
        public static List<BlogPost> GetSeedPosts(Dictionary<string, int> productIdBySlug)
        {
            int Kit(string slug) => productIdBySlug.TryGetValue(slug, out var id) ? id : 0;

            var posts = new List<(string Title, string Category, List<string> Emotion, string Excerpt, string Content, string Date, string Image, List<string> RelatedSlugs)>
            {
                (
                    "Why your emotions deserve a ritual, not just a reaction",
                    "Self-Care",
                    new() { "anxious", "overwhelmed" },
                    "We're taught to manage emotions — suppress, redirect, move on. But what if honouring them was the healthier choice? Here's what the research says.",
                    "Most of us grew up learning to manage our emotions the way we manage a leaking tap — patch it, ignore it, hope it stops. Suppress the tears before the meeting. Redirect the anger into a run. Move on from the sadness because there's work to do.\n\nBut a growing body of research on emotional regulation suggests the opposite approach works better: naming what you feel, giving it a moment of deliberate attention, and only then choosing how to respond. Psychologists call this 'affect labelling' — simply putting a word to an emotion measurably lowers activity in the amygdala, the brain's alarm system.\n\nThis is the idea behind a ritual instead of a reaction. A ritual is slow, repeatable, and intentional. A reaction is fast, automatic, and often regretted. When you turn toward a feeling with a five-minute ritual — lighting a candle, writing three lines in a journal, brewing a specific tea — you're not indulging the emotion. You're giving your nervous system the pause it needs to actually process it.\n\nWe built our starter kits around this exact principle. Every kit pairs a physical, sensory anchor (scent, texture, taste) with a prompt that asks you to sit with the feeling for just a few minutes before you decide what to do next. It's a small ritual, but it changes the relationship — from 'this emotion is a problem to fix' to 'this emotion is information to hear.'\n\nNext time something hits — a wave of anxiety, a flash of anger, a quiet sadness — try resisting the urge to immediately fix it. Give it sixty seconds of a ritual first. You might find the reaction that follows is a much better one.",
                    "2025-06-15",
                    "https://picsum.photos/seed/blog1/600/400",
                    new() { "journal-starter-kit", "know-yourself-kit" }
                ),
                (
                    "The problem with gifting in India — and how we're fixing it",
                    "Gifting",
                    new() { "loved" },
                    "Chocolates and dry fruits. Every time. There's a better way to show someone you actually understand what they're going through.",
                    "Open any gifting app in India and you'll see the same three categories on repeat: chocolates, dry fruits, and generic flowers. They're safe. They're forgettable. And they say almost nothing about the person receiving them or what they're actually going through.\n\nThink about the last time you genuinely needed a gift — not for a wedding or a festival, but for a friend going through a breakup, a sibling drowning in exam stress, a colleague clearly burnt out. What did you send? Probably nothing, because nothing on the shelf felt right. The gifting industry in India has optimized for occasions, not emotions.\n\nWe think that's backwards. A gift should say 'I see exactly what you're dealing with,' not 'I remembered your birthday is this week.' That's why every kit at Snekart starts with a feeling, not a festival — anxiety, heartbreak, burnout, loneliness, celebration — and is built specifically around what actually helps in that state.\n\nAn anxious friend before an exam doesn't need chocolates. They need something that acknowledges the specific tightness in their chest and gives them a small, physical way to loosen it. A friend mid-breakup doesn't need flowers that wilt in three days. They need permission to feel bad and a few tools to get through the worst nights.\n\nThat's the shift we're building toward — from generic gifting to emotion-first gifting. Not because it's a clever marketing angle, but because it's simply more useful. A gift that's right for the moment gets used. A gift that's right for the occasion just gets photographed for a story.",
                    "2025-06-22",
                    "https://picsum.photos/seed/blog2/600/400",
                    new() { "the-love-kit", "friendship-forever-kit" }
                ),
                (
                    "5 things to do when anxiety hits at 2am",
                    "Self-Care",
                    new() { "anxious" },
                    "No phone. No doomscrolling. Just five things that genuinely help when your mind won't stop — from scent to breath to the right kind of distraction.",
                    "2am anxiety has a specific texture. It's not the productive, solvable kind of worry — it's the loop that has no exit, made worse by the fact that everyone else is asleep and the silence makes every thought louder. Here's what actually helps, based on what sleep and anxiety researchers (and a lot of trial and error) point to.\n\n1. Don't reach for your phone. The blue light aside, doomscrolling gives your anxious brain an infinite feed of new things to worry about. If you need a distraction, keep something physical by your bed — a book, a puzzle, anything that doesn't have a notifications badge.\n\n2. Try box breathing. Inhale for four counts, hold for four, exhale for four, hold for four. It sounds too simple to work, but it directly engages your vagus nerve and tells your nervous system the emergency is over, even when your thoughts haven't caught up yet.\n\n3. Use scent as an anchor. Lavender in particular has decent evidence behind it for reducing subjective anxiety and improving sleep onset. Keep a roller or a sachet on your nightstand — the physical act of reaching for it and breathing it in interrupts the spiral.\n\n4. Write the thought down, don't solve it. At 2am your brain is not equipped to solve anything. Writing one line — 'worried about the presentation tomorrow' — offloads it from your working memory without demanding you fix it right now.\n\n5. Change your physical position. Sitting up, putting your feet on the floor, even just turning the pillow over resets the sensory loop your brain has built around 'lying here, awake, worried.' Small physical changes signal a fresh start to an anxious mind.\n\nNone of these will erase anxiety. But on the nights it shows up uninvited, they're the difference between an hour of spiralling and getting back to sleep in fifteen minutes.",
                    "2025-07-01",
                    "https://picsum.photos/seed/blog3/600/400",
                    new() { "anxiety-relief-kit", "good-luck-kit" }
                ),
                (
                    "Building India's first Emotion Community — why and how",
                    "Community",
                    new() { "loved", "calm" },
                    "Most brands build followings. We want to build something rarer — a space where people feel genuinely seen, regardless of what they're going through.",
                    "Most D2C brands measure community by follower count. We think that's the wrong metric entirely. A follower is someone who watches your posts. A community is someone who shows up when things are hard and stays when things are good.\n\nWhen we started Snekart, the plan was never just 'sell emotion-themed gift kits.' It was to build the space that doesn't really exist yet in India — a place where saying 'I'm not okay right now' isn't met with silence or a forced pep talk, but with people who've been there too.\n\nThat's the thinking behind what we're building on Instagram and Discord: not a broadcast channel for product drops, but rotating threads on burnout, anonymous check-ins during exam season, and a genuinely two-way conversation about the emotions our kits are named after. The kits are almost secondary — they're an entry point into a conversation people weren't having anywhere else.\n\nWe're early. The community is still small, and honestly a little rough around the edges. But every week we hear from someone who says a thread helped them more than the product did, and that tells us we're building the right thing.\n\nIf you've ever felt like the internet has a place for every hobby except 'quietly going through something,' that's the gap we're trying to close. Come find us — we'd rather build this with you than for you.",
                    "2025-07-05",
                    "https://picsum.photos/seed/blog4/600/400",
                    new() { "self-love-kit" }
                ),
                (
                    "The science behind scent and mood — what's actually happening",
                    "Self-Care",
                    new() { "calm", "overwhelmed" },
                    "Why does a certain candle make you feel calm instantly? Why does lavender work? We break down the neuroscience without the jargon.",
                    "There's a reason a specific smell can drop your shoulders half an inch before you've even registered why. Of all your senses, smell is the only one with a direct line to the amygdala and hippocampus — the brain's emotion and memory centers — bypassing the more 'logical' processing that sight and sound go through first.\n\nThat's why scent memories feel so immediate and involuntary. You don't decide to feel calm when you smell lavender; you just do, because the olfactory signal is landing directly in the parts of your brain that handle mood and memory, with no detour through conscious thought.\n\nLavender specifically has reasonable clinical evidence behind it — several small studies link inhaled lavender to reduced cortisol and improved subjective calm, which is part of why it shows up in so many sleep and anxiety products. Citrus scents tend to do the opposite, correlating with alertness and mild mood lift, which is why they show up in 'energy' or 'motivation' products instead.\n\nThis is also why scent is one of the fastest tools for emotional regulation — faster than journaling, faster than a walk, sometimes faster than a conversation. It doesn't require you to think your way out of a feeling. It works on a more primal, immediate level.\n\nIt's part of why every Snekart kit includes a scent element, whether that's a sachet, a candle, or an essential oil roller — not as a nice-to-have add-on, but because it's genuinely one of the fastest paths from 'overwhelmed' to 'a little more okay,' backed by how your brain is actually wired.",
                    "2025-07-10",
                    "https://picsum.photos/seed/blog5/600/400",
                    new() { "ultimate-self-care-kit" }
                ),
                (
                    "How to gift someone going through a hard time",
                    "Gifting",
                    new() { "sad", "loved" },
                    "It's not about the price tag. It's about showing up correctly. A guide to thoughtful gifting for loss, heartbreak, burnout, and everything in between.",
                    "There's a specific kind of anxiety that comes with gifting someone who's struggling. Say too little and it feels dismissive. Say too much and it feels performative. Get the tone wrong and a gift meant to comfort can land as tone-deaf instead. Here's how to actually get it right.\n\nFirst, resist the urge to fix. Most gifts for hard times unintentionally carry the message 'here's how to feel better now,' which can feel dismissive of what someone is actually going through. The better message is 'I see this is hard, and I'm not going anywhere.' A gift that gives permission to feel bad — rather than pressure to feel better — almost always lands better.\n\nSecond, match the gift to the specific hard thing, not just 'sad' in general. Grief, heartbreak, and burnout are not interchangeable — someone grieving needs space and gentleness, someone heartbroken often needs a mix of comfort and a little bit of fun distraction, and someone burnt out needs explicit permission to rest. Generic 'get well soon' gifts flatten very different experiences into one.\n\nThird, include something that requires no effort to use. When someone is deep in a hard time, anything that requires assembly, decisions, or motivation to enjoy will sit unused. Comfort food, a ready-to-use candle, a pre-written card — low-effort-to-enjoy is a feature, not a limitation.\n\nFinally, don't disappear after the gift arrives. A thoughtful kit paired with a text a week later — 'thinking of you, no need to reply' — does more for someone than the kit alone ever could. The gift opens the door. Showing up is what actually walks through it.",
                    "2025-07-15",
                    "https://picsum.photos/seed/blog6/600/400",
                    new() { "deep-healing-kit", "heartbreak-healing-kit" }
                ),
            };

            return posts.Select(p => new BlogPost
            {
                Title             = p.Title,
                Slug              = Slugify(p.Title),
                Category          = p.Category,
                Emotion           = p.Emotion,
                Excerpt           = p.Excerpt,
                Content           = p.Content,
                Author            = "Snekart Team",
                ReadTime          = EstimateReadTime(p.Content),
                Image             = p.Image,
                PublishedAt       = DateTime.SpecifyKind(DateTime.Parse(p.Date), DateTimeKind.Utc),
                RelatedProductIds = p.RelatedSlugs.Select(Kit).Where(id => id != 0).ToList(),
            }).ToList();
        }

        private static string EstimateReadTime(string content)
        {
            var wordCount = content.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
            var minutes = Math.Max(1, (int)Math.Ceiling(wordCount / 200.0));
            return $"{minutes} min read";
        }

        private static string Slugify(string value)
        {
            var slug = value.Trim().ToLowerInvariant();
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[\s-]+", "-").Trim('-');
            return slug;
        }
    }
}
