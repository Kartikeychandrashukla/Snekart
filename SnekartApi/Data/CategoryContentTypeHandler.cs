using System.Data;
using System.Text.Json;
using Dapper;
using SnekartApi.Models;

namespace SnekartApi.Data
{
    // Same JSON-in-text-column strategy as StringListTypeHandler, for Category.Content.
    // Uses camelCase keys so the stored JSON matches what the API sends to the frontend.
    public class CategoryContentTypeHandler : SqlMapper.TypeHandler<CategoryContent?>
    {
        public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

        public override CategoryContent? Parse(object value)
        {
            var json = value as string;
            if (string.IsNullOrEmpty(json)) return null;
            return JsonSerializer.Deserialize<CategoryContent>(json, Options);
        }

        public override void SetValue(IDbDataParameter parameter, CategoryContent? value)
        {
            parameter.Value = value == null ? DBNull.Value : JsonSerializer.Serialize(value, Options);
        }
    }
}
