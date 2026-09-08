using System.Data;

namespace SnekartApi.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
