using System.Linq.Expressions;

namespace Repositories
{
    public interface IBaseRepository<T> where T : class
    {


        Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? filter = null);
        Task<T?> GetByIdAsync(string id);
        Task AddAsync(T entity);
        void Update(T entity);
        void SoftDelete(T entity);
        Task SaveChangesAsync();
    }
}
