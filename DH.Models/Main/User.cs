using Microsoft.AspNetCore.Identity;

namespace DH.Models.Main
{
    public sealed class User : IdentityUser
    {
        #region Custom

        #endregion

        #region Overrides
        public override string ToString()
        {
            return UserName ?? string.Empty;
        }
        #endregion
    }
}
