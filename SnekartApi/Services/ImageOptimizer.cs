using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace SnekartApi.Services
{
    // Shrinks uploaded images before they're stored: phone/camera photos arrive as multi-MB
    // PNGs/JPEGs, but the site never shows them larger than ~600 CSS px. Used by
    // UploadsController for new uploads and by its optimize-existing endpoint for old ones.
    public static class ImageOptimizer
    {
        // Longest side after resizing — enough for the product page gallery on 2x screens.
        public const int MaxDimension = 1200;
        private const int WebpQuality = 80;

        // Rejects "decompression bombs": a small file that decodes to an enormous bitmap.
        // Review uploads are anonymous, so this guards memory on the server.
        private const long MaxPixels = 50_000_000;

        // FileFormat must be set explicitly: left unset, a PNG source is encoded as lossless WebP,
        // which is several times larger.
        private static readonly WebpEncoder Encoder = new() { FileFormat = WebpFileFormatType.Lossy, Quality = WebpQuality };

        public record Result(byte[] Data, string ContentType);

        // Returns the optimized image, or the original bytes unchanged when the input is a GIF
        // (keeps animation) or optimizing wouldn't make it smaller. Throws InvalidImageException
        // for files that aren't decodable images or are too large.
        public static async Task<Result> OptimizeAsync(byte[] original, string contentType)
        {
            if (contentType == "image/gif") return new Result(original, contentType);

            ImageInfo info;
            try
            {
                info = Image.Identify(original);
            }
            catch (Exception ex) when (ex is UnknownImageFormatException or InvalidImageContentException)
            {
                throw new InvalidImageException("That file isn't a valid image.");
            }

            if ((long)info.Width * info.Height > MaxPixels)
                throw new InvalidImageException("That image is too large. Please use one under 50 megapixels.");

            using var image = Image.Load(original);
            image.Mutate(x =>
            {
                x.AutoOrient();
                if (image.Width > MaxDimension || image.Height > MaxDimension)
                    x.Resize(new ResizeOptions { Mode = ResizeMode.Max, Size = new Size(MaxDimension, MaxDimension) });
            });

            using var output = new MemoryStream();
            await image.SaveAsync(output, Encoder);

            return output.Length < original.Length
                ? new Result(output.ToArray(), "image/webp")
                : new Result(original, contentType);
        }
    }

    public class InvalidImageException(string message) : Exception(message);
}
