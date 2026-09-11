using System.Data;
using System.Text.Json;
using Dapper;

namespace SnekartApi.Data
{
    // List<string> columns (Product.Emotion/.Items/.Images/.Specifications, BlogPost.Emotion,
    // Review.Images) are stored as a JSON-array-in-text column (e.g. '["a","b"]') rather than
    // a native Postgres array, so this handler works unchanged regardless of the underlying
    // driver. This handler serializes on the way in and deserializes on the way out, so the
    // repository code never has to think about the JSON directly.
    public class StringListTypeHandler : SqlMapper.TypeHandler<List<string>>
    {
        public override List<string> Parse(object value)
        {
            var json = value as string;
            if (string.IsNullOrEmpty(json)) return new List<string>();
            return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
        }

        public override void SetValue(IDbDataParameter parameter, List<string>? value)
        {
            parameter.Value = value == null ? DBNull.Value : JsonSerializer.Serialize(value);
        }
    }
}
