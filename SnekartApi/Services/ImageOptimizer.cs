using SkiaSharp;

namespace SnekartApi.Services
{
    // Shrinks uploaded images before they're stored: phone/camera photos arrive as multi-MB
    // PNGs/JPEGs, but the site never shows them larger than ~600 CSS px. Used by
    // UploadsController for new uploads and by its optimize-existing endpoint for old ones.
    // SkiaSharp (MIT) rather than ImageSharp, whose current releases need a paid license key
    // to build in Release mode.
    public static class ImageOptimizer
    {
        // Longest side after resizing — enough for the product page gallery on 2x screens.
        public const int MaxDimension = 1200;

        // Skia encodes WebP lossily for any quality below 100.
        private const int WebpQuality = 80;

        // Rejects "decompression bombs": a small file that decodes to an enormous bitmap.
        // Review uploads are anonymous, so this guards memory on the server.
        private const long MaxPixels = 50_000_000;

        public record Result(byte[] Data, string ContentType);

        // Returns the optimized image, or the original bytes unchanged when the input is a GIF
        // (keeps animation) or optimizing wouldn't make it smaller. Throws InvalidImageException
        // for files that aren't decodable images or are too large.
        public static Task<Result> OptimizeAsync(byte[] original, string contentType)
        {
            if (contentType == "image/gif") return Task.FromResult(new Result(original, contentType));

            using var codec = SKCodec.Create(new SKMemoryStream(original))
                ?? throw new InvalidImageException("That file isn't a valid image.");

            if ((long)codec.Info.Width * codec.Info.Height > MaxPixels)
                throw new InvalidImageException("That image is too large. Please use one under 50 megapixels.");

            using var decoded = SKBitmap.Decode(codec)
                ?? throw new InvalidImageException("That file isn't a valid image.");

            using var oriented = ApplyOrientation(decoded, codec.EncodedOrigin);
            using var resized = ResizeToFit(oriented);
            using var image = SKImage.FromBitmap(resized);
            using var encoded = image.Encode(SKEncodedImageFormat.Webp, WebpQuality);

            var data = encoded.ToArray();
            return Task.FromResult(data.Length < original.Length
                ? new Result(data, "image/webp")
                : new Result(original, contentType));
        }

        // Phone photos are often stored sideways with an EXIF "rotate me" flag; bake the rotation
        // into the pixels since WebP output won't carry that flag. Mirrored origins aren't
        // produced by phone cameras, so only the three rotations are handled.
        private static SKBitmap ApplyOrientation(SKBitmap source, SKEncodedOrigin origin)
        {
            var swap = origin is SKEncodedOrigin.RightTop or SKEncodedOrigin.LeftBottom;
            if (origin is not (SKEncodedOrigin.BottomRight or SKEncodedOrigin.RightTop or SKEncodedOrigin.LeftBottom))
                return source.Copy();

            var width  = swap ? source.Height : source.Width;
            var height = swap ? source.Width : source.Height;
            var rotated = new SKBitmap(source.Info.WithSize(width, height));

            using var canvas = new SKCanvas(rotated);
            switch (origin)
            {
                case SKEncodedOrigin.BottomRight: // 180°
                    canvas.RotateDegrees(180, width / 2f, height / 2f);
                    break;
                case SKEncodedOrigin.RightTop:    // 90° clockwise
                    canvas.Translate(width, 0);
                    canvas.RotateDegrees(90);
                    break;
                case SKEncodedOrigin.LeftBottom:  // 90° counter-clockwise
                    canvas.Translate(0, height);
                    canvas.RotateDegrees(270);
                    break;
            }
            using var sourceImage = SKImage.FromBitmap(source);
            canvas.DrawImage(sourceImage, 0, 0, SKSamplingOptions.Default);
            return rotated;
        }

        private static SKBitmap ResizeToFit(SKBitmap source)
        {
            var longest = Math.Max(source.Width, source.Height);
            if (longest <= MaxDimension) return source.Copy();

            var scale = (double)MaxDimension / longest;
            var info = source.Info.WithSize(
                Math.Max(1, (int)Math.Round(source.Width * scale)),
                Math.Max(1, (int)Math.Round(source.Height * scale)));

            return source.Resize(info, new SKSamplingOptions(SKCubicResampler.Mitchell))
                ?? throw new InvalidImageException("That image couldn't be resized.");
        }
    }

    public class InvalidImageException(string message) : Exception(message);
}
