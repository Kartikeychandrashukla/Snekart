using System.Data;
using System.Text.Json;
using Dapper;

namespace SnekartApi.Data
{
    // Same JSON-in-text-column strategy as StringListTypeHandler, for List<int> columns
    // (BlogPost.RelatedProductIds).
    public class IntListTypeHandler : SqlMapper.TypeHandler<List<int>>
    {
        public override List<int> Parse(object value)
        {
            var json = value as string;
            if (string.IsNullOrEmpty(json)) return new List<int>();
            return JsonSerializer.Deserialize<List<int>>(json) ?? new List<int>();
        }

        public override void SetValue(IDbDataParameter parameter, List<int>? value)
        {
            parameter.Value = value == null ? DBNull.Value : JsonSerializer.Serialize(value);
        }
    }
}
